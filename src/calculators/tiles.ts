
export type TilesResult = {
  floorArea: number;
  tileArea: number;
  tilesWithoutWaste: number;
  recommendedTiles: number;
  totalAreaWithWaste: number;
};

export function calculateTiles(
  length: number,
  width: number,
  tileLengthCm: number,
  tileWidthCm: number,
  wastePercent: number = 10
): TilesResult {
  const values = [
    length,
    width,
    tileLengthCm,
    tileWidthCm,
    wastePercent,
  ];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid measurements');
  }

  if (
    length <= 0 ||
    width <= 0 ||
    tileLengthCm <= 0 ||
    tileWidthCm <= 0
  ) {
    throw new Error('Measurements must be greater than zero');
  }

  if (wastePercent < 0 || wastePercent > 100) {
    throw new Error('Wastage must be between 0 and 100');
  }

  const floorArea = length * width;
  const tileArea = (tileLengthCm / 100) * (tileWidthCm / 100);
  const tilesWithoutWaste = floorArea / tileArea;
  const recommendedTiles = Math.ceil(
    tilesWithoutWaste * (1 + wastePercent / 100)
  );

  return {
    floorArea,
    tileArea,
    tilesWithoutWaste,
    recommendedTiles,
    totalAreaWithWaste: floorArea * (1 + wastePercent / 100),
  };
}
