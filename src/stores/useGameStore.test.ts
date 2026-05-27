import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

beforeEach(() => {
  useGameStore.getState().reset();
});

describe('useGameStore', () => {
  describe('initial state', () => {
    it('sets player name to Rebel', () => {
      expect(useGameStore.getState().playerName).toBe('Rebel');
    });

    it('starts in detention-cell', () => {
      expect(useGameStore.getState().currentRoom).toBe('detention-cell');
    });

    it('starts with no solved puzzles', () => {
      expect(useGameStore.getState().solvedPuzzles).toEqual([]);
    });

    it('starts in playing phase', () => {
      expect(useGameStore.getState().phase).toBe('playing');
    });
  });

  describe('setPlayerName', () => {
    it('updates the player name', () => {
      useGameStore.getState().setPlayerName('Luke');
      expect(useGameStore.getState().playerName).toBe('Luke');
    });
  });

  describe('moveToRoom', () => {
    it('changes the current room', () => {
      useGameStore.getState().moveToRoom('control-room');
      expect(useGameStore.getState().currentRoom).toBe('control-room');
    });

    it('can navigate through all rooms', () => {
      useGameStore.getState().moveToRoom('corridor');
      expect(useGameStore.getState().currentRoom).toBe('corridor');

      useGameStore.getState().moveToRoom('hangar-bay');
      expect(useGameStore.getState().currentRoom).toBe('hangar-bay');
    });
  });

  describe('solvePuzzle', () => {
    it('marks puzzle as solved', () => {
      useGameStore.getState().solvePuzzle(1);
      expect(useGameStore.getState().solvedPuzzles).toContain(1);
    });

    it('can solve multiple puzzles independently', () => {
      useGameStore.getState().solvePuzzle(1);
      useGameStore.getState().solvePuzzle(3);
      expect(useGameStore.getState().solvedPuzzles).toContain(1);
      expect(useGameStore.getState().solvedPuzzles).toContain(3);
      expect(useGameStore.getState().solvedPuzzles).not.toContain(2);
    });

    it('does not duplicate a puzzle already solved', () => {
      useGameStore.getState().solvePuzzle(2);
      useGameStore.getState().solvePuzzle(2);
      expect(useGameStore.getState().solvedPuzzles.filter((id) => id === 2)).toHaveLength(1);
    });
  });

  describe('win', () => {
    it('transitions phase to won', () => {
      useGameStore.getState().win();
      expect(useGameStore.getState().phase).toBe('won');
    });
  });

  describe('reset', () => {
    it('restores initial state after changes', () => {
      useGameStore.getState().setPlayerName('Leia');
      useGameStore.getState().moveToRoom('hangar-bay');
      useGameStore.getState().solvePuzzle(1);
      useGameStore.getState().win();

      useGameStore.getState().reset();

      const state = useGameStore.getState();
      expect(state.playerName).toBe('Rebel');
      expect(state.currentRoom).toBe('detention-cell');
      expect(state.solvedPuzzles).toEqual([]);
      expect(state.phase).toBe('playing');
    });
  });
});
