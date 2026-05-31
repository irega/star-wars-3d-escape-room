import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@react-three/test-renderer';
import { Corridor } from './Corridor';
import { renderScene, fireClick, findByTestId, resetAllStores } from '../../test/renderThree';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';
import { PUZZLE_3_ID, CELL_SOLUTIONS } from './corridorPuzzle';
import '../../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

/** Select cell, rotate to required orientation, place in matching slot. */
async function placeCell(renderer: Awaited<ReturnType<typeof renderScene>>, cellId: number) {
  const { orientation, slotIndex } = CELL_SOLUTIONS[cellId];
  const rotations = orientation / 90;

  await fireClick(renderer, findByTestId(renderer, `cell-${cellId}`));
  for (let i = 0; i < rotations; i++) {
    await fireClick(renderer, findByTestId(renderer, `cell-${cellId}`));
  }
  await fireClick(renderer, findByTestId(renderer, `slot-${slotIndex}`));
}

describe('Corridor — integration', () => {
  beforeEach(() => {
    resetAllStores();
    useGameStore.setState({ currentRoom: 'corridor', phase: 'playing' });
  });

  it('placing all three cells correctly solves puzzle 3 and grants frequency', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<Corridor onDialogue={onDialogue} />);

    for (let cellId = 0; cellId < 3; cellId++) {
      await placeCell(renderer, cellId);
    }

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_3_ID);
    expect(useInventoryStore.getState().hasItem('frequency')).toBe(true);
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/1138|frequency/i));

    await renderer.unmount();
  });

  it('door before puzzle 3 shows locked dialogue', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<Corridor onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'door'));

    expect(useGameStore.getState().currentRoom).toBe('corridor');
    expect(onDialogue).toHaveBeenCalled();

    await renderer.unmount();
  });

  it('door after puzzle 3 moves to hangar-bay', async () => {
    useGameStore.getState().solvePuzzle(PUZZLE_3_ID);
    const onDialogue = vi.fn();
    const renderer = await renderScene(<Corridor onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'door'));

    expect(useGameStore.getState().currentRoom).toBe('hangar-bay');
    expect(onDialogue).not.toHaveBeenCalled();

    await renderer.unmount();
  });
});
