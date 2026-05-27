import { create } from 'zustand';

export const MAX_HINT_LEVEL = 3;

interface HintState {
  hintLevels: Record<number, number>;
  advanceHint: (puzzleId: number) => void;
  getHintLevel: (puzzleId: number) => number;
  reset: () => void;
}

export const useHintStore = create<HintState>((set, get) => ({
  hintLevels: {},
  advanceHint: (puzzleId) =>
    set((state) => {
      const current = state.hintLevels[puzzleId] ?? 0;
      return {
        hintLevels: {
          ...state.hintLevels,
          [puzzleId]: Math.min(current + 1, MAX_HINT_LEVEL),
        },
      };
    }),
  getHintLevel: (puzzleId) => get().hintLevels[puzzleId] ?? 0,
  reset: () => set({ hintLevels: {} }),
}));
