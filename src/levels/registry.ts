import type { Room } from '../stores/useGameStore';
import { DETENTION_CELL_PUZZLE } from '../scenes/detentionCell/puzzle/detentionCellPuzzle';
import { CONTROL_ROOM_PUZZLE } from '../scenes/controlRoom/puzzle/controlRoomPuzzle';
import { CORRIDOR_PUZZLE } from '../scenes/corridor/puzzle/corridorPuzzle';
import { HANGAR_BAY_PUZZLE } from '../scenes/hangarBay/puzzle/hangarBayPuzzle';
import type { LevelDefinition } from './types';

/**
 * Central registry for all rooms. To add a new level:
 * 1. Create scenes/<room>/ with index.ts barrel
 * 2. *Puzzle.ts → export PuzzleDefinition + domain validators
 * 3. Register here (spread puzzle + nextRoom)
 * 4. Scene orchestrator + subcomponents/hook
 * 5. i18n keys (puzzleN.*, lockedDialogueKey)
 * 6. Tests: puzzle logic + scene smoke
 * 7. Wire scene in App.tsx
 */
export const LEVEL_REGISTRY: Record<Room, LevelDefinition> = {
  'detention-cell': { ...DETENTION_CELL_PUZZLE, nextRoom: 'control-room' },
  'control-room': { ...CONTROL_ROOM_PUZZLE, nextRoom: 'corridor' },
  corridor: { ...CORRIDOR_PUZZLE, nextRoom: 'hangar-bay' },
  'hangar-bay': { ...HANGAR_BAY_PUZZLE },
};

export function getLevel(room: Room): LevelDefinition {
  return LEVEL_REGISTRY[room];
}
