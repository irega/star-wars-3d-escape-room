import { create } from 'zustand';

type InputFeedback = 'none' | 'wrong';

interface ControlRoomTerminalState {
  active: boolean;
  sequenceRevealed: boolean;
  inputBuffer: string[];
  inputFeedback: InputFeedback;
  open: () => void;
  close: () => void;
  setInputBuffer: (update: string[] | ((prev: string[]) => string[])) => void;
  setInputFeedback: (feedback: InputFeedback) => void;
  reset: () => void;
}

const initialState = {
  active: false,
  sequenceRevealed: false,
  inputBuffer: [] as string[],
  inputFeedback: 'none' as InputFeedback,
};

export const useControlRoomTerminalStore = create<ControlRoomTerminalState>((set) => ({
  ...initialState,
  open: () => set({ active: true, sequenceRevealed: true, inputBuffer: [], inputFeedback: 'none' }),
  close: () =>
    set({ active: false, sequenceRevealed: false, inputBuffer: [], inputFeedback: 'none' }),
  setInputBuffer: (update) =>
    set((state) => ({
      inputBuffer: typeof update === 'function' ? update(state.inputBuffer) : update,
    })),
  setInputFeedback: (inputFeedback) => set({ inputFeedback }),
  reset: () => set(initialState),
}));
