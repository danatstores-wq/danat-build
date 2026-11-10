
export type PaintResult = {
  wallArea: number;
  totalArea: number;
  paintLitres: number;
  recommendedLitres: number;
};

export function calculatePaint(
  wallLength: number,
  wallHeight: number,
  numberOfWalls: number = 4,
  coats: number = 2,
  coveragePerLitre: number = 10,
  wastePercent: number = 10,
  openingsArea: number = 0
): PaintResult {
  const values = [
    wallLength,
    wallHeight,
    numberOfWalls,
    coats,
    coveragePerLitre,
    wastePercent,
    openingsArea,
  ];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid measurements');
  }

  if (
    wallLength <= 0 ||
    wallHeight <= 0 ||
    numberOfWalls <= 0 ||
    coats <= 0 ||
    coveragePerLitre <= 0 ||
    openingsArea < 0
  ) {
    throw new Error('Measurements must be greater than zero');
  }

  if (wastePercent < 0 || wastePercent > 100) {
    throw new Error('Wastage must be between 0 and 100');
  }

  const grossArea = wallLength * wallHeight * numberOfWalls;
  const wallArea = Math.max(0, grossArea - openingsArea);
  const totalArea = wallArea * coats;

  const paintLitres =
    (totalArea / coveragePerLitre) * (1 + wastePercent / 100);

  return {
    wallArea,
    totalArea,
    paintLitres,
    recommendedLitres: Math.ceil(paintLitres),
  };
}
