
export function calculateConcrete(
  length: number,
  width: number,
  thickness: number,
  wastePercent: number = 10
): number {
  const values = [length, width, thickness, wastePercent];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid measurements');
  }

  if (length <= 0 || width <= 0 || thickness <= 0) {
    throw new Error('Measurements must be greater than zero');
  }

  if (wastePercent < 0 || wastePercent > 100) {
    throw new Error('Wastage must be between 0 and 100');
  }

  const baseVolume = length * width * thickness;
  const totalVolume = baseVolume * (1 + wastePercent / 100);

  return totalVolume;
}
