import type { PuzzleDefinition } from '../../../levels/types';

export const HANGAR_BAY_PUZZLE = {
  id: 4,
  hintDelays: [25_000, 60_000, 120_000],
  lockedDialogueKey: 'puzzle4.shuttle.locked',
  canExit: (ctx) =>
    validateLaunchClearance(
      ctx.hasItem('keycard'),
      ctx.hasItem('override-code'),
      ctx.hasItem('frequency'),
    ),
} satisfies PuzzleDefinition;

export const PUZZLE_4_ID = HANGAR_BAY_PUZZLE.id;
export const PUZZLE_4_HINT_DELAYS = HANGAR_BAY_PUZZLE.hintDelays;

export function validateLaunchClearance(
  hasKeycard: boolean,
  hasOverrideCode: boolean,
  hasFrequency: boolean,
): boolean {
  return hasKeycard && hasOverrideCode && hasFrequency;
}
