import { create } from 'zustand';

export type Room = 'detention-cell' | 'control-room' | 'corridor' | 'hangar-bay';
export type GamePhase = 'playing' | 'won';

interface GameState {
  playerName: string;
  currentRoom: Room;
  solvedPuzzles: number[];
  phase: GamePhase;
  setPlayerName: (name: string) => void;
  moveToRoom: (room: Room) => void;
  solvePuzzle: (puzzleId: number) => void;
  win: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  playerName: 'Rebel',
  currentRoom: 'detention-cell' as Room,
  solvedPuzzles: [] as number[],
  phase: 'playing' as GamePhase,
};

export const useGameStore = create<GameState>((set) => ({
  ...INITIAL_STATE,
  setPlayerName: (name) => set({ playerName: name }),
  moveToRoom: (room) => set({ currentRoom: room }),
  solvePuzzle: (puzzleId) =>
    set((state) => ({
      solvedPuzzles: state.solvedPuzzles.includes(puzzleId)
        ? state.solvedPuzzles
        : [...state.solvedPuzzles, puzzleId],
    })),
  win: () => set({ phase: 'won' }),
  reset: () => set(INITIAL_STATE),
}));
