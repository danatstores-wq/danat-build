const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const repoRoot = path.resolve(__dirname, '../..');
const sourcePath = path.join(repoRoot, 'src/data/constructionMarketBenchmarks.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = Module._nodeModulePaths(path.dirname(sourcePath));
loaded._compile(compiled, sourcePath);

const countries = loaded.exports.CONSTRUCTION_MARKET_BENCHMARKS;
if (!countries || Object.keys(countries).length !== 9) {
  throw new Error('Expected benchmark data for all nine supported countries.');
}
for (const [code, country] of Object.entries(countries)) {
  if (!country.currency || !Array.isArray(country.benchmarks)) {
    throw new Error(`Invalid benchmark data for ${code}`);
  }
  for (const item of country.benchmarks) {
    if (!item.item || !Number.isFinite(item.value) || !item.unit || !item.source || !item.checkedAt) {
      throw new Error(`Invalid benchmark entry in ${code}`);
    }
  }
}

async function publish() {
  initializeApp({ credential: applicationDefault(), projectId: 'danat-build' });
  const db = getFirestore();
  const version = '2026-11-11';
  const publishedAt = new Date().toISOString();
  const payload = { version, publishedAt, countries, countryCount: Object.keys(countries).length };
  await db.doc(`constructionMarketBenchmarks/versions/${version}`).set(payload);
  await db.doc('constructionMarketBenchmarks/current').set(payload);
  console.log(`Published benchmark version ${version} for ${payload.countryCount} countries.`);
}
publish().catch(error => { console.error(error); process.exitCode = 1; });
