import { useGameStore } from '../stores/useGameStore';
import { HintTrigger } from './HintTrigger';
import { PUZZLE_1_ID, PUZZLE_1_HINT_DELAYS } from '../scenes/detentionCellPuzzle';
import { PUZZLE_2_ID, PUZZLE_2_HINT_DELAYS } from '../scenes/controlRoomPuzzle';
import { PUZZLE_3_ID, PUZZLE_3_HINT_DELAYS } from '../scenes/corridorPuzzle';
import { PUZZLE_4_ID, PUZZLE_4_HINT_DELAYS } from '../scenes/hangarBayPuzzle';

/** Timed hint triggers live in the DOM tree — not inside R3F Canvas (setTimeout unreliable there). */
export function RoomHintTriggers() {
  const phase = useGameStore((s) => s.phase);
  const currentRoom = useGameStore((s) => s.currentRoom);

  if (phase !== 'playing') return null;

  switch (currentRoom) {
    case 'detention-cell':
      return <HintTrigger puzzleId={PUZZLE_1_ID} delays={PUZZLE_1_HINT_DELAYS} />;
    case 'control-room':
      return <HintTrigger puzzleId={PUZZLE_2_ID} delays={PUZZLE_2_HINT_DELAYS} />;
    case 'corridor':
      return <HintTrigger puzzleId={PUZZLE_3_ID} delays={PUZZLE_3_HINT_DELAYS} />;
    case 'hangar-bay':
      return <HintTrigger puzzleId={PUZZLE_4_ID} delays={PUZZLE_4_HINT_DELAYS} />;
    default:
      return null;
  }
}
