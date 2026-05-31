import { useGameStore } from '../stores/useGameStore';
import { HintTrigger } from './HintTrigger';
import { getLevel } from '../levels';

/** Timed hint triggers live in the DOM tree — not inside R3F Canvas (setTimeout unreliable there). */
export function RoomHintTriggers() {
  const phase = useGameStore((s) => s.phase);
  const currentRoom = useGameStore((s) => s.currentRoom);

  if (phase !== 'playing') return null;

  const level = getLevel(currentRoom);
  return <HintTrigger puzzleId={level.puzzleId} delays={level.hintDelays} />;
}
