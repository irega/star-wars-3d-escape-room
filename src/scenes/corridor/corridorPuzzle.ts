import type { PuzzleDefinition } from '../../levels/types';

export const CORRIDOR_PUZZLE = {
  id: 3,
  hintDelays: [30_000, 60_000],
  lockedDialogueKey: 'puzzle3.door.locked',
  canExit: (ctx) => ctx.solvedPuzzles.includes(3),
} satisfies PuzzleDefinition;

export const PUZZLE_3_ID = CORRIDOR_PUZZLE.id;
export const PUZZLE_3_HINT_DELAYS = CORRIDOR_PUZZLE.hintDelays;

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

export function shouldExtractFromSlot(
  selectedCellId: number | null,
  slotOccupied: boolean,
  puzzleSolved: boolean,
): boolean {
  return selectedCellId === null && slotOccupied && !puzzleSolved;
}
