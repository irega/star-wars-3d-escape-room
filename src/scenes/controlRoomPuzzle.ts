export const PUZZLE_2_ID = 2;

// Aurebesh 4-symbol sequence — read screens left to right: AUREK, UNESH, RESH, ESH
export const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'] as const;

export const PUZZLE_2_HINT_DELAYS: number[] = [20_000, 45_000, 90_000];

/** Bright pulse on sequence screens after the terminal opens; then settles to normal. */
export const SEQUENCE_HIGHLIGHT_MS = 8_000;

export function validateSequence(input: string[]): boolean {
  if (input.length !== CORRECT_SEQUENCE.length) return false;
  return input.every((symbol, i) => symbol.toUpperCase() === CORRECT_SEQUENCE[i]);
}

export function canExitControlRoom(hasSolvedPuzzle2: boolean): boolean {
  return hasSolvedPuzzle2;
}
