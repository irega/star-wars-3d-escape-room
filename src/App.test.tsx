import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import { useHintStore } from './stores/useHintStore';
import { useControlRoomTerminalStore } from './stores/useControlRoomTerminalStore';
import { PUZZLE_1_HINT_DELAYS } from './scenes/detentionCell/detentionCellPuzzle';
import { PUZZLE_2_ID } from './scenes/controlRoom/controlRoomPuzzle';
import { PUZZLE_1_ID } from './scenes/detentionCell/detentionCellPuzzle';
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
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./scenes/detentionCell/DetentionCell', () => ({
  DetentionCell: ({ onDialogue }: { onDialogue: (msg: string) => void }) => (
    <button onClick={() => onDialogue('Test message')}>Trigger Dialogue</button>
  ),
}));
vi.mock('./scenes/controlRoom/ControlRoom', () => ({ ControlRoom: () => null }));
vi.mock('./scenes/corridor/Corridor', () => ({ Corridor: () => null }));
vi.mock('./scenes/hangarBay/HangarBay', () => ({ HangarBay: () => null }));

describe('App — wiring', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useHintStore.getState().reset();
    useControlRoomTerminalStore.getState().reset();
    performanceCallbacks.onDecline = undefined;
    performanceCallbacks.onIncline = undefined;
  });

  it('renders the app container', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('does not render the canvas during intro', () => {
    render(<App />);
    expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
  });

  it('renders the canvas when phase is playing', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test' });
    render(<App />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('does not render the canvas on victory', () => {
    useGameStore.setState({ phase: 'won', playerName: 'Test' });
    render(<App />);
    expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
  });
});

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

  it('hint 1 for puzzle 2 mentions Aurebesh', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    expect(screen.getByText(/Aurebesh/i)).toBeInTheDocument();
  });

  it('hint 2 for puzzle 2 also mentions Aurebesh', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    render(<App />);
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    act(() => useHintStore.getState().advanceHint(PUZZLE_2_ID));
    expect(screen.getByText(/Aurebesh/i)).toBeInTheDocument();
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

describe('App — control room terminal overlay', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useControlRoomTerminalStore.getState().reset();
  });

  it('shows ControlRoomTerminal only in control-room when terminal is active', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'control-room' });
    useControlRoomTerminalStore.getState().open();
    render(<App />);
    expect(screen.getByText(/IMPERIAL OVERRIDE SYSTEM/i)).toBeInTheDocument();
  });

  it('hides ControlRoomTerminal when not in control-room', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test', currentRoom: 'detention-cell' });
    useControlRoomTerminalStore.getState().open();
    render(<App />);
    expect(screen.queryByText(/IMPERIAL OVERRIDE SYSTEM/i)).not.toBeInTheDocument();
  });
});

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
