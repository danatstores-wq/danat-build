
export type BlocksResult = {
  wallArea: number;
  blockArea: number;
  blocksWithoutWaste: number;
  recommendedBlocks: number;
};

export function calculateBlocks(
  wallLength: number,
  wallHeight: number,
  blockLengthCm: number = 40,
  blockHeightCm: number = 20,
  wastePercent: number = 5,
  openingsArea: number = 0
): BlocksResult {
  const values = [
    wallLength,
    wallHeight,
    blockLengthCm,
    blockHeightCm,
    wastePercent,
    openingsArea,
  ];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid measurements');
  }

  if (
    wallLength <= 0 ||
    wallHeight <= 0 ||
    blockLengthCm <= 0 ||
    blockHeightCm <= 0 ||
    openingsArea < 0
  ) {
    throw new Error('Measurements must be greater than zero');
  }

  if (wastePercent < 0 || wastePercent > 100) {
    throw new Error('Wastage must be between 0 and 100');
  }

  const grossArea = wallLength * wallHeight;

  if (openingsArea >= grossArea) {
    throw new Error('Openings area must be smaller than wall area');
  }

  const wallArea = grossArea - openingsArea;
  const blockArea = (blockLengthCm / 100) * (blockHeightCm / 100);
  const blocksWithoutWaste = wallArea / blockArea;

  const recommendedBlocks = Math.ceil(
    blocksWithoutWaste * (1 + wastePercent / 100)
  );

  return {
    wallArea,
    blockArea,
    blocksWithoutWaste,
    recommendedBlocks,
  };
}
