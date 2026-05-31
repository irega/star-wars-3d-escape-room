import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCorridorPuzzle } from './useCorridorPuzzle';
import { CELL_SOLUTIONS, PUZZLE_3_ID } from './puzzle/corridorPuzzle';
import { useGameStore } from '../../stores/useGameStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import '../../i18n';

beforeEach(() => {
  useInventoryStore.getState().reset();
  useGameStore.getState().reset();
  useGameStore.setState({ currentRoom: 'corridor', phase: 'playing' });
});

/** Select cell, rotate to required orientation, place in matching slot. */
function placeCell(result: { current: ReturnType<typeof useCorridorPuzzle> }, cellId: number) {
  const { orientation, slotIndex } = CELL_SOLUTIONS[cellId];
  const rotations = orientation / 90;

  act(() => result.current.handleCellClick(cellId));
  for (let i = 0; i < rotations; i++) {
    act(() => result.current.handleCellClick(cellId));
  }
  act(() => result.current.handleSlotClick(slotIndex));
}

describe('useCorridorPuzzle', () => {
  it('selects a cell on first click', () => {
    const { result } = renderHook(() => useCorridorPuzzle());
    act(() => result.current.handleCellClick(0));
    expect(result.current.selectedCellId).toBe(0);
  });

  it('rotates cell on second click of same cell', () => {
    const { result } = renderHook(() => useCorridorPuzzle());
    act(() => result.current.handleCellClick(0));
    act(() => result.current.handleCellClick(0));
    expect(result.current.cells[0].orientation).toBe(90);
  });

  it('places all three cells correctly and solves puzzle', async () => {
    vi.useFakeTimers();
    const onDialogue = vi.fn();
    const { result } = renderHook(() => useCorridorPuzzle({ onDialogue }));

    for (let cellId = 0; cellId < 3; cellId++) {
      placeCell(result, cellId);
    }

    await act(async () => {
      vi.runAllTimers();
    });

    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_3_ID);
    expect(useInventoryStore.getState().hasItem('frequency')).toBe(true);
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/1138|frequency/i));

    vi.useRealTimers();
  });

  it('extracts cell from slot when no cell is selected', () => {
    const { result } = renderHook(() => useCorridorPuzzle());

    placeCell(result, 0);
    expect(result.current.cells[0].placedInSlot).toBe(0);

    act(() => result.current.handleSlotClick(0));
    expect(result.current.cells[0].placedInSlot).toBeNull();
  });

  it('ignores interactions when puzzle is already solved', () => {
    useGameStore.getState().solvePuzzle(PUZZLE_3_ID);
    const { result } = renderHook(() => useCorridorPuzzle());

    act(() => result.current.handleCellClick(0));
    expect(result.current.selectedCellId).toBeNull();
  });
});
