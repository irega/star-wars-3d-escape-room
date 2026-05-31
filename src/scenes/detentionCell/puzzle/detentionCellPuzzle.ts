import type { PuzzleDefinition } from '../../../levels/types';

export const DETENTION_CELL_PUZZLE = {
  id: 1,
  hintDelays: [30_000, 60_000],
  lockedDialogueKey: 'puzzle1.door.locked',
  canExit: (ctx) => ctx.hasItem('keycard'),
} satisfies PuzzleDefinition;

export const PUZZLE_1_ID = DETENTION_CELL_PUZZLE.id;
export const PUZZLE_1_HINT_DELAYS = DETENTION_CELL_PUZZLE.hintDelays;
