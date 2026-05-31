import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetentionCell } from './DetentionCell';
import { renderScene, fireClick, findByTestId, resetAllStores } from '../../test/renderThree';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';
import { PUZZLE_1_ID } from './puzzle/detentionCellPuzzle';
import '../../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('DetentionCell — integration', () => {
  beforeEach(() => {
    resetAllStores();
    useGameStore.setState({ currentRoom: 'detention-cell', phase: 'playing' });
  });

  it('panel click grants keycard, solves puzzle 1, and shows dialogue', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<DetentionCell onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'panel'));

    expect(useInventoryStore.getState().hasItem('keycard')).toBe(true);
    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_1_ID);
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/keycard/i));

    await renderer.unmount();
  });

  it('door without keycard shows locked dialogue', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<DetentionCell onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'door'));

    expect(useGameStore.getState().currentRoom).toBe('detention-cell');
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/sealed|keycard/i));

    await renderer.unmount();
  });

  it('door with keycard moves to control-room', async () => {
    useInventoryStore.getState().addItem('keycard');
    const onDialogue = vi.fn();
    const renderer = await renderScene(<DetentionCell onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'door'));

    expect(useGameStore.getState().currentRoom).toBe('control-room');
    expect(onDialogue).not.toHaveBeenCalled();

    await renderer.unmount();
  });
});
