import { describe, it, expect, beforeEach } from 'vitest';
import { DETENTION_CELL_PUZZLE, PUZZLE_1_ID, PUZZLE_1_HINT_DELAYS } from './detentionCellPuzzle';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
});

function makeCtx() {
  return {
    solvedPuzzles: useGameStore.getState().solvedPuzzles,
    hasItem: useInventoryStore.getState().hasItem,
  };
}

describe('DETENTION_CELL_PUZZLE.canExit', () => {
  it('returns false without keycard', () => {
    expect(DETENTION_CELL_PUZZLE.canExit(makeCtx())).toBe(false);
  });

  it('returns true with keycard', () => {
    useInventoryStore.getState().addItem('keycard');
    expect(DETENTION_CELL_PUZZLE.canExit(makeCtx())).toBe(true);
  });
});

describe('keycard gate sequence', () => {
  it('door is locked before keycard is collected', () => {
    expect(DETENTION_CELL_PUZZLE.canExit(makeCtx())).toBe(false);
  });

  it('door unlocks after keycard is added to inventory', () => {
    useInventoryStore.getState().addItem('keycard');
    expect(DETENTION_CELL_PUZZLE.canExit(makeCtx())).toBe(true);
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

    expect(DETENTION_CELL_PUZZLE.canExit(makeCtx())).toBe(true);

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
