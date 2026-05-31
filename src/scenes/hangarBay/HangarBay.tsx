import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InteractiveObject } from '../../components/InteractiveObject';
import { useGameStore } from '../../stores/useGameStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { usePuzzleSolved, useRoomExit } from '../../levels';
import { validateLaunchClearance, PUZZLE_4_ID } from './puzzle/hangarBayPuzzle';
import { ForceFieldBarrier } from './ForceFieldBarrier';
import { HangarBayEnvironment } from './HangarBayEnvironment';
import { ImperialShuttle } from './ImperialShuttle';
import { LaunchConsole } from './LaunchConsole';

export const SCENE4_WORLD = {
  console: [0, 0.5, -0.5] as [number, number, number],
};

export interface HangarBayProps {
  onDialogue?: (text: string | null) => void;
}

export function HangarBay({ onDialogue }: HangarBayProps) {
  const { t } = useTranslation();
  const [consoleActive, setConsoleActive] = useState(false);

  const hasKeycard = useInventoryStore((s) => s.hasItem('keycard'));
  const hasOverrideCode = useInventoryStore((s) => s.hasItem('override-code'));
  const hasFrequency = useInventoryStore((s) => s.hasItem('frequency'));

  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const win = useGameStore((s) => s.win);
  const puzzleSolved = usePuzzleSolved('hangar-bay');

  const canLaunch = validateLaunchClearance(hasKeycard, hasOverrideCode, hasFrequency);
  const handleShuttleClick = useRoomExit('hangar-bay', onDialogue);

  const handleConsoleOpen = useCallback(() => {
    if (puzzleSolved || consoleActive) return;
    setConsoleActive(true);
  }, [puzzleSolved, consoleActive]);

  const handleLaunch = useCallback(() => {
    if (!canLaunch) return;
    solvePuzzle(PUZZLE_4_ID);
    win();
    setConsoleActive(false);
    onDialogue?.(t('puzzle4.launch.success'));
  }, [canLaunch, solvePuzzle, win, t, onDialogue]);

  return (
    <group>
      <HangarBayEnvironment />

      <InteractiveObject testId="shuttle" onClick={handleShuttleClick}>
        <ImperialShuttle cleared={puzzleSolved} />
      </InteractiveObject>

      <ForceFieldBarrier active={!puzzleSolved} />

      <LaunchConsole
        testId="console"
        position={SCENE4_WORLD.console}
        active={consoleActive}
        disabled={puzzleSolved || consoleActive}
        puzzleSolved={puzzleSolved}
        canLaunch={canLaunch}
        slotsFilled={[hasKeycard, hasOverrideCode, hasFrequency]}
        onOpen={handleConsoleOpen}
        onClose={() => setConsoleActive(false)}
        onLaunch={handleLaunch}
      />
    </group>
  );
}
