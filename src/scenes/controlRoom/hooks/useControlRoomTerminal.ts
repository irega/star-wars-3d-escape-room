import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../../stores/useGameStore';
import { useInventoryStore } from '../../../stores/useInventoryStore';
import { useControlRoomTerminalStore } from '../../../stores/useControlRoomTerminalStore';
import { usePuzzleSolved } from '../../../levels';
import { validateSequence, PUZZLE_2_ID, SEQUENCE_HIGHLIGHT_MS } from '../puzzle/controlRoomPuzzle';
import { playTone } from '../../../audio/playTone';

export interface UseControlRoomTerminalOptions {
  onDialogue?: (text: string | null) => void;
}

export function useControlRoomTerminal({ onDialogue }: UseControlRoomTerminalOptions = {}) {
  const { t } = useTranslation();

  const terminalActive = useControlRoomTerminalStore((s) => s.active);
  const openTerminal = useControlRoomTerminalStore((s) => s.open);
  const closeTerminal = useControlRoomTerminalStore((s) => s.close);
  const setInputBuffer = useControlRoomTerminalStore((s) => s.setInputBuffer);
  const setInputFeedback = useControlRoomTerminalStore((s) => s.setInputFeedback);

  const addItem = useInventoryStore((s) => s.addItem);
  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const puzzleSolved = usePuzzleSolved('control-room');

  const [highlightPulse, setHighlightPulse] = useState(true);
  const sequenceHighlight = terminalActive && highlightPulse;

  useEffect(() => {
    if (!terminalActive) return;

    const timer = setTimeout(() => setHighlightPulse(false), SEQUENCE_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [terminalActive]);

  const handleTerminalClick = useCallback(() => {
    if (puzzleSolved || terminalActive) return;
    setHighlightPulse(true);
    openTerminal();
  }, [puzzleSolved, terminalActive, openTerminal]);

  const submitInput = useCallback(
    (buffer: string[]) => {
      if (validateSequence(buffer)) {
        addItem('override-code');
        solvePuzzle(PUZZLE_2_ID);
        closeTerminal();
        onDialogue?.(t('puzzle2.terminal.correct'));
      } else {
        setInputFeedback('wrong');
        playTone(180, 400, 'sawtooth');
        setTimeout(() => {
          setInputBuffer([]);
          setInputFeedback('none');
        }, 1500);
      }
    },
    [addItem, solvePuzzle, closeTerminal, setInputBuffer, setInputFeedback, t, onDialogue],
  );

  useEffect(() => {
    if (!terminalActive) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTerminal();
        return;
      }
      if (e.key === 'Backspace') {
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === 'Enter') {
        const buffer = useControlRoomTerminalStore.getState().inputBuffer;
        submitInput(buffer);
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        setInputBuffer((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, e.key.toUpperCase()];
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [terminalActive, submitInput, closeTerminal, setInputBuffer]);

  return {
    terminalActive,
    puzzleSolved,
    sequenceHighlight,
    handleTerminalClick,
  };
}
