import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import type { Room } from '../stores/useGameStore';
import { getLevel } from './registry';
import { evaluateExitCondition } from './types';

/** Standard door-click handler — checks level exit condition, moves or shows locked dialogue. */
export function useRoomExit(room: Room, onDialogue?: (text: string | null) => void) {
  const { t } = useTranslation();
  const moveToRoom = useGameStore((s) => s.moveToRoom);
  const solvedPuzzles = useGameStore((s) => s.solvedPuzzles);
  const hasItem = useInventoryStore((s) => s.hasItem);

  const level = getLevel(room);

  return useCallback(() => {
    const ctx = { solvedPuzzles, hasItem };
    if (evaluateExitCondition(level.canExit, ctx)) {
      if (level.nextRoom) {
        moveToRoom(level.nextRoom);
      }
    } else {
      onDialogue?.(t(level.lockedDialogueKey));
    }
  }, [solvedPuzzles, hasItem, level, moveToRoom, t, onDialogue]);
}

/** Whether the room's puzzle is marked solved in game state. */
export function usePuzzleSolved(room: Room): boolean {
  const level = getLevel(room);
  const solvedPuzzles = useGameStore((s) => s.solvedPuzzles);
  return solvedPuzzles.includes(level.puzzleId);
}
