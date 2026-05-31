import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/useGameStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useHintStore } from '../../stores/useHintStore';
import { usePuzzleSolved } from '../../levels';
import {
  areAllSlotsCorrect,
  cycleOrientation,
  shouldExtractFromSlot,
  CELL_SOLUTIONS,
  PUZZLE_3_ID,
  type CellOrientation,
} from './corridorPuzzle';
import { LAUNCH_FREQUENCY } from './launchFrequency';

interface CellState {
  orientation: CellOrientation;
  placedInSlot: number | null;
}

export interface UseCorridorPuzzleOptions {
  onDialogue?: (text: string | null) => void;
}

export function useCorridorPuzzle({ onDialogue }: UseCorridorPuzzleOptions = {}) {
  const { t } = useTranslation();

  const [cells, setCells] = useState<CellState[]>([
    { orientation: 0, placedInSlot: null },
    { orientation: 0, placedInSlot: null },
    { orientation: 0, placedInSlot: null },
  ]);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [schematicOpen, setSchematicOpen] = useState(false);

  const addItem = useInventoryStore((s) => s.addItem);
  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const puzzleSolved = usePuzzleSolved('corridor');
  const hintLevel = useHintStore((s) => s.hintLevels[PUZZLE_3_ID] ?? 0);

  const slotPlacements = CELL_SOLUTIONS.map((_, slotIndex) => {
    const cellId = cells.findIndex((c) => c.placedInSlot === slotIndex);
    if (cellId === -1) return null;
    return { cellId, orientation: cells[cellId].orientation };
  });

  const handleCellClick = useCallback(
    (cellId: number) => {
      if (puzzleSolved) return;
      if (selectedCellId === cellId) {
        setCells((cs) =>
          cs.map((c, id) =>
            id === cellId ? { ...c, orientation: cycleOrientation(c.orientation) } : c,
          ),
        );
      } else {
        setSelectedCellId(cellId);
      }
    },
    [puzzleSolved, selectedCellId],
  );

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      if (puzzleSolved) return;

      const slotOccupied = cells.some((c) => c.placedInSlot === slotIndex);

      if (shouldExtractFromSlot(selectedCellId, slotOccupied, puzzleSolved)) {
        setCells((prev) =>
          prev.map((c) => (c.placedInSlot === slotIndex ? { ...c, placedInSlot: null } : c)),
        );
        return;
      }

      if (selectedCellId === null) return;

      setCells((prev) => {
        const next = prev.map((c, id) => {
          if (c.placedInSlot === slotIndex && id !== selectedCellId) {
            return { ...c, placedInSlot: null };
          }
          if (id === selectedCellId) {
            return { ...c, placedInSlot: slotIndex };
          }
          return c;
        });

        const newPlacements = CELL_SOLUTIONS.map((_, si) => {
          const cId = next.findIndex((c) => c.placedInSlot === si);
          if (cId === -1) return null;
          return { cellId: cId, orientation: next[cId].orientation };
        });

        if (areAllSlotsCorrect(newPlacements)) {
          setTimeout(() => {
            addItem('frequency');
            solvePuzzle(PUZZLE_3_ID);
            onDialogue?.(t('puzzle3.solved', { freq: LAUNCH_FREQUENCY }));
          }, 0);
        }

        return next;
      });

      setSelectedCellId(null);
    },
    [cells, selectedCellId, puzzleSolved, addItem, solvePuzzle, t, onDialogue],
  );

  useEffect(() => {
    if (!schematicOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSchematicOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [schematicOpen]);

  return {
    cells,
    selectedCellId,
    schematicOpen,
    setSchematicOpen,
    slotPlacements,
    puzzleSolved,
    hintLevel,
    handleCellClick,
    handleSlotClick,
  };
}
