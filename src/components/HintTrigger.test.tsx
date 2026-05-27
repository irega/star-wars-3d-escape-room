import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { HintTrigger } from './HintTrigger';
import { useHintStore } from '../stores/useHintStore';

beforeEach(() => {
  vi.useFakeTimers();
  useHintStore.getState().reset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HintTrigger', () => {
  it('renders nothing visible', () => {
    const { container } = render(<HintTrigger puzzleId={1} delays={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not advance hint before any delay elapses', () => {
    render(<HintTrigger puzzleId={1} delays={[1000]} />);
    act(() => vi.advanceTimersByTime(999));
    expect(useHintStore.getState().getHintLevel(1)).toBe(0);
  });

  it('advances hint level after the first delay', () => {
    render(<HintTrigger puzzleId={1} delays={[1000]} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(useHintStore.getState().getHintLevel(1)).toBe(1);
  });

  it('advances hint level once per delay', () => {
    render(<HintTrigger puzzleId={1} delays={[1000, 3000]} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(useHintStore.getState().getHintLevel(1)).toBe(1);
    act(() => vi.advanceTimersByTime(2000));
    expect(useHintStore.getState().getHintLevel(1)).toBe(2);
  });

  it('affects only the specified puzzleId', () => {
    render(<HintTrigger puzzleId={2} delays={[500]} />);
    act(() => vi.advanceTimersByTime(500));
    expect(useHintStore.getState().getHintLevel(2)).toBe(1);
    expect(useHintStore.getState().getHintLevel(1)).toBe(0);
  });

  it('clears pending timers on unmount', () => {
    const { unmount } = render(<HintTrigger puzzleId={1} delays={[1000]} />);
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(useHintStore.getState().getHintLevel(1)).toBe(0);
  });
});
