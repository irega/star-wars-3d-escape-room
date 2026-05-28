import { describe, it, expect, beforeEach } from 'vitest';
import {
  isCellPlacementCorrect,
  cycleOrientation,
  areAllSlotsCorrect,
  canExitCorridor,
  shouldExtractFromSlot,
  CELL_SOLUTIONS,
  PUZZLE_3_ID,
  PUZZLE_3_HINT_DELAYS,
  FREQUENCY_NUMBER,
  type CellOrientation,
} from './corridorPuzzle';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useGameStore } from '../stores/useGameStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
});

describe('isCellPlacementCorrect', () => {
  it('returns true for each cell in its correct slot at correct orientation', () => {
    CELL_SOLUTIONS.forEach(({ slotIndex, orientation }, cellId) => {
      expect(isCellPlacementCorrect(cellId, slotIndex, orientation)).toBe(true);
    });
  });

  it('returns false when orientation is wrong', () => {
    expect(isCellPlacementCorrect(0, 0, 90)).toBe(false);
    expect(isCellPlacementCorrect(1, 1, 0)).toBe(false);
    expect(isCellPlacementCorrect(2, 2, 90)).toBe(false);
  });

  it('returns false when slot is wrong', () => {
    expect(isCellPlacementCorrect(0, 1, 0)).toBe(false);
    expect(isCellPlacementCorrect(1, 0, 90)).toBe(false);
    expect(isCellPlacementCorrect(2, 0, 180)).toBe(false);
  });

  it('returns false when both slot and orientation are wrong', () => {
    expect(isCellPlacementCorrect(0, 2, 180)).toBe(false);
  });

  it('returns false for an unknown cellId', () => {
    expect(isCellPlacementCorrect(99, 0, 0)).toBe(false);
  });
});

describe('cycleOrientation', () => {
  it('cycles 0 → 90 → 180 → 270 → 0', () => {
    const orientations: CellOrientation[] = [0, 90, 180, 270];
    orientations.forEach((o, i) => {
      const expected = orientations[(i + 1) % 4];
      expect(cycleOrientation(o)).toBe(expected);
    });
  });

  it('wraps 270 back to 0', () => {
    expect(cycleOrientation(270)).toBe(0);
  });
});

describe('areAllSlotsCorrect', () => {
  it('returns true when all three slots have the correct cell at the correct orientation', () => {
    const placements = CELL_SOLUTIONS.map(({ orientation }, cellId) => ({
      cellId,
      orientation,
    }));
    expect(areAllSlotsCorrect(placements)).toBe(true);
  });

  it('returns false when any slot is empty', () => {
    const placements = [{ cellId: 0, orientation: 0 as CellOrientation }, null, null];
    expect(areAllSlotsCorrect(placements)).toBe(false);
  });

  it('returns false when a cell is in the wrong slot', () => {
    const placements = [
      { cellId: 1, orientation: 0 as CellOrientation }, // wrong cell in slot 0
      { cellId: 0, orientation: 90 as CellOrientation },
      { cellId: 2, orientation: 180 as CellOrientation },
    ];
    expect(areAllSlotsCorrect(placements)).toBe(false);
  });

  it('returns false when a cell is at the wrong orientation', () => {
    const placements = [
      { cellId: 0, orientation: 90 as CellOrientation }, // wrong orientation for slot 0
      { cellId: 1, orientation: 90 as CellOrientation },
      { cellId: 2, orientation: 180 as CellOrientation },
    ];
    expect(areAllSlotsCorrect(placements)).toBe(false);
  });

  it('returns false when given too few slots', () => {
    const placements = [{ cellId: 0, orientation: 0 as CellOrientation }];
    expect(areAllSlotsCorrect(placements)).toBe(false);
  });

  it('returns false when all slots are empty', () => {
    expect(areAllSlotsCorrect([null, null, null])).toBe(false);
  });
});

describe('canExitCorridor', () => {
  it('returns false when puzzle 3 is not solved', () => {
    expect(canExitCorridor(false)).toBe(false);
  });

  it('returns true when puzzle 3 is solved', () => {
    expect(canExitCorridor(true)).toBe(true);
  });
});

describe('power conduit gate sequence', () => {
  it('door is locked before puzzle is solved', () => {
    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_3_ID);
    expect(canExitCorridor(solved)).toBe(false);
  });

  it('door unlocks after puzzle is solved', () => {
    useGameStore.getState().solvePuzzle(PUZZLE_3_ID);
    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_3_ID);
    expect(canExitCorridor(solved)).toBe(true);
  });

  it('adds frequency to inventory on solve', () => {
    useInventoryStore.getState().addItem('frequency');
    expect(useInventoryStore.getState().hasItem('frequency')).toBe(true);
  });

  it('transitions to hangar-bay via moveToRoom', () => {
    useGameStore.getState().moveToRoom('hangar-bay');
    expect(useGameStore.getState().currentRoom).toBe('hangar-bay');
  });

  it('full sequence: correct placements → solve puzzle → store frequency → advance room', () => {
    const placements = CELL_SOLUTIONS.map(({ orientation }, cellId) => ({
      cellId,
      orientation,
    }));
    expect(areAllSlotsCorrect(placements)).toBe(true);

    useInventoryStore.getState().addItem('frequency');
    useGameStore.getState().solvePuzzle(PUZZLE_3_ID);

    const solved = useGameStore.getState().solvedPuzzles.includes(PUZZLE_3_ID);
    expect(canExitCorridor(solved)).toBe(true);
    expect(useInventoryStore.getState().hasItem('frequency')).toBe(true);

    useGameStore.getState().moveToRoom('hangar-bay');
    expect(useGameStore.getState().currentRoom).toBe('hangar-bay');
  });
});

describe('shouldExtractFromSlot (regression: issue #58 — undo power cell placement)', () => {
  it('returns true when no cell is selected, the slot is occupied, and the puzzle is unsolved', () => {
    expect(shouldExtractFromSlot(null, true, false)).toBe(true);
  });

  it('returns false when a cell is selected — place mode takes priority over extract mode', () => {
    expect(shouldExtractFromSlot(0, true, false)).toBe(false);
  });

  it('returns false when the slot is empty — nothing to extract', () => {
    expect(shouldExtractFromSlot(null, false, false)).toBe(false);
  });

  it('returns false when the puzzle is already solved — no further changes allowed', () => {
    expect(shouldExtractFromSlot(null, true, true)).toBe(false);
  });
});

describe('puzzle 3 constants', () => {
  it('has puzzle id 3', () => {
    expect(PUZZLE_3_ID).toBe(3);
  });

  it('frequency number is 47', () => {
    expect(FREQUENCY_NUMBER).toBe(47);
  });

  it('has three cell solutions', () => {
    expect(CELL_SOLUTIONS).toHaveLength(3);
  });

  it('cell 0 maps to slot 0 at 0 degrees', () => {
    expect(CELL_SOLUTIONS[0]).toEqual({ slotIndex: 0, orientation: 0 });
  });

  it('cell 1 maps to slot 1 at 90 degrees', () => {
    expect(CELL_SOLUTIONS[1]).toEqual({ slotIndex: 1, orientation: 90 });
  });

  it('cell 2 maps to slot 2 at 180 degrees', () => {
    expect(CELL_SOLUTIONS[2]).toEqual({ slotIndex: 2, orientation: 180 });
  });

  it('has two hint delays', () => {
    expect(PUZZLE_3_HINT_DELAYS).toHaveLength(2);
  });

  it('first hint fires at 30 seconds', () => {
    expect(PUZZLE_3_HINT_DELAYS[0]).toBe(30_000);
  });

  it('second hint fires at 60 seconds', () => {
    expect(PUZZLE_3_HINT_DELAYS[1]).toBe(60_000);
  });
});
