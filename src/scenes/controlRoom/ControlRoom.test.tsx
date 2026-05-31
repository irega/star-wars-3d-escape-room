import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@react-three/test-renderer';
import { ControlRoom } from './ControlRoom';
import { renderScene, fireClick, findByTestId, resetAllStores } from '../../test/renderThree';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';
import { useControlRoomTerminalStore } from '../../stores/useControlRoomTerminalStore';
import { PUZZLE_2_ID, CORRECT_SEQUENCE } from './puzzle/controlRoomPuzzle';
import '../../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

async function typeSequence(keys: string[]) {
  for (const key of keys) {
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });
  }
}

describe('ControlRoom — integration', () => {
  beforeEach(() => {
    resetAllStores();
    useGameStore.setState({ currentRoom: 'control-room', phase: 'playing' });
  });

  it('terminal click opens the control room terminal store', async () => {
    const renderer = await renderScene(<ControlRoom />);

    await fireClick(renderer, findByTestId(renderer, 'terminal'));

    expect(useControlRoomTerminalStore.getState().active).toBe(true);

    await renderer.unmount();
  });

  it('correct AURE sequence solves puzzle 2 and grants override-code', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<ControlRoom onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'terminal'));
    await typeSequence([...CORRECT_SEQUENCE, 'Enter']);

    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_2_ID);
    expect(useInventoryStore.getState().hasItem('override-code')).toBe(true);
    expect(useControlRoomTerminalStore.getState().active).toBe(false);
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/override|correct/i));

    await renderer.unmount();
  });

  it('door after puzzle 2 moves to corridor', async () => {
    useGameStore.getState().solvePuzzle(PUZZLE_2_ID);
    const onDialogue = vi.fn();
    const renderer = await renderScene(<ControlRoom onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'door'));

    expect(useGameStore.getState().currentRoom).toBe('corridor');
    expect(onDialogue).not.toHaveBeenCalled();

    await renderer.unmount();
  });
});
