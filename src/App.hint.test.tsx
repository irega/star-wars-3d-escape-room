import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import { useHintStore } from './stores/useHintStore';
import { PUZZLE_1_HINT_DELAYS } from './scenes/detentionCellPuzzle';
import './i18n';

vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="canvas-mock" />,
  useFrame: () => {},
}));

vi.mock('@react-three/drei', () => ({
  PerformanceMonitor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App — timed hints in detention cell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.getState().reset();
    useHintStore.getState().reset();
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'detention-cell' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows puzzle 1 hint in HUD after the first delay', () => {
    render(<App />);

    expect(screen.queryByText('Hint')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(PUZZLE_1_HINT_DELAYS[0]);
    });

    expect(screen.getByTestId('hud-hint')).toBeVisible();
    expect(screen.getByText(/Something in this cell might help you escape/i)).toBeInTheDocument();
  });
});
