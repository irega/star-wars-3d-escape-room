import { create } from 'zustand';

export type Room = 'detention-cell' | 'control-room' | 'corridor' | 'hangar-bay';
export type GamePhase = 'intro' | 'playing' | 'won';

interface GameState {
  playerName: string;
  currentRoom: Room;
  solvedPuzzles: number[];
  phase: GamePhase;
  setPlayerName: (name: string) => void;
  startGame: () => void;
  moveToRoom: (room: Room) => void;
  solvePuzzle: (puzzleId: number) => void;
  win: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  playerName: 'Rebel',
  currentRoom: 'detention-cell' as Room,
  solvedPuzzles: [] as number[],
  phase: 'intro' as GamePhase,
};

export const useGameStore = create<GameState>((set) => ({
  ...INITIAL_STATE,
  setPlayerName: (name) => set({ playerName: name }),
  startGame: () => set({ phase: 'playing' }),
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
