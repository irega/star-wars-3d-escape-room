export const PUZZLE_3_ID = 3;
export const FREQUENCY_NUMBER = 47;
export const PUZZLE_3_HINT_DELAYS: number[] = [30_000, 60_000];

export type CellOrientation = 0 | 90 | 180 | 270;

// cellId → { slotIndex, requiredOrientation }
export const CELL_SOLUTIONS: Array<{ slotIndex: number; orientation: CellOrientation }> = [
  { slotIndex: 0, orientation: 0 },
  { slotIndex: 1, orientation: 90 },
  { slotIndex: 2, orientation: 180 },
];

export function isCellPlacementCorrect(
  cellId: number,
  slotIndex: number,
  orientation: CellOrientation,
): boolean {
  const solution = CELL_SOLUTIONS[cellId];
  if (!solution) return false;
  return solution.slotIndex === slotIndex && solution.orientation === orientation;
}

export function cycleOrientation(current: CellOrientation): CellOrientation {
  const orientations: CellOrientation[] = [0, 90, 180, 270];
  const nextIdx = (orientations.indexOf(current) + 1) % 4;
  return orientations[nextIdx];
}

export function areAllSlotsCorrect(
  slotPlacements: Array<{ cellId: number; orientation: CellOrientation } | null>,
): boolean {
  if (slotPlacements.length !== CELL_SOLUTIONS.length) return false;
  return slotPlacements.every((placement, slotIndex) => {
    if (!placement) return false;
    return isCellPlacementCorrect(placement.cellId, slotIndex, placement.orientation);
  });
}

export function canExitCorridor(hasSolvedPuzzle3: boolean): boolean {
  return hasSolvedPuzzle3;
}
