
export type ProjectCostResult = {
  materialCost: number;
  labourCost: number;
  equipmentCost: number;
  additionalCost: number;
  subtotal: number;
  contingency: number;
  totalCost: number;
};

export function calculateProjectCost(
  materialCost: number,
  labourCost: number,
  equipmentCost: number = 0,
  additionalCost: number = 0,
  contingencyPercent: number = 10
): ProjectCostResult {
  const values = [
    materialCost,
    labourCost,
    equipmentCost,
    additionalCost,
    contingencyPercent,
  ];

  if (!values.every(Number.isFinite)) {
    throw new Error('Invalid cost values');
  }

  if (
    materialCost < 0 ||
    labourCost < 0 ||
    equipmentCost < 0 ||
    additionalCost < 0
  ) {
    throw new Error('Costs cannot be negative');
  }

  if (contingencyPercent < 0 || contingencyPercent > 100) {
    throw new Error('Contingency must be between 0 and 100');
  }

  const subtotal =
    materialCost + labourCost + equipmentCost + additionalCost;

  const contingency = subtotal * (contingencyPercent / 100);

  return {
    materialCost,
    labourCost,
    equipmentCost,
    additionalCost,
    subtotal,
    contingency,
    totalCost: subtotal + contingency,
  };
}
