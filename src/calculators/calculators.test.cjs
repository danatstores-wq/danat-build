const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateConcrete } = require('./concrete.js');
const { calculateTiles } = require('./tiles.js');
const { calculatePaint } = require('./paint.js');
const { calculateBlocks } = require('./blocks.js');
const { calculateSandCement } = require('./sand.js');
const { calculateProjectCost } = require('./cost.js');

test('concrete includes the selected wastage percentage', () => {
  assert.ok(Math.abs(calculateConcrete(5, 4, 0.15, 10) - 3.3) < 1e-9);
});

test('tiles rounds the purchase quantity up after wastage', () => {
  const result = calculateTiles(5, 4, 60, 60, 10);
  assert.equal(result.recommendedTiles, 62);
  assert.equal(result.floorArea, 20);
});

test('paint deducts openings and accounts for coats and wastage', () => {
  const result = calculatePaint(5, 3, 4, 2, 10, 10, 6);
  assert.equal(result.wallArea, 54);
  assert.equal(result.recommendedLitres, 12);
});

test('blocks deduct openings and round the recommended quantity up', () => {
  const result = calculateBlocks(5, 3, 40, 20, 5, 2);
  assert.equal(result.wallArea, 13);
  assert.equal(result.recommendedBlocks, 171);
});

test('sand and cement uses the dry-volume factor and bag weight', () => {
  const result = calculateSandCement(1, 1, 1, 1, 4);
  assert.equal(result.dryVolume, 1.33);
  assert.equal(result.cementBags, 8);
  assert.equal(result.sandVolume, 1.064);
});

test('project cost applies contingency to the full subtotal', () => {
  const result = calculateProjectCost(2000, 1000, 300, 200, 10);
  assert.equal(result.subtotal, 3500);
  assert.equal(result.contingency, 350);
  assert.equal(result.totalCost, 3850);
});

test('calculators reject invalid dimensions, wastage, and costs', () => {
  assert.throws(() => calculateConcrete(0, 2, 0.1), /greater than zero/);
  assert.throws(() => calculateTiles(2, 2, 60, 60, 101), /Wastage/);
  assert.throws(() => calculatePaint(5, 3, 4, 2, 10, 10, 100), /greater than zero|smaller/);
  assert.throws(() => calculateBlocks(5, 3, 40, 20, 5, 15), /smaller than wall area/);
  assert.throws(() => calculateSandCement(1, 1, 1, 0, 4), /greater than zero/);
  assert.throws(() => calculateProjectCost(-1, 0), /cannot be negative/);
});
