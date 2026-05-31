import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import './i18n';

const performanceCallbacks = vi.hoisted(() => ({
  onDecline: undefined as (() => void) | undefined,
  onIncline: undefined as (() => void) | undefined,
}));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useFrame: () => {},
}));

vi.mock('./three/ImperialLighting', () => ({
  ImperialLighting: () => null,
}));
vi.mock('./scenes/detentionCell/DetentionCell', () => ({ DetentionCell: () => null }));
vi.mock('./scenes/controlRoom/ControlRoom', () => ({ ControlRoom: () => null }));
vi.mock('./scenes/corridor/Corridor', () => ({ Corridor: () => null }));
vi.mock('./scenes/hangarBay/HangarBay', () => ({ HangarBay: () => null }));

vi.mock('@react-three/drei', () => ({
  PerformanceMonitor: ({
    children,
    onDecline,
    onIncline,
  }: {
    children: React.ReactNode;
    onDecline?: () => void;
    onIncline?: () => void;
  }) => {
    performanceCallbacks.onDecline = onDecline;
    performanceCallbacks.onIncline = onIncline;
    return <>{children}</>;
  },
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('PerformanceMonitor — quality tier switching', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useGameStore.setState({ phase: 'playing', playerName: 'Test' });
    performanceCallbacks.onDecline = undefined;
    performanceCallbacks.onIncline = undefined;
  });

  it('starts in high quality tier by default', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toHaveAttribute('data-quality-tier', 'high');
  });

  it('switches to low tier when PerformanceMonitor reports a decline', () => {
    render(<App />);
    act(() => {
      performanceCallbacks.onDecline?.();
    });
    expect(screen.getByTestId('app')).toHaveAttribute('data-quality-tier', 'low');
  });

  it('recovers to high tier when PerformanceMonitor reports an incline after decline', () => {
    render(<App />);
    act(() => {
      performanceCallbacks.onDecline?.();
    });
    act(() => {
      performanceCallbacks.onIncline?.();
    });
    expect(screen.getByTestId('app')).toHaveAttribute('data-quality-tier', 'high');
  });
});
