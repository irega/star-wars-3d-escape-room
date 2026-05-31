import { describe, it, expect } from 'vitest';
import { LEVEL_REGISTRY, getLevel } from './registry';
import { evaluateExitCondition } from './types';

describe('LEVEL_REGISTRY', () => {
  it('defines all four rooms', () => {
    expect(Object.keys(LEVEL_REGISTRY)).toEqual([
      'detention-cell',
      'control-room',
      'corridor',
      'hangar-bay',
    ]);
  });

  it('detention cell exit requires keycard', () => {
    const level = getLevel('detention-cell');
    expect(evaluateExitCondition(level.canExit, { solvedPuzzles: [], hasItem: () => false })).toBe(
      false,
    );
    expect(
      evaluateExitCondition(level.canExit, {
        solvedPuzzles: [],
        hasItem: (id) => id === 'keycard',
      }),
    ).toBe(true);
  });

  it('control room exit requires puzzle 2 solved', () => {
    const level = getLevel('control-room');
    expect(evaluateExitCondition(level.canExit, { solvedPuzzles: [], hasItem: () => false })).toBe(
      false,
    );
    expect(evaluateExitCondition(level.canExit, { solvedPuzzles: [2], hasItem: () => false })).toBe(
      true,
    );
  });

  it('hangar bay has no next room (win room)', () => {
    expect(getLevel('hangar-bay').nextRoom).toBeUndefined();
  });
});
