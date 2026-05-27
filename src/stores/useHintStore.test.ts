import { describe, it, expect, beforeEach } from 'vitest';
import { useHintStore, MAX_HINT_LEVEL } from './useHintStore';

beforeEach(() => {
  useHintStore.getState().reset();
});

describe('useHintStore', () => {
  describe('initial state', () => {
    it('starts all puzzles at hint level 0', () => {
      for (let puzzle = 1; puzzle <= 4; puzzle++) {
        expect(useHintStore.getState().getHintLevel(puzzle)).toBe(0);
      }
    });
  });

  describe('advanceHint', () => {
    it('increments hint level for a puzzle', () => {
      useHintStore.getState().advanceHint(1);
      expect(useHintStore.getState().getHintLevel(1)).toBe(1);
    });

    it('advances independently per puzzle', () => {
      useHintStore.getState().advanceHint(2);
      useHintStore.getState().advanceHint(2);
      expect(useHintStore.getState().getHintLevel(2)).toBe(2);
      expect(useHintStore.getState().getHintLevel(1)).toBe(0);
    });

    it('does not exceed MAX_HINT_LEVEL', () => {
      for (let i = 0; i <= MAX_HINT_LEVEL + 2; i++) {
        useHintStore.getState().advanceHint(3);
      }
      expect(useHintStore.getState().getHintLevel(3)).toBe(MAX_HINT_LEVEL);
    });
  });

  describe('getHintLevel', () => {
    it('returns 0 for a puzzle with no hints shown', () => {
      expect(useHintStore.getState().getHintLevel(4)).toBe(0);
    });

    it('returns the current level after advances', () => {
      useHintStore.getState().advanceHint(1);
      useHintStore.getState().advanceHint(1);
      expect(useHintStore.getState().getHintLevel(1)).toBe(2);
    });
  });

  describe('reset', () => {
    it('resets all hint levels to 0', () => {
      useHintStore.getState().advanceHint(1);
      useHintStore.getState().advanceHint(2);

      useHintStore.getState().reset();

      expect(useHintStore.getState().getHintLevel(1)).toBe(0);
      expect(useHintStore.getState().getHintLevel(2)).toBe(0);
    });
  });
});
