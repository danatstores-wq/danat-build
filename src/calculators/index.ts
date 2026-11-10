
import { calculateConcrete } from './concrete';
import { calculateTiles } from './tiles';
import { calculatePaint } from './paint';
import { calculateBlocks } from './blocks';
import { calculateSandCement } from './sand';
import { calculateProjectCost } from './cost';

export function calculateTool(
  id: string,
  values: Record<string, number>
) {
  switch (id) {
    case 'concrete':
      return calculateConcrete(
        values.length,
        values.width,
        values.thickness,
        values.waste
      );

    case 'tiles':
      return calculateTiles(
        values.length,
        values.width,
        values.tileLength,
        values.tileWidth,
        values.waste
      );

    case 'paint':
      return calculatePaint(
        values.wallLength,
        values.wallHeight,
        values.numberOfWalls,
        values.coats,
        values.coverage,
        values.waste,
        values.openings
      );

    case 'blocks':
      return calculateBlocks(
        values.wallLength,
        values.wallHeight,
        values.blockLength,
        values.blockHeight,
        values.waste,
        values.openings
      );

    case 'sand':
      return calculateSandCement(
        values.length,
        values.width,
        values.thickness,
        values.cementRatio,
        values.sandRatio
      );

    case 'cost':
      return calculateProjectCost(
        values.materialCost,
        values.labourCost,
        values.equipmentCost,
        values.additionalCost,
        values.contingency
      );

    default:
      throw new Error('Unknown calculator');
  }
}
