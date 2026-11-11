type Units = 'metric' | 'imperial';

type FloorInput = {
  length: string;
  width: string;
  height: string;
  openings: string;
  partitions: string;
};

type QuantityMap = Record<string, string>;

const FT_TO_M = 0.3048;
const SQFT_TO_SQM = 0.09290304;
const CUFT_TO_CUM = 0.028316846592;

const safe = (value: string | undefined, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const ceil = (value: number) => Math.ceil(Math.max(0, value));

export function estimateBuildingQuantities(
  floors: FloorInput[],
  values: Record<string, string>,
  units: Units
): QuantityMap {
  const toMetricLength = (n: number) =>
    units === 'imperial' ? n * FT_TO_M : n;

  const toMetricArea = (n: number) =>
    units === 'imperial' ? n * SQFT_TO_SQM : n;

  const toMetricVolume = (n: number) =>
    units === 'imperial' ? n * CUFT_TO_CUM : n;

  const v = (key: string) => {
    const n = safe(values[key]);
    const lengthKeys = [
      'footingLength', 'footingWidth', 'footingDepth',
      'excavationDepth', 'columnWidth', 'columnDepth',
      'beamLength', 'beamWidth', 'beamDepth', 'slabThickness',
    ];

    if (lengthKeys.includes(key)) return toMetricLength(n);
    if (key === 'waterproof') return toMetricArea(n);
    if (key === 'stairVolume') return toMetricVolume(n);
    return n;
  };

  const floorData = floors.map(floor => {
    const length = toMetricLength(safe(floor.length));
    const width = toMetricLength(safe(floor.width));
    const height = toMetricLength(safe(floor.height));
    const openings = toMetricArea(safe(floor.openings));
    const partitions = toMetricArea(safe(floor.partitions));
    const area = length * width;
    const grossExternalWalls = 2 * (length + width) * height;
    const netExternalWalls = Math.max(0, grossExternalWalls - openings);

    return {
      length,
      width,
      height,
      area,
      openings,
      partitions,
      grossExternalWalls,
      netExternalWalls,
      perimeter: 2 * (length + width),
    };
  });

  const result: QuantityMap = {};
  const ids = [
    'excavation', 'soilRemoval', 'backfilling', 'soilCompaction',
    'sitePreparation', 'leanConcrete', 'footingConcrete',
    'foundationSteel', 'foundationFormwork',
    'foundationWaterproofing', 'columnConcrete', 'beamConcrete', 'stairConcrete',
    'slabConcrete', 'structuralSteel', 'columnFormwork',
    'beamFormwork', 'slabFormwork', 'scaffolding',
    'externalBlocks', 'internalBlocks', 'cementMasonry',
    'sandMasonry', 'lintels', 'roofThermalInsulation',
    'roofWaterproofing', 'roofScreed', 'roofProtection',
    'roofDrainage', 'internalPlaster', 'externalPlaster',
    'ceilingPlaster', 'plasterMesh', 'plasterMaterials',
    'lightingPoints', 'singleSockets', 'doubleSockets',
    'acPoints', 'waterHeaterPoints', 'tvPoints',
    'internetPoints', 'switchPoints', 'distributionBoard',
    'electricalCables', 'electricalConduits', 'grounding',
    'coldWaterPoints', 'hotWaterPoints', 'toiletConnections',
    'showerConnections', 'basinConnections', 'kitchenConnections',
    'drainagePipes', 'waterPipes', 'waterTank', 'waterPump',
    'toilets', 'washBasins', 'showers', 'faucets',
    'sanitaryAccessories', 'elevatorCabin', 'elevatorMotor',
    'elevatorController', 'elevatorRails', 'elevatorLandingDoors',
    'elevatorCables', 'elevatorSafety', 'elevatorInstallation',
    'floorTiles', 'wallTiles', 'tileAdhesive', 'tileGrout',
    'skirting', 'internalDoors', 'externalDoors', 'aluminumWindows',
    'glassWork', 'doorHardware', 'wallPrimer', 'wallPutty',
    'interiorPaint', 'exteriorPaint', 'metalWoodPaint',
    'falseCeiling', 'ceilingFrame', 'ceilingInsulation',
    'ceilingAccessPanels', 'ceilingFinishing', 'facadeFinish',
    'externalPaving', 'balustrades', 'externalStairs',
    'landscaping', 'transport', 'wasteDisposal', 'permits',
    'siteManagement', 'miscellaneous',
  ];

  ids.forEach(id => {
    result[`${id}Qty`] = '0';
  });

  if (floorData.length === 0) return result;

  const totalArea = floorData.reduce((sum, f) => sum + f.area, 0);
  const totalHeight = floorData.reduce((sum, f) => sum + f.height, 0);
  const externalWallArea = floorData.reduce(
    (sum, f) => sum + f.netExternalWalls, 0
  );
  const partitionArea = floorData.reduce(
    (sum, f) => sum + f.partitions, 0
  );
  const openingsArea = floorData.reduce(
    (sum, f) => sum + f.openings, 0
  );
  const perimeterTotal = floorData.reduce(
    (sum, f) => sum + f.perimeter, 0
  );
  const wallArea = externalWallArea + partitionArea;
  const roof = floorData[floorData.length - 1].area;

  const footingCount = v('footingCount');
  const footingLength = v('footingLength');
  const footingWidth = v('footingWidth');
  const footingDepth = v('footingDepth');
  const excavationDepth = v('excavationDepth');

  const footingConcrete =
    footingCount * footingLength * footingWidth * footingDepth;

  const excavation =
    footingCount * footingLength * footingWidth * excavationDepth;

  const columnCount = v('columnCount');
  const columnWidth = v('columnWidth');
  const columnDepth = v('columnDepth');

  const columnConcrete =
    columnCount * columnWidth * columnDepth * totalHeight;

  const beamConcrete =
    v('beamLength') * v('beamWidth') * v('beamDepth');

  const slabConcrete = totalArea * v('slabThickness');
  const structuralConcrete =
    columnConcrete + beamConcrete + slabConcrete;

  const foundationFormwork =
    footingCount * 2 * (footingLength + footingWidth) * footingDepth;

  const columnFormwork =
    columnCount * 2 * (columnWidth + columnDepth) * totalHeight;

  const beamFormwork =
    v('beamLength') * (2 * v('beamDepth') + v('beamWidth'));

  const blockArea = wallArea;
  const plasterMultiplier = safe(values.plaster, 2);
  const plasterArea = wallArea * plasterMultiplier;
  const ceilingArea = totalArea;

  const tileWaste = safe(values.tileWaste, 10) / 100;
  const tileArea = totalArea * (1 + tileWaste);

  const paintCoverage = safe(values.paintCoverage, 10);
  const paintCoats = safe(values.paintCoats, 2);
  // Interior paint covers the inside face of external walls, both partition
  // faces, and ceilings. Exterior paint is measured separately.
  const interiorPaintSurface =
    externalWallArea + partitionArea * 2 + ceilingArea;
  const totalPaintSurface = interiorPaintSurface + externalWallArea;
  const paintLitres =
    paintCoverage > 0
      ? (totalPaintSurface * paintCoats) / paintCoverage
      : 0;

  const waterproofInput = v('waterproof');
  const waterproofArea = waterproofInput > 0 ? waterproofInput : roof;

  const set = (id: string, value: number) => {
    result[`${id}Qty`] = String(
      Number.isFinite(value) ? Math.max(0, value) : 0
    );
  };

  // Earthworks
  set('excavation', excavation);
  set('soilRemoval', excavation);
  set('backfilling', Math.max(0, excavation - footingConcrete - footingCount * footingLength * footingWidth * 0.1));
  set('soilCompaction', excavation > 0 ? footingCount * footingLength * footingWidth : 0);
  // Plot area is not known from floor area; require a measured site quantity.
  set('sitePreparation', 0);

  // Foundations and structure
  set('leanConcrete', footingCount * footingLength * footingWidth * 0.1);
  set('footingConcrete', footingConcrete);
  set('foundationSteel', footingConcrete * 80);
  set('foundationFormwork', foundationFormwork);
  // Do not invent foundation waterproofing quantity from formwork area.
  // Leave at zero until a measured waterproofing area is entered manually.
  set('foundationWaterproofing', 0);
  set('columnConcrete', columnConcrete);
  set('beamConcrete', beamConcrete);
  set('slabConcrete', slabConcrete);
  set('stairConcrete', v('stairVolume'));
  set('structuralSteel', (structuralConcrete + v('stairVolume')) * 110);
  set('columnFormwork', columnFormwork);
  set('beamFormwork', beamFormwork);
  set('slabFormwork', totalArea);
  set('scaffolding', wallArea);

  // Masonry: quantities are estimated by wall area, not exact block counts.
  set('externalBlocks', externalWallArea);
  set('internalBlocks', partitionArea);
  set('cementMasonry', blockArea * 0.12);
  set('sandMasonry', blockArea * 0.02);
  set('lintels', openingsArea * 0.5);

  // Roof
  set('roofThermalInsulation', roof);
  set('roofWaterproofing', waterproofArea);
  set('roofScreed', roof);
  set('roofProtection', waterproofArea);
  set('roofDrainage', Math.max(1, ceil(roof / 100)));

  // Plaster and finishing
  // Interior face of external walls plus both faces of internal partitions.
  set('internalPlaster', externalWallArea + partitionArea * 2);
  set('externalPlaster', externalWallArea);
  set('ceilingPlaster', ceilingArea);
  set('plasterMesh', wallArea * 0.1);
  set('plasterMaterials', plasterArea * 0.015);

  // Electrical allowances, calculated floor by floor.
  let lighting = 0;
  let sockets = 0;
  let doubleSockets = 0;
  let acPoints = 0;
  let heaterPoints = 0;
  let tvPoints = 0;
  let internetPoints = 0;

  floorData.forEach(floor => {
    lighting += Math.max(1, ceil(floor.area / 12));
    sockets += Math.max(1, ceil(floor.area / 8));
    doubleSockets += ceil(floor.area / 35);
    acPoints += ceil(floor.area / 25);
    heaterPoints += ceil(floor.area / 60);
    tvPoints += ceil(floor.area / 60);
    internetPoints += ceil(floor.area / 50);
  });

  const electricalPoints =
    lighting + sockets + doubleSockets + acPoints +
    heaterPoints + tvPoints + internetPoints;

  set('lightingPoints', lighting);
  set('singleSockets', sockets);
  set('doubleSockets', doubleSockets);
  set('acPoints', acPoints);
  set('waterHeaterPoints', heaterPoints);
  set('tvPoints', tvPoints);
  set('internetPoints', internetPoints);
  set('switchPoints', lighting);
  set('distributionBoard', floorData.length);
  set('electricalCables', electricalPoints * 8);
  set('electricalConduits', electricalPoints * 6);
  set('grounding', 1);

  // Plumbing allowances. Actual fixture counts must be checked against the layout.
  let toilets = 0;
  let showers = 0;
  let basins = 0;
  let kitchens = 0;
  let coldWater = 0;
  let hotWater = 0;

  floorData.forEach(floor => {
    const fixtureAllowance = Math.max(1, ceil(floor.area / 90));
    toilets += fixtureAllowance;
    showers += fixtureAllowance;
    basins += fixtureAllowance;
    kitchens += 1;
    coldWater += ceil(floor.area / 18);
    hotWater += ceil(floor.area / 25);
  });

  set('coldWaterPoints', coldWater);
  set('hotWaterPoints', hotWater);
  set('toiletConnections', toilets);
  set('showerConnections', showers);
  set('basinConnections', basins);
  set('kitchenConnections', kitchens);
  set('drainagePipes', totalArea * 0.12);
  set('waterPipes', totalArea * 0.18);
  set('toilets', toilets);
  set('washBasins', basins);
  set('showers', showers);
  set('faucets', basins + showers + kitchens);
  set('sanitaryAccessories', toilets + showers + basins);

  // Do not assume an elevator, water tank, pump, or specific door/window count.
  // These remain zero until the user enters the quantities.

  // Tiling and painting
  set('floorTiles', tileArea);
  set('tileAdhesive', ceil(tileArea / 4));
  set('tileGrout', ceil(tileArea / 20));
  set('skirting', perimeterTotal);
  set('wallPrimer', interiorPaintSurface);
  set('wallPutty', interiorPaintSurface);
  set('interiorPaint', interiorPaintSurface);
  set('exteriorPaint', externalWallArea);
  set('metalWoodPaint', 0);

  // Ceiling allowances
  // A suspended ceiling is optional; do not assume it is installed
  // throughout the building. Enter measured areas/items manually.
  set('falseCeiling', 0);
  set('ceilingFrame', 0);
  set('ceilingInsulation', 0);
  set('ceilingAccessPanels', 0);
  set('ceilingFinishing', 0);

  // Facade allowance
  set('facadeFinish', externalWallArea);

  // Convert metric quantities into the currently selected display units.
  if (units === 'imperial') {
    const areaIds = [
      'soilCompaction', 'sitePreparation', 'foundationWaterproofing',
      'columnFormwork', 'beamFormwork', 'slabFormwork', 'scaffolding',
      'externalBlocks', 'internalBlocks', 'roofThermalInsulation',
      'roofWaterproofing', 'roofScreed', 'roofProtection',
      'internalPlaster', 'externalPlaster', 'ceilingPlaster',
      'plasterMesh', 'floorTiles', 'wallTiles', 'skirting',
      'aluminumWindows', 'glassWork', 'wallPrimer', 'wallPutty',
      'interiorPaint', 'exteriorPaint', 'metalWoodPaint',
      'falseCeiling', 'ceilingFrame', 'ceilingInsulation',
      'ceilingFinishing', 'facadeFinish', 'externalPaving',
      'externalStairs', 'landscaping',
    ];

    const volumeIds = [
      'excavation', 'soilRemoval', 'backfilling', 'leanConcrete',
      'footingConcrete', 'columnConcrete', 'beamConcrete',
      'slabConcrete', 'stairConcrete', 'plasterMaterials',
    ];

    const lengthIds = [
      'lintels', 'electricalCables', 'electricalConduits',
      'drainagePipes', 'waterPipes', 'balustrades',
    ];

    areaIds.forEach(id => {
      result[`${id}Qty`] = String(
        Number(result[`${id}Qty`]) / SQFT_TO_SQM
      );
    });

    volumeIds.forEach(id => {
      result[`${id}Qty`] = String(
        Number(result[`${id}Qty`]) / CUFT_TO_CUM
      );
    });

    lengthIds.forEach(id => {
      result[`${id}Qty`] = String(
        Number(result[`${id}Qty`]) / FT_TO_M
      );
    });
  }

  // Keep unused catalogue entries at zero until the user supplies them.
  return result;
}
