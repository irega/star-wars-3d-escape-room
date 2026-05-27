import { useEffect } from 'react';
import { useHintStore } from '../stores/useHintStore';

export interface HintTriggerProps {
  puzzleId: number;
  delays: number[];
}

export function HintTrigger({ puzzleId, delays }: HintTriggerProps) {
  const advanceHint = useHintStore((s) => s.advanceHint);

  useEffect(() => {
    const timers = delays.map((delay) => setTimeout(() => advanceHint(puzzleId), delay));
    return () => timers.forEach(clearTimeout);
    // delays intentionally not in deps — callers pass stable arrays; re-subscribing on every
    // render would reset all pending timers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId, advanceHint]);

  return null;
}
