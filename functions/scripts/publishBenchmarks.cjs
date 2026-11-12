const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const repoRoot = path.resolve(__dirname, '../..');
const sourcePath = path.join(repoRoot, 'src/data/constructionMarketBenchmarks.ts');
const outputPath = path.join(repoRoot, 'src/data/publishedMarketBenchmarks.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = Module._nodeModulePaths(path.dirname(sourcePath));
loaded._compile(compiled, sourcePath);

const bundledBaseline = loaded.exports.CONSTRUCTION_MARKET_BENCHMARKS;
const countryCodes = ['LB', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'EG', 'IQ'];

function validateCountries(countries) {
  if (!countries || typeof countries !== 'object' || countryCodes.some(code => !countries[code])) {
    throw new Error('Benchmark document must contain all nine supported countries: ' + countryCodes.join(', '));
  }
  for (const code of countryCodes) {
    const country = countries[code];
    if (!country.currency || !Array.isArray(country.benchmarks)) {
      throw new Error(`Invalid benchmark data for ${code}`);
    }
    for (const item of country.benchmarks) {
      if (!item.item || !Number.isFinite(item.value) || !item.unit || !item.source || !item.checkedAt) {
        throw new Error(`Invalid benchmark entry in ${code}`);
      }
    }
  }
}

async function main() {
  initializeApp({ credential: applicationDefault(), projectId: 'danat-build' });
  const db = getFirestore();
  const currentRef = db.doc('constructionMarketBenchmarks/current');
  const snapshot = await currentRef.get();

  let published;
  if (!snapshot.exists) {
    // One-time bootstrap only: seed Firebase from the existing checked-in data.
    // Future monthly runs read the Firebase master document and do not overwrite it.
    published = {
      version: '2026-11-11',
      publishedAt: '2026-11-11',
      countries: bundledBaseline,
      countryCount: countryCodes.length,
    };
    validateCountries(published.countries);
    await currentRef.create(published);
    console.log('Firebase benchmark master was missing; initialized it once from the bundled baseline.');
  } else {
    published = snapshot.data();
    validateCountries(published.countries);
    if (typeof published.version !== 'string' || typeof published.publishedAt !== 'string') {
      throw new Error('Firebase benchmark master must include string version and publishedAt fields.');
    }
  }

  const generated = `import { ConstructionMarketBenchmarks } from './constructionMarketBenchmarks';

export type PublishedMarketBenchmarks = {
  version: string;
  publishedAt: string;
  countries: Record<'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH' | 'EG' | 'IQ', ConstructionMarketBenchmarks>;
};

// Generated from the Firebase benchmark master during publishing.
// The app imports this static snapshot and performs no benchmark Firestore reads.
export const PUBLISHED_MARKET_BENCHMARKS: PublishedMarketBenchmarks = ${JSON.stringify({
    version: published.version,
    publishedAt: published.publishedAt,
    countries: published.countries,
  }, null, 2)};
`;
  fs.writeFileSync(outputPath, generated, 'utf8');
  console.log(`Bundled Firebase benchmark version ${published.version} (${published.publishedAt}) for ${countryCodes.length} countries into ${path.relative(repoRoot, outputPath)}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
