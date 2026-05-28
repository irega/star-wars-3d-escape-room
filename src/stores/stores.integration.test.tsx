import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useGameStore } from './useGameStore';
import { useInventoryStore } from './useInventoryStore';
import { useHintStore } from './useHintStore';

beforeEach(() => {
  useGameStore.getState().reset();
  useInventoryStore.getState().reset();
  useHintStore.getState().reset();
});

function CurrentRoomDisplay() {
  const currentRoom = useGameStore((s) => s.currentRoom);
  return <div data-testid="current-room">{currentRoom}</div>;
}

function PhaseDisplay() {
  const phase = useGameStore((s) => s.phase);
  return <div data-testid="phase">{phase}</div>;
}

function InventoryDisplay() {
  const items = useInventoryStore((s) => s.items);
  return (
    <ul data-testid="inventory">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function HintLevelDisplay({ puzzleId }: { puzzleId: number }) {
  const level = useHintStore((s) => s.getHintLevel(puzzleId));
  return <div data-testid={`hint-level-${puzzleId}`}>{level}</div>;
}

describe('store integration with React components', () => {
  describe('useGameStore', () => {
    it('component reflects initial room', () => {
      render(<CurrentRoomDisplay />);
      expect(screen.getByTestId('current-room')).toHaveTextContent('detention-cell');
    });

    it('component updates when room changes', () => {
      render(<CurrentRoomDisplay />);
      act(() => useGameStore.getState().moveToRoom('control-room'));
      expect(screen.getByTestId('current-room')).toHaveTextContent('control-room');
    });

    it('component reflects initial intro phase', () => {
      render(<PhaseDisplay />);
      expect(screen.getByTestId('phase')).toHaveTextContent('intro');
    });

    it('component updates to won when win is called', () => {
      render(<PhaseDisplay />);
      act(() => useGameStore.getState().win());
      expect(screen.getByTestId('phase')).toHaveTextContent('won');
    });
  });

  describe('useInventoryStore', () => {
    it('component shows empty inventory initially', () => {
      render(<InventoryDisplay />);
      expect(screen.getByTestId('inventory')).toBeEmptyDOMElement();
    });

    it('component renders item after it is added', () => {
      render(<InventoryDisplay />);
      act(() => useInventoryStore.getState().addItem('keycard'));
      expect(screen.getByText('keycard')).toBeInTheDocument();
    });

    it('component removes item after it is removed from store', () => {
      render(<InventoryDisplay />);
      act(() => useInventoryStore.getState().addItem('keycard'));
      act(() => useInventoryStore.getState().removeItem('keycard'));
      expect(screen.queryByText('keycard')).not.toBeInTheDocument();
    });
  });

  describe('useHintStore', () => {
    it('component shows hint level 0 initially', () => {
      render(<HintLevelDisplay puzzleId={1} />);
      expect(screen.getByTestId('hint-level-1')).toHaveTextContent('0');
    });

    it('component updates hint level when advanced', () => {
      render(<HintLevelDisplay puzzleId={2} />);
      act(() => useHintStore.getState().advanceHint(2));
      expect(screen.getByTestId('hint-level-2')).toHaveTextContent('1');
    });
  });
});

function NameInput() {
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  return (
    <input
      data-testid="name-input"
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
    />
  );
}

describe('interactive store integration', () => {
  it('player name updates reactively via input', async () => {
    const user = userEvent.setup();
    render(<NameInput />);
    const input = screen.getByTestId('name-input');
    await user.clear(input);
    await user.type(input, 'Han');
    expect(useGameStore.getState().playerName).toBe('Han');
  });
});
