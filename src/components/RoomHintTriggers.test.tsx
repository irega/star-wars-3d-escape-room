import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { RoomHintTriggers } from './RoomHintTriggers';
import { useGameStore } from '../stores/useGameStore';
import { useHintStore } from '../stores/useHintStore';
import { PUZZLE_1_HINT_DELAYS } from '../scenes/detentionCell/detentionCellPuzzle';

describe('RoomHintTriggers', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useHintStore.getState().reset();
  });

  it('does not advance hints during intro', () => {
    vi.useFakeTimers();
    render(<RoomHintTriggers />);
    vi.advanceTimersByTime(PUZZLE_1_HINT_DELAYS[0] + 1000);
    expect(useHintStore.getState().getHintLevel(1)).toBe(0);
    vi.useRealTimers();
  });

  it('advances detention-cell hints when playing in that room', () => {
    vi.useFakeTimers();
    useGameStore.setState({ phase: 'playing', currentRoom: 'detention-cell' });
    render(<RoomHintTriggers />);
    vi.advanceTimersByTime(PUZZLE_1_HINT_DELAYS[0]);
    expect(useHintStore.getState().getHintLevel(1)).toBe(1);
    vi.useRealTimers();
  });
});
