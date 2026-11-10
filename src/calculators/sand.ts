
export type SandCementResult = {
  wetVolume: number;
  dryVolume: number;
  cementVolume: number;
  sandVolume: number;
  cementBags: number;
  cementWeightKg: number;
};

export function calculateSandCement(
  length: number,
  width: number,
  thickness: number,
  cementRatio: number = 1,
  sandRatio: number = 4,
  dryVolumeFactor: number = 1.33,
  bagWeightKg: number = 50
): SandCementResult {
  const values = [
    length,
    width,
    thickness,
    cementRatio,
    sandRatio,
    dryVolumeFactor,
    bagWeightKg,
  ];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid measurements');
  }

  if (
    length <= 0 ||
    width <= 0 ||
    thickness <= 0 ||
    cementRatio <= 0 ||
    sandRatio <= 0 ||
    dryVolumeFactor <= 0 ||
    bagWeightKg <= 0
  ) {
    throw new Error('All values must be greater than zero');
  }

  const wetVolume = length * width * thickness;
  const dryVolume = wetVolume * dryVolumeFactor;
  const totalRatio = cementRatio + sandRatio;

  const cementVolume = dryVolume * (cementRatio / totalRatio);
  const sandVolume = dryVolume * (sandRatio / totalRatio);

  // Approximate cement density: 1440 kg/m³
  const cementWeightKg = cementVolume * 1440;
  const cementBags = Math.ceil(cementWeightKg / bagWeightKg);

  return {
    wetVolume,
    dryVolume,
    cementVolume,
    sandVolume,
    cementBags,
    cementWeightKg,
  };
}
