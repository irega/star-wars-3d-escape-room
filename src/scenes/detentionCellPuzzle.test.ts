import { describe, it, expect, beforeEach } from 'vitest';
import { canExitDetentionCell, PUZZLE_1_ID, PUZZLE_1_HINT_DELAYS } from './detentionCellPuzzle';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useGameStore } from '../stores/useGameStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
});

describe('canExitDetentionCell', () => {
  it('returns false without keycard', () => {
    expect(canExitDetentionCell(false)).toBe(false);
  });

  it('returns true with keycard', () => {
    expect(canExitDetentionCell(true)).toBe(true);
  });
});

describe('keycard gate sequence', () => {
  it('door is locked before keycard is collected', () => {
    const hasKeycard = useInventoryStore.getState().hasItem('keycard');
    expect(canExitDetentionCell(hasKeycard)).toBe(false);
  });

  it('door unlocks after keycard is added to inventory', () => {
    useInventoryStore.getState().addItem('keycard');
    const hasKeycard = useInventoryStore.getState().hasItem('keycard');
    expect(canExitDetentionCell(hasKeycard)).toBe(true);
  });

  it('marks puzzle 1 as solved in game store', () => {
    useGameStore.getState().solvePuzzle(PUZZLE_1_ID);
    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_1_ID);
  });

  it('transitions to control-room via moveToRoom', () => {
    useGameStore.getState().moveToRoom('control-room');
    expect(useGameStore.getState().currentRoom).toBe('control-room');
  });

  it('full sequence: collect keycard → solve puzzle → unlock door → advance room', () => {
    useInventoryStore.getState().addItem('keycard');
    useGameStore.getState().solvePuzzle(PUZZLE_1_ID);

    const canExit = canExitDetentionCell(useInventoryStore.getState().hasItem('keycard'));
    expect(canExit).toBe(true);

    useGameStore.getState().moveToRoom('control-room');
    expect(useGameStore.getState().currentRoom).toBe('control-room');
    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_1_ID);
  });
});

describe('puzzle 1 constants', () => {
  it('has puzzle id 1', () => {
    expect(PUZZLE_1_ID).toBe(1);
  });

  it('has two hint delays', () => {
    expect(PUZZLE_1_HINT_DELAYS).toHaveLength(2);
  });

  it('first hint fires at 30 seconds', () => {
    expect(PUZZLE_1_HINT_DELAYS[0]).toBe(30_000);
  });

  it('second hint fires at 60 seconds', () => {
    expect(PUZZLE_1_HINT_DELAYS[1]).toBe(60_000);
  });
});
