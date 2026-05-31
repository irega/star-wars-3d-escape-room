import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateSequence,
  canExitControlRoom,
  PUZZLE_2_ID,
  PUZZLE_2_HINT_DELAYS,
  SEQUENCE_HIGHLIGHT_MS,
  CORRECT_SEQUENCE,
} from './controlRoomPuzzle';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
});

describe('validateSequence', () => {
  it('returns true for the correct sequence', () => {
    expect(validateSequence([...CORRECT_SEQUENCE])).toBe(true);
  });

  it('accepts lowercase input', () => {
    const lower = CORRECT_SEQUENCE.map((s) => s.toLowerCase());
    expect(validateSequence(lower)).toBe(true);
  });

  it('returns false for wrong symbols', () => {
    expect(validateSequence(['X', 'Y', 'Z', 'W'])).toBe(false);
  });

  it('returns false when sequence is in wrong order', () => {
    const reversed = [...CORRECT_SEQUENCE].reverse();
    expect(validateSequence(reversed)).toBe(false);
  });

  it('returns false when too short', () => {
    expect(validateSequence(CORRECT_SEQUENCE.slice(0, 3))).toBe(false);
  });

  it('returns false when too long', () => {
    expect(validateSequence([...CORRECT_SEQUENCE, 'X'])).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(validateSequence([])).toBe(false);
  });
});

describe('canExitControlRoom', () => {
  it('returns false when puzzle 2 is not solved', () => {
    expect(canExitControlRoom(false)).toBe(false);
  });

  it('returns true when puzzle 2 is solved', () => {
    expect(canExitControlRoom(true)).toBe(true);
  });
});

describe('override code gate sequence', () => {
  it('door is locked before puzzle is solved', () => {
    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_2_ID);
    expect(canExitControlRoom(solved)).toBe(false);
  });

  it('door unlocks after puzzle is solved', () => {
    useGameStore.getState().solvePuzzle(PUZZLE_2_ID);
    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_2_ID);
    expect(canExitControlRoom(solved)).toBe(true);
  });

  it('adds override-code to inventory on solve', () => {
    useInventoryStore.getState().addItem('override-code');
    expect(useInventoryStore.getState().hasItem('override-code')).toBe(true);
  });

  it('transitions to corridor via moveToRoom', () => {
    useGameStore.getState().moveToRoom('corridor');
    expect(useGameStore.getState().currentRoom).toBe('corridor');
  });

  it('full sequence: correct input → solve puzzle → store override code → advance room', () => {
    expect(validateSequence([...CORRECT_SEQUENCE])).toBe(true);

    useInventoryStore.getState().addItem('override-code');
    useGameStore.getState().solvePuzzle(PUZZLE_2_ID);

    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_2_ID);
    expect(canExitControlRoom(solved)).toBe(true);
    expect(useInventoryStore.getState().hasItem('override-code')).toBe(true);

    useGameStore.getState().moveToRoom('corridor');
    expect(useGameStore.getState().currentRoom).toBe('corridor');
  });
});

describe('puzzle 2 constants', () => {
  it('has puzzle id 2', () => {
    expect(PUZZLE_2_ID).toBe(2);
  });

  it('correct sequence has 4 symbols', () => {
    expect(CORRECT_SEQUENCE).toHaveLength(4);
  });

  it('has three hint delays', () => {
    expect(PUZZLE_2_HINT_DELAYS).toHaveLength(3);
  });

  it('first hint fires at 20 seconds', () => {
    expect(PUZZLE_2_HINT_DELAYS[0]).toBe(20_000);
  });

  it('second hint fires at 45 seconds', () => {
    expect(PUZZLE_2_HINT_DELAYS[1]).toBe(45_000);
  });

  it('third hint fires at 90 seconds', () => {
    expect(PUZZLE_2_HINT_DELAYS[2]).toBe(90_000);
  });

  it('sequence highlight lasts eight seconds after terminal opens', () => {
    expect(SEQUENCE_HIGHLIGHT_MS).toBe(8_000);
  });
});
