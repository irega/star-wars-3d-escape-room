import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import { useHintStore } from './stores/useHintStore';
import { PUZZLE_2_ID } from './scenes/controlRoomPuzzle';
import './i18n';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useFrame: () => {},
}));

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./scenes/DetentionCell', () => ({ DetentionCell: () => null }));
vi.mock('./scenes/ControlRoom', () => ({ ControlRoom: () => null }));
vi.mock('./scenes/Corridor', () => ({ Corridor: () => null }));
vi.mock('./scenes/HangarBay', () => ({ HangarBay: () => null }));

describe('App — puzzle 2 hints (Aurebesh guidance)', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useHintStore.getState().reset();
  });

  it('displays no hint in control-room before any hint triggers', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });

  it('displays puzzle 2 hint 1 in control-room when hint level is 1', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    expect(screen.getByText('Hint')).toBeInTheDocument();
  });

  it('hint 1 for puzzle 2 mentions Aurebesh to help players unfamiliar with the Star Wars alphabet', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    const hintText = screen.getByText(/Aurebesh/i);
    expect(hintText).toBeInTheDocument();
  });

  it('hint 2 for puzzle 2 also mentions Aurebesh', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    const hintText = screen.getByText(/Aurebesh/i);
    expect(hintText).toBeInTheDocument();
  });

  it('does not show puzzle 2 hint when player is in detention-cell', () => {
    useGameStore.setState({
      phase: 'playing',
      playerName: 'Test',
      currentRoom: 'detention-cell',
    });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });
});
