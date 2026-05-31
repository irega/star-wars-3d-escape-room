import { describe, it, expect, beforeEach } from 'vitest';
import { validateLaunchClearance, PUZZLE_4_ID, PUZZLE_4_HINT_DELAYS } from './hangarBayPuzzle';
import { LAUNCH_FREQUENCY } from '../../corridor/launchFrequency';
import { useInventoryStore } from '../../../stores/useInventoryStore';
import { useGameStore } from '../../../stores/useGameStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
});

describe('validateLaunchClearance', () => {
  it('returns true when all three items are present', () => {
    expect(validateLaunchClearance(true, true, true)).toBe(true);
  });

  it('returns false when keycard is missing', () => {
    expect(validateLaunchClearance(false, true, true)).toBe(false);
  });

  it('returns false when override-code is missing', () => {
    expect(validateLaunchClearance(true, false, true)).toBe(false);
  });

  it('returns false when frequency is missing', () => {
    expect(validateLaunchClearance(true, true, false)).toBe(false);
  });

  it('returns false when all items are missing', () => {
    expect(validateLaunchClearance(false, false, false)).toBe(false);
  });

  it('returns false when only keycard is present', () => {
    expect(validateLaunchClearance(true, false, false)).toBe(false);
  });

  it('returns false when only override-code is present', () => {
    expect(validateLaunchClearance(false, true, false)).toBe(false);
  });

  it('returns false when only frequency is present', () => {
    expect(validateLaunchClearance(false, false, true)).toBe(false);
  });
});

describe('launch clearance gate via stores', () => {
  it('cannot launch with empty inventory', () => {
    const { hasItem } = useInventoryStore.getState();
    expect(
      validateLaunchClearance(hasItem('keycard'), hasItem('override-code'), hasItem('frequency')),
    ).toBe(false);
  });

  it('can launch after all items collected', () => {
    const { addItem, hasItem } = useInventoryStore.getState();
    addItem('keycard');
    addItem('override-code');
    addItem('frequency');
    expect(
      validateLaunchClearance(hasItem('keycard'), hasItem('override-code'), hasItem('frequency')),
    ).toBe(true);
  });

  it('sets phase to won after win() is called', () => {
    useGameStore.getState().win();
    expect(useGameStore.getState().phase).toBe('won');
  });

  it('records puzzle 4 as solved', () => {
    useGameStore.getState().solvePuzzle(PUZZLE_4_ID);
    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_4_ID);
  });

  it('full sequence: collect all items → validate → solve puzzle → win', () => {
    const { addItem, hasItem } = useInventoryStore.getState();
    addItem('keycard');
    addItem('override-code');
    addItem('frequency');

    expect(
      validateLaunchClearance(hasItem('keycard'), hasItem('override-code'), hasItem('frequency')),
    ).toBe(true);

    useGameStore.getState().solvePuzzle(PUZZLE_4_ID);
    useGameStore.getState().win();

    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_4_ID);
    expect(useGameStore.getState().phase).toBe('won');
  });
});

describe('puzzle 4 constants', () => {
  it('has puzzle id 4', () => {
    expect(PUZZLE_4_ID).toBe(4);
  });

  it('has three hint delays', () => {
    expect(PUZZLE_4_HINT_DELAYS).toHaveLength(3);
  });

  it('first hint fires within 30 seconds', () => {
    expect(PUZZLE_4_HINT_DELAYS[0]).toBeLessThanOrEqual(30_000);
  });

  it('hint delays are in ascending order', () => {
    for (let i = 1; i < PUZZLE_4_HINT_DELAYS.length; i++) {
      expect(PUZZLE_4_HINT_DELAYS[i]).toBeGreaterThan(PUZZLE_4_HINT_DELAYS[i - 1]);
    }
  });

  it('launch frequency is a non-empty string', () => {
    expect(LAUNCH_FREQUENCY).toBeTruthy();
    expect(typeof LAUNCH_FREQUENCY).toBe('string');
  });
});
