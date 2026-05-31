import type { PuzzleDefinition } from '../../../levels/types';

export const CONTROL_ROOM_PUZZLE = {
  id: 2,
  hintDelays: [20_000, 45_000, 90_000],
  lockedDialogueKey: 'puzzle2.door.locked',
  canExit: (ctx) => ctx.solvedPuzzles.includes(2),
} satisfies PuzzleDefinition;

export const PUZZLE_2_ID = CONTROL_ROOM_PUZZLE.id;
export const PUZZLE_2_HINT_DELAYS = CONTROL_ROOM_PUZZLE.hintDelays;

// Aurebesh 4-symbol sequence — read screens left to right: AUREK, UNESH, RESH, ESH
export const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'] as const;

/** Bright pulse on sequence screens after the terminal opens; then settles to normal. */
export const SEQUENCE_HIGHLIGHT_MS = 8_000;

export function validateSequence(input: string[]): boolean {
  if (input.length !== CORRECT_SEQUENCE.length) return false;
  return input.every((symbol, i) => symbol.toUpperCase() === CORRECT_SEQUENCE[i]);
}
