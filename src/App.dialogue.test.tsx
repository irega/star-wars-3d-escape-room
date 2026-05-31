import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import { useHintStore } from './stores/useHintStore';
import { PUZZLE_1_ID } from './scenes/detentionCellPuzzle';
import './i18n';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useFrame: () => {},
}));

vi.mock('./three/ImperialLighting', () => ({
  ImperialLighting: () => null,
}));

vi.mock('@react-three/drei', () => ({
  PerformanceMonitor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./scenes/DetentionCell', () => ({
  DetentionCell: ({ onDialogue }: { onDialogue: (msg: string) => void }) => (
    <button onClick={() => onDialogue('Test message')}>Trigger Dialogue</button>
  ),
}));

vi.mock('./scenes/ControlRoom', () => ({ ControlRoom: () => null }));
vi.mock('./scenes/Corridor', () => ({ Corridor: () => null }));
vi.mock('./scenes/HangarBay', () => ({ HangarBay: () => null }));

describe('App — dialogue clearing on scene change', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useHintStore.getState().reset();
  });

  it('clears an open dialogue when the player moves to a new scene', async () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'detention-cell' });
    render(<App />);

    await userEvent.click(screen.getByText('Trigger Dialogue'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      useGameStore.setState({ currentRoom: 'control-room' });
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('hides the HUD hint while dialogue is open', async () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'detention-cell' });
    render(<App />);

    act(() => useHintStore.getState().advanceHint(PUZZLE_1_ID));
    expect(screen.getByTestId('hud-hint')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Trigger Dialogue'));
    expect(screen.queryByTestId('hud-hint')).not.toBeInTheDocument();
  });
});
