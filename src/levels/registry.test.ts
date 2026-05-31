import { describe, it, expect } from 'vitest';
import type { Room } from '../stores/useGameStore';
import { LEVEL_REGISTRY, getLevel } from './registry';
import { DETENTION_CELL_PUZZLE } from '../scenes/detentionCell/puzzle/detentionCellPuzzle';
import { CONTROL_ROOM_PUZZLE } from '../scenes/controlRoom/puzzle/controlRoomPuzzle';
import { CORRIDOR_PUZZLE } from '../scenes/corridor/puzzle/corridorPuzzle';
import { HANGAR_BAY_PUZZLE } from '../scenes/hangarBay/puzzle/hangarBayPuzzle';

const ALL_ROOMS: Room[] = ['detention-cell', 'control-room', 'corridor', 'hangar-bay'];

describe('LEVEL_REGISTRY', () => {
  it('defines all four rooms', () => {
    expect(Object.keys(LEVEL_REGISTRY)).toEqual(ALL_ROOMS);
  });

  it('detention cell exit requires keycard', () => {
    const level = getLevel('detention-cell');
    expect(level.canExit({ solvedPuzzles: [], hasItem: () => false })).toBe(false);
    expect(
      level.canExit({
        solvedPuzzles: [],
        hasItem: (id) => id === 'keycard',
      }),
    ).toBe(true);
  });

  it('control room exit requires puzzle 2 solved', () => {
    const level = getLevel('control-room');
    expect(level.canExit({ solvedPuzzles: [], hasItem: () => false })).toBe(false);
    expect(level.canExit({ solvedPuzzles: [2], hasItem: () => false })).toBe(true);
  });

  it('hangar bay has no next room (win room)', () => {
    expect(getLevel('hangar-bay').nextRoom).toBeUndefined();
  });
});

describe('puzzle definition meta', () => {
  it('has unique puzzle ids 1 through 4', () => {
    const ids = ALL_ROOMS.map((room) => LEVEL_REGISTRY[room].id);
    expect(new Set(ids).size).toBe(4);
    expect(ids.sort()).toEqual([1, 2, 3, 4]);
  });

  it('every level has non-empty hintDelays', () => {
    for (const room of ALL_ROOMS) {
      expect(LEVEL_REGISTRY[room].hintDelays.length).toBeGreaterThan(0);
    }
  });

  it('registry spreads puzzle definitions without redefining canExit', () => {
    expect(getLevel('detention-cell').canExit).toBe(DETENTION_CELL_PUZZLE.canExit);
    expect(getLevel('control-room').canExit).toBe(CONTROL_ROOM_PUZZLE.canExit);
    expect(getLevel('corridor').canExit).toBe(CORRIDOR_PUZZLE.canExit);
    expect(getLevel('hangar-bay').canExit).toBe(HANGAR_BAY_PUZZLE.canExit);
  });

  it('corridor exit requires puzzle 3 solved', () => {
    const level = getLevel('corridor');
    expect(level.canExit({ solvedPuzzles: [], hasItem: () => false })).toBe(false);
    expect(level.canExit({ solvedPuzzles: [3], hasItem: () => false })).toBe(true);
  });

  it('hangar bay exit requires all three inventory items', () => {
    const level = getLevel('hangar-bay');
    const none = { solvedPuzzles: [], hasItem: () => false };
    expect(level.canExit(none)).toBe(false);

    const all = {
      solvedPuzzles: [],
      hasItem: (id: string) => ['keycard', 'override-code', 'frequency'].includes(id),
    };
    expect(level.canExit(all)).toBe(true);
  });
});
