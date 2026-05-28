import { describe, it, expect, beforeEach } from 'vitest';
import { useControlRoomTerminalStore } from './useControlRoomTerminalStore';

describe('useControlRoomTerminalStore', () => {
  beforeEach(() => {
    useControlRoomTerminalStore.getState().reset();
  });

  it('opens terminal and reveals sequence', () => {
    useControlRoomTerminalStore.getState().open();
    const state = useControlRoomTerminalStore.getState();
    expect(state.active).toBe(true);
    expect(state.sequenceRevealed).toBe(true);
  });

  it('closes terminal, clears input, and hides sequence', () => {
    useControlRoomTerminalStore.getState().open();
    useControlRoomTerminalStore.getState().setInputBuffer(['A']);
    useControlRoomTerminalStore.getState().close();
    const state = useControlRoomTerminalStore.getState();
    expect(state.active).toBe(false);
    expect(state.sequenceRevealed).toBe(false);
    expect(state.inputBuffer).toEqual([]);
  });
});
