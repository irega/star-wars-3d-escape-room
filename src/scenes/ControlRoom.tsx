import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { useControlRoomTerminalStore } from '../stores/useControlRoomTerminalStore';
import { InteractiveObject } from '../components/InteractiveObject';
import {
  BlastDoor,
  HologramScreen,
  ImperialRoomShell,
  TerminalConsole,
  imperialPalette,
} from '../three';
import { useRoomExit, usePuzzleSolved } from '../levels';
import { validateSequence, PUZZLE_2_ID, SEQUENCE_HIGHLIGHT_MS } from './controlRoomPuzzle';

// World coordinates for interactive objects in this scene
export const SCENE2_WORLD = {
  terminal: [-2.75, 1.4, -0.8] as [number, number, number],
  door: [0, 1.4, -3.92] as [number, number, number],
};

const SYMBOL_COLOR = '#f4f8ff';

export const SCREENS = [
  {
    x: -2.25,
    label: 'AUREK',
    symbol: 'A',
    tint: '#2d6eb5',
    highlightTint: '#5ca8ff',
  },
  {
    x: -0.75,
    label: 'UNESH',
    symbol: 'U',
    tint: '#1f8f8a',
    highlightTint: '#4fd9d2',
  },
  {
    x: 0.75,
    label: 'RESH',
    symbol: 'R',
    tint: '#7a4cad',
    highlightTint: '#b87aff',
  },
  {
    x: 2.25,
    label: 'ESH',
    symbol: 'E',
    tint: '#2d9458',
    highlightTint: '#5ee088',
  },
] as const;

type Bar = {
  pos: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
};

export const AUREBESH_SYMBOL_BARS: Record<string, Bar[]> = {
  A: [
    { pos: [-0.125, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [-0.03, 0, 0.06], size: [0.14, 0.05, 0.02] },
    { pos: [0.085, 0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, 0.93] },
    { pos: [0.085, -0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, -0.93] },
  ],
  U: [
    { pos: [-0.13, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [0, -0.14, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.13, -0.03, 0.06], size: [0.05, 0.24, 0.02] },
    { pos: [-0.03, 0.14, 0.06], size: [0.18, 0.05, 0.02] },
    { pos: [0, 0, 0.06], size: [0.24, 0.05, 0.02], rotation: [0, 0, 0.62] },
  ],
  R: [
    { pos: [0, 0.15, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.01, -0.01, 0.06], size: [0.38, 0.05, 0.02], rotation: [0, 0, -2.38] },
  ],
  E: [
    { pos: [-0.095, -0.01, 0.06], size: [0.25, 0.05, 0.02], rotation: [0, 0, -1.22] },
    { pos: [-0.02, -0.01, 0.06], size: [0.24, 0.05, 0.02], rotation: [0, 0, 1.33] },
    { pos: [0.11, 0, 0.06], size: [0.05, 0.3, 0.02] },
  ],
};

export interface ControlRoomProps {
  onDialogue?: (text: string | null) => void;
}

export function ControlRoom({ onDialogue }: ControlRoomProps) {
  const { t } = useTranslation();

  const terminalActive = useControlRoomTerminalStore((s) => s.active);
  const openTerminal = useControlRoomTerminalStore((s) => s.open);
  const closeTerminal = useControlRoomTerminalStore((s) => s.close);
  const setInputBuffer = useControlRoomTerminalStore((s) => s.setInputBuffer);
  const setInputFeedback = useControlRoomTerminalStore((s) => s.setInputFeedback);

  const addItem = useInventoryStore((s) => s.addItem);
  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const puzzleSolved = usePuzzleSolved('control-room');
  const hintLevel = useHintStore((s) => s.hintLevels[PUZZLE_2_ID] ?? 0);
  const handleDoorClick = useRoomExit('control-room', onDialogue);
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
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.value = 180;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // audio unavailable
        }
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

  const doorIndicatorColor = puzzleSolved
    ? imperialPalette.indicatorOpen
    : imperialPalette.indicatorLocked;
  const doorIndicatorEmissive = puzzleSolved
    ? imperialPalette.indicatorOpenEmissive
    : imperialPalette.indicatorLockedEmissive;

  const terminalScreenColor = puzzleSolved ? '#003300' : '#001133';
  const terminalScreenEmissive = puzzleSolved ? '#00aa22' : terminalActive ? '#0044cc' : '#003388';
  const showSequence = terminalActive;

  return (
    <group>
      <pointLight position={[0, 2, -3]} intensity={0.7} color="#4466bb" distance={5} decay={2} />
      <pointLight
        position={[-2.5, 2, -1]}
        intensity={0.55}
        color="#4466bb"
        distance={4}
        decay={2}
      />
      <pointLight position={[0, 3.2, -2]} intensity={0.5} color="#8899cc" distance={6} decay={2} />

      <ImperialRoomShell floorColor="#222838" wallBackColor="#283858" wallSideColor="#262a3a" />

      {showSequence &&
        SCREENS.map((screen, i) => {
          const isFirstScreen = i === 0;
          const hintBoost = isFirstScreen && hintLevel >= 1 && sequenceHighlight;
          const tint = hintBoost ? screen.highlightTint : screen.tint;
          const bezelIntensity = sequenceHighlight ? 1.1 : 0.65;
          const faceIntensity = sequenceHighlight ? (hintBoost ? 1.6 : 1.25) : 0.85;

          return (
            <group key={screen.symbol} position={[screen.x, 2.75, -3.88]}>
              <HologramScreen
                emissive={tint}
                emissiveIntensity={bezelIntensity}
                faceEmissiveIntensity={faceIntensity}
                wallGlow={sequenceHighlight}
              >
                {AUREBESH_SYMBOL_BARS[screen.symbol].map((bar, j) => (
                  <mesh key={j} position={bar.pos} rotation={bar.rotation ?? [0, 0, 0]}>
                    <boxGeometry args={bar.size} />
                    <meshStandardMaterial
                      color={SYMBOL_COLOR}
                      emissive={SYMBOL_COLOR}
                      emissiveIntensity={sequenceHighlight ? 2.6 : 1.9}
                    />
                  </mesh>
                ))}
              </HologramScreen>
            </group>
          );
        })}

      <InteractiveObject onClick={handleTerminalClick} isDisabled={puzzleSolved || terminalActive}>
        <group position={SCENE2_WORLD.terminal} rotation={[0, Math.PI / 2, 0]}>
          <TerminalConsole
            screenColor={terminalScreenColor}
            screenEmissive={terminalScreenEmissive}
            indicatorColor={doorIndicatorColor}
            indicatorEmissive={doorIndicatorEmissive}
          />
        </group>
      </InteractiveObject>

      <InteractiveObject onClick={handleDoorClick}>
        <group position={SCENE2_WORLD.door}>
          <BlastDoor unlocked={puzzleSolved} />
        </group>
      </InteractiveObject>
    </group>
  );
}
