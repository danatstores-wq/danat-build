import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateBuildingQuantities } from './buildingQuantityEstimator.ts';

const closeTo = (actual, expected, label) => {
  assert.ok(
    Math.abs(Number(actual) - expected) < 1e-8,
    `${label}: expected ${expected}, received ${actual}`
  );
};

const floor = {
  length: '15',
  width: '12',
  height: '3',
  openings: '12',
  partitions: '30',
};

const values = {
  footingCount: '12',
  footingLength: '1.5',
  footingWidth: '1.5',
  footingDepth: '0.5',
  excavationDepth: '0.8',
  columnCount: '12',
  columnWidth: '0.3',
  columnDepth: '0.3',
  beamLength: '120',
  beamWidth: '0.25',
  beamDepth: '0.5',
  slabThickness: '0.18',
  stairVolume: '2',
  tileWaste: '10',
  paintCoverage: '10',
  paintCoats: '2',
  waterproof: '180',
};

test('360 m² two-floor example calculates separate concrete and reinforcement quantities', () => {
  const result = estimateBuildingQuantities(
    [floor, { ...floor, id: undefined }],
    values,
    'metric'
  );
  const q = key => result[`${key}Qty`];

  closeTo(Number(q('slabConcrete')) / 0.18, 360, 'total floor area');
  closeTo(q('excavation'), 21.6, 'foundation excavation');
  closeTo(q('footingConcrete'), 13.5, 'footing concrete');
  closeTo(q('foundationSteel'), 1080, 'foundation reinforcement');
  closeTo(q('columnConcrete'), 6.48, 'column concrete');
  closeTo(q('beamConcrete'), 15, 'beam concrete');
  closeTo(q('slabConcrete'), 64.8, 'slab concrete');
  closeTo(q('stairConcrete'), 2, 'stair concrete');
  closeTo(q('structuralSteel'), 9710.8, 'structural reinforcement');
  closeTo(q('externalBlocks'), 300, 'net external wall area');
  closeTo(q('internalBlocks'), 60, 'internal partition area');
  closeTo(q('internalPlaster'), 420, 'internal plaster area');
  closeTo(q('externalPlaster'), 300, 'external plaster area');
  closeTo(q('ceilingPlaster'), 360, 'ceiling plaster area');
  closeTo(q('floorTiles'), 396, 'floor tiles including 10% waste');
});

test('empty floor list returns a zeroed catalogue without throwing', () => {
  const result = estimateBuildingQuantities([], values, 'metric');
  assert.equal(Number(result.excavationQty), 0);
  assert.equal(Number(result.foundationSteelQty), 0);
  assert.equal(Number(result.structuralSteelQty), 0);
});
