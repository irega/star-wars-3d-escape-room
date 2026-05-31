import { useHintStore } from '../../stores/useHintStore';
import { InteractiveObject } from '../../components/InteractiveObject';
import { BlastDoor, TerminalConsole, imperialPalette } from '../../three';
import { useRoomExit } from '../../levels';
import { PUZZLE_2_ID } from './controlRoomPuzzle';
import { AurebeshHologramScreens } from './AurebeshHologramScreens';
import { ControlRoomEnvironment } from './ControlRoomEnvironment';
import { useControlRoomTerminal } from './useControlRoomTerminal';

export const SCENE2_WORLD = {
  terminal: [-2.75, 1.4, -0.8] as [number, number, number],
  door: [0, 1.4, -3.92] as [number, number, number],
};

export interface ControlRoomProps {
  onDialogue?: (text: string | null) => void;
}

export function ControlRoom({ onDialogue }: ControlRoomProps) {
  const hintLevel = useHintStore((s) => s.hintLevels[PUZZLE_2_ID] ?? 0);
  const handleDoorClick = useRoomExit('control-room', onDialogue);

  const { terminalActive, puzzleSolved, sequenceHighlight, handleTerminalClick } =
    useControlRoomTerminal({ onDialogue });

  const doorIndicatorColor = puzzleSolved
    ? imperialPalette.indicatorOpen
    : imperialPalette.indicatorLocked;
  const doorIndicatorEmissive = puzzleSolved
    ? imperialPalette.indicatorOpenEmissive
    : imperialPalette.indicatorLockedEmissive;

  const terminalScreenColor = puzzleSolved ? '#003300' : '#001133';
  const terminalScreenEmissive = puzzleSolved ? '#00aa22' : terminalActive ? '#0044cc' : '#003388';

  return (
    <group>
      <ControlRoomEnvironment />

      {terminalActive && (
        <AurebeshHologramScreens hintLevel={hintLevel} sequenceHighlight={sequenceHighlight} />
      )}

      <InteractiveObject
        testId="terminal"
        onClick={handleTerminalClick}
        isDisabled={puzzleSolved || terminalActive}
      >
        <group position={SCENE2_WORLD.terminal} rotation={[0, Math.PI / 2, 0]}>
          <TerminalConsole
            screenColor={terminalScreenColor}
            screenEmissive={terminalScreenEmissive}
            indicatorColor={doorIndicatorColor}
            indicatorEmissive={doorIndicatorEmissive}
          />
        </group>
      </InteractiveObject>

      <InteractiveObject testId="door" onClick={handleDoorClick}>
        <group position={SCENE2_WORLD.door}>
          <BlastDoor unlocked={puzzleSolved} />
        </group>
      </InteractiveObject>
    </group>
  );
}
