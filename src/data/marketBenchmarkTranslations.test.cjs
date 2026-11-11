const test = require('node:test');
const assert = require('node:assert/strict');
const { marketBenchmarkLabel, marketBenchmarkSourceLabel } = require('../../.test-build/data/marketBenchmarkTranslations.js');

test('Saudi market benchmark item names are translated into Arabic and French', () => {
  assert.equal(marketBenchmarkLabel('black cement', 'ar'), 'أسمنت أسود');
  assert.equal(marketBenchmarkLabel('black cement', 'fr'), 'Ciment noir');
  assert.equal(marketBenchmarkLabel('12 mm rebar', 'ar'), 'حديد تسليح قطر 12 مم');
  assert.equal(marketBenchmarkLabel('12 mm rebar', 'fr'), 'Barre d’armature de 12 mm');
});

test('market benchmark notes and units are translated without changing English', () => {
  const note = 'GASTAT September 2026 national average; VAT included.';
  assert.match(marketBenchmarkLabel(note, 'ar'), /الهيئة العامة للإحصاء/);
  assert.match(marketBenchmarkLabel(note, 'fr'), /TVA comprise/);
  assert.equal(marketBenchmarkLabel('m³', 'ar'), 'م³');
  assert.equal(marketBenchmarkLabel('m³', 'fr'), 'm³');
  assert.equal(marketBenchmarkLabel('black cement', 'en'), 'black cement');
});

test('all translated labels fall back safely when no translation exists', () => {
  assert.equal(marketBenchmarkLabel('unmapped source label', 'ar'), 'unmapped source label');
  assert.equal(marketBenchmarkLabel('unmapped source label', 'fr'), 'unmapped source label');
});


test('benchmark source labels are human-readable and localized', () => {
  const source = 'https://prices.qsmind.app/en/uae/labour';
  assert.equal(marketBenchmarkSourceLabel(source, 'en'), 'QSMind – labour market survey');
  assert.match(marketBenchmarkSourceLabel(source, 'ar'), /QSMind/);
  assert.match(marketBenchmarkSourceLabel(source, 'fr'), /QSMind/);
});
