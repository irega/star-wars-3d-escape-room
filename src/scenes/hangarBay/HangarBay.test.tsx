import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HangarBay } from './HangarBay';
import { renderScene, fireClick, findByTestId, resetAllStores } from '../../test/renderThree';
import { InteractiveObject } from '../../components/InteractiveObject';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useGameStore } from '../../stores/useGameStore';
import { PUZZLE_4_ID } from './puzzle/hangarBayPuzzle';
import '../../i18n';

vi.mock('@react-three/drei', () => ({
  Html: () => null,
  Environment: () => null,
  ContactShadows: () => null,
}));

vi.mock('./LaunchConsole', () => ({
  LaunchConsole: ({
    onOpen,
    onLaunch,
    disabled,
    canLaunch,
    active,
    testId = 'console',
  }: {
    onOpen: () => void;
    onLaunch: () => void;
    disabled: boolean;
    canLaunch: boolean;
    active: boolean;
    testId?: string;
  }) => (
    <>
      <InteractiveObject testId={testId} onClick={onOpen} isDisabled={disabled}>
        <mesh />
      </InteractiveObject>
      {active && (
        <InteractiveObject testId="launch" onClick={onLaunch} isDisabled={!canLaunch}>
          <mesh />
        </InteractiveObject>
      )}
    </>
  ),
}));

describe('HangarBay — integration', () => {
  beforeEach(() => {
    resetAllStores();
    useGameStore.setState({ currentRoom: 'hangar-bay', phase: 'playing' });
  });

  it('console click opens launch controls', async () => {
    const renderer = await renderScene(<HangarBay />);

    await fireClick(renderer, findByTestId(renderer, 'console'));
    expect(() => findByTestId(renderer, 'launch')).not.toThrow();

    await renderer.unmount();
  });

  it('launch without all items does not win', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderScene(<HangarBay onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'console'));
    await fireClick(renderer, findByTestId(renderer, 'launch'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(onDialogue).not.toHaveBeenCalled();

    await renderer.unmount();
  });

  it('launch with all three items wins and solves puzzle 4', async () => {
    useInventoryStore.getState().addItem('keycard');
    useInventoryStore.getState().addItem('override-code');
    useInventoryStore.getState().addItem('frequency');

    const onDialogue = vi.fn();
    const renderer = await renderScene(<HangarBay onDialogue={onDialogue} />);

    await fireClick(renderer, findByTestId(renderer, 'console'));
    await fireClick(renderer, findByTestId(renderer, 'launch'));

    expect(useGameStore.getState().phase).toBe('won');
    expect(useGameStore.getState().solvedPuzzles).toContain(PUZZLE_4_ID);
    expect(onDialogue).toHaveBeenCalledWith(expect.stringMatching(/launch|escape|Force/i));

    await renderer.unmount();
  });
});
