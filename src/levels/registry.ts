import type { Room } from '../stores/useGameStore';
import { PUZZLE_1_ID, PUZZLE_1_HINT_DELAYS } from '../scenes/detentionCell/detentionCellPuzzle';
import { PUZZLE_2_ID, PUZZLE_2_HINT_DELAYS } from '../scenes/controlRoom/controlRoomPuzzle';
import { PUZZLE_3_ID, PUZZLE_3_HINT_DELAYS } from '../scenes/corridor/corridorPuzzle';
import {
  PUZZLE_4_ID,
  PUZZLE_4_HINT_DELAYS,
  validateLaunchClearance,
} from '../scenes/hangarBay/hangarBayPuzzle';
import type { LevelDefinition } from './types';
import { isPuzzleSolved } from './types';

/**
 * Central registry for all rooms. To add a new level:
 * 1. Add puzzle logic in scenes/<room>/
 * 2. Register it here (puzzleId, hints, canExit, nextRoom)
 * 3. Create scene folder with named prop components
 * 4. Wire the scene in App.tsx
 */
export const LEVEL_REGISTRY: Record<Room, LevelDefinition> = {
  'detention-cell': {
    puzzleId: PUZZLE_1_ID,
    hintDelays: PUZZLE_1_HINT_DELAYS,
    lockedDialogueKey: 'puzzle1.door.locked',
    nextRoom: 'control-room',
    canExit: (ctx) => ctx.hasItem('keycard'),
  },
  'control-room': {
    puzzleId: PUZZLE_2_ID,
    hintDelays: PUZZLE_2_HINT_DELAYS,
    lockedDialogueKey: 'puzzle2.door.locked',
    nextRoom: 'corridor',
    canExit: (ctx) => isPuzzleSolved(ctx, PUZZLE_2_ID),
  },
  corridor: {
    puzzleId: PUZZLE_3_ID,
    hintDelays: PUZZLE_3_HINT_DELAYS,
    lockedDialogueKey: 'puzzle3.door.locked',
    nextRoom: 'hangar-bay',
    canExit: (ctx) => isPuzzleSolved(ctx, PUZZLE_3_ID),
  },
  'hangar-bay': {
    puzzleId: PUZZLE_4_ID,
    hintDelays: PUZZLE_4_HINT_DELAYS,
    lockedDialogueKey: 'puzzle4.shuttle.locked',
    canExit: (ctx) =>
      validateLaunchClearance(
        ctx.hasItem('keycard'),
        ctx.hasItem('override-code'),
        ctx.hasItem('frequency'),
      ),
  },
};

export function getLevel(room: Room): LevelDefinition {
  return LEVEL_REGISTRY[room];
}
