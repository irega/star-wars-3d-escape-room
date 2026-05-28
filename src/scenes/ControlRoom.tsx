import { useState, useEffect, useCallback } from 'react';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { InteractiveObject } from '../components/InteractiveObject';
import { HintTrigger } from '../components/HintTrigger';
import {
  validateSequence,
  canExitControlRoom,
  PUZZLE_2_ID,
  PUZZLE_2_HINT_DELAYS,
} from './controlRoomPuzzle';

// Each screen has a distinct Aurebesh symbol and color identity
export const SCREENS = [
  { x: -2.25, label: 'AUREK', symbol: 'A', emissive: '#0055cc', activeEmissive: '#0077ff' },
  { x: -0.75, label: 'UNESH', symbol: 'U', emissive: '#007777', activeEmissive: '#009999' },
  { x: 0.75, label: 'RESH', symbol: 'R', emissive: '#660099', activeEmissive: '#8800cc' },
  { x: 2.25, label: 'ESH', symbol: 'E', emissive: '#006633', activeEmissive: '#009944' },
];

type Bar = {
  pos: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
};

// Aurebesh A U R E — bar compositions matching canonical letter shapes (aurebesh.org)
export const AUREBESH_SYMBOL_BARS: Record<string, Bar[]> = {
  // AUREK (A): left stem → mid arm → fork opening right (>)
  A: [
    { pos: [-0.125, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [-0.03, 0, 0.06], size: [0.14, 0.05, 0.02] },
    { pos: [0.085, 0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, 0.93] },
    { pos: [0.085, -0.06, 0.06], size: [0.13, 0.05, 0.02], rotation: [0, 0, -0.93] },
  ],
  // USK (U): open top-right frame + interior diagonal
  U: [
    { pos: [-0.13, 0, 0.06], size: [0.05, 0.32, 0.02] },
    { pos: [0, -0.14, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.13, -0.03, 0.06], size: [0.05, 0.24, 0.02] },
    { pos: [-0.03, 0.14, 0.06], size: [0.18, 0.05, 0.02] },
    { pos: [0, 0, 0.06], size: [0.24, 0.05, 0.02], rotation: [0, 0, 0.62] },
  ],
  // RESH (R): classic "7" — top bar, diagonal from top-right down to bottom-left
  R: [
    { pos: [0, 0.15, 0.06], size: [0.28, 0.05, 0.02] },
    { pos: [0.01, -0.01, 0.06], size: [0.38, 0.05, 0.02], rotation: [0, 0, -2.38] },
  ],
  // ESK (E): "VI" — V on the left + separate vertical stroke on the right
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

  const [terminalActive, setTerminalActive] = useState(false);
  const [inputBuffer, setInputBuffer] = useState<string[]>([]);
  const [inputFeedback, setInputFeedback] = useState<'none' | 'wrong'>('none');

  const addItem = useInventoryStore((s) => s.addItem);
  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const moveToRoom = useGameStore((s) => s.moveToRoom);
  const solvedPuzzles = useGameStore((s) => s.solvedPuzzles);
  const puzzleSolved = solvedPuzzles.includes(PUZZLE_2_ID);
  const hintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_2_ID));

  const handleTerminalClick = useCallback(() => {
    if (puzzleSolved || terminalActive) return;
    setInputBuffer([]);
    setInputFeedback('none');
    setTerminalActive(true);
  }, [puzzleSolved, terminalActive]);

  const handleDoorClick = useCallback(() => {
    if (canExitControlRoom(puzzleSolved)) {
      moveToRoom('corridor');
    } else {
      onDialogue?.(t('puzzle2.door.locked'));
    }
  }, [puzzleSolved, moveToRoom, t, onDialogue]);

  const submitInput = useCallback(
    (buffer: string[]) => {
      if (validateSequence(buffer)) {
        addItem('override-code');
        solvePuzzle(PUZZLE_2_ID);
        setTerminalActive(false);
        setInputBuffer([]);
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
    [addItem, solvePuzzle, t, onDialogue],
  );

  useEffect(() => {
    if (!terminalActive) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTerminalActive(false);
        setInputBuffer([]);
        setInputFeedback('none');
        return;
      }
      if (e.key === 'Backspace') {
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === 'Enter') {
        setInputBuffer((prev) => {
          submitInput(prev);
          return prev;
        });
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
  }, [terminalActive, submitInput]);

  const doorColor = puzzleSolved ? '#1e3a1e' : '#1a1a2e';
  const doorEmissive = puzzleSolved ? '#0d3311' : '#00001a';
  const doorIndicatorColor = puzzleSolved ? '#44ff44' : '#ff4444';
  const doorIndicatorEmissive = puzzleSolved ? '#004400' : '#440000';

  const terminalScreenColor = puzzleSolved ? '#003300' : '#001133';
  const terminalScreenEmissive = puzzleSolved ? '#00aa22' : terminalActive ? '#0044cc' : '#003388';

  return (
    <group>
      <HintTrigger puzzleId={PUZZLE_2_ID} delays={PUZZLE_2_HINT_DELAYS} />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={1.0} color="#5577aa" />
      <pointLight position={[0, 2, -3]} intensity={0.7} color="#2244aa" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#161626" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#0a0a18" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.75, -4]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#111122" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#181828" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#181828" />
      </mesh>

      {/* Holographic screens on back wall — read left to right: A U R E */}
      {SCREENS.map((screen, i) => {
        const isFirstScreen = i === 0;
        const screenEmissive =
          isFirstScreen && hintLevel >= 1 ? screen.activeEmissive : screen.emissive;
        return (
          <group key={screen.symbol} position={[screen.x, 2.1, -3.88]}>
            {/* Screen frame */}
            <mesh>
              <boxGeometry args={[0.85, 0.85, 0.06]} />
              <meshStandardMaterial
                color="#0a0a1a"
                emissive={screenEmissive}
                emissiveIntensity={1.8}
              />
            </mesh>
            {/* Screen face — inner glow panel */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.7, 0.7, 0.01]} />
              <meshStandardMaterial
                color="#000011"
                emissive={screenEmissive}
                emissiveIntensity={isFirstScreen && hintLevel >= 1 ? 2.5 : 1.8}
              />
            </mesh>
            {/* Symbol indicator — unique bar composition per Aurebesh letter */}
            {AUREBESH_SYMBOL_BARS[screen.symbol].map((bar, j) => (
              <mesh key={j} position={bar.pos} rotation={bar.rotation ?? [0, 0, 0]}>
                <boxGeometry args={bar.size} />
                <meshStandardMaterial color={screenEmissive} emissive={screenEmissive} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Main terminal — central input station */}
      <InteractiveObject onClick={handleTerminalClick} isDisabled={puzzleSolved || terminalActive}>
        <group position={[0, 0, -0.5]}>
          {/* Terminal body */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.4, 1.0, 0.5]} />
            <meshStandardMaterial color="#0a0a18" emissive="#000011" />
          </mesh>
          {/* Terminal screen surface */}
          <mesh position={[0, 0.65, 0.26]}>
            <boxGeometry args={[1.1, 0.55, 0.02]} />
            <meshStandardMaterial
              color={terminalScreenColor}
              emissive={terminalScreenEmissive}
              emissiveIntensity={1.5}
            />
          </mesh>
          {/* Keyboard row */}
          <mesh position={[0, 0.18, 0.26]}>
            <boxGeometry args={[1.0, 0.12, 0.02]} />
            <meshStandardMaterial color="#111122" emissive="#001133" />
          </mesh>
          {/* Status indicator light */}
          <mesh position={[0.5, 0.18, 0.27]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial
              color={doorIndicatorColor}
              emissive={doorIndicatorEmissive}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </InteractiveObject>

      {/* Blast door — locked until puzzle solved */}
      <InteractiveObject onClick={handleDoorClick}>
        <group position={[0, 1.4, -3.92]}>
          {/* Door frame */}
          {[
            {
              pos: [-1.0, 0, 0] as [number, number, number],
              args: [0.2, 2.8, 0.1] as [number, number, number],
            },
            {
              pos: [1.0, 0, 0] as [number, number, number],
              args: [0.2, 2.8, 0.1] as [number, number, number],
            },
            {
              pos: [0, 1.3, 0] as [number, number, number],
              args: [2.2, 0.2, 0.1] as [number, number, number],
            },
            {
              pos: [0, -1.3, 0] as [number, number, number],
              args: [2.2, 0.2, 0.1] as [number, number, number],
            },
          ].map(({ pos, args }, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={args} />
              <meshStandardMaterial color={doorColor} emissive={doorEmissive} />
            </mesh>
          ))}
          {/* Door panel (solid blast door, not bars) */}
          <mesh>
            <boxGeometry args={[1.6, 2.4, 0.06]} />
            <meshStandardMaterial color={doorColor} emissive={doorEmissive} />
          </mesh>
          {/* Door center seam */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.04, 2.4, 0.02]} />
            <meshStandardMaterial color="#334466" emissive="#112233" />
          </mesh>
          {/* Status indicator */}
          <mesh position={[0.9, -0.9, 0.08]}>
            <boxGeometry args={[0.16, 0.07, 0.04]} />
            <meshStandardMaterial color={doorIndicatorColor} emissive={doorIndicatorEmissive} />
          </mesh>
        </group>
      </InteractiveObject>

      {/* Terminal input overlay — shown when terminal is active */}
      {terminalActive && (
        <Html fullscreen>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.75)',
              zIndex: 30,
              fontFamily: '"Courier New", Courier, monospace',
            }}
          >
            <div
              style={{
                border: '1px solid #ffd700',
                padding: '2rem',
                background: 'rgba(0,0,16,0.95)',
                minWidth: '380px',
                color: '#ffd700',
              }}
            >
              <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                {t('puzzle2.terminal.header')}
              </div>
              <div style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                {t('puzzle2.terminal.prompt')}
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  letterSpacing: '0.3em',
                  marginBottom: '1rem',
                  color: inputFeedback === 'wrong' ? '#ff4444' : '#ffd700',
                }}
              >
                {'> '}
                {inputBuffer.join('')}
                {inputBuffer.length < 4 && inputFeedback !== 'wrong' && (
                  <span style={{ animation: 'none' }}>_</span>
                )}
              </div>
              {inputFeedback === 'wrong' && (
                <div style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {t('puzzle2.terminal.wrong')}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                {t('puzzle2.terminal.instructions')}
              </div>
              <button
                onClick={() => {
                  setTerminalActive(false);
                  setInputBuffer([]);
                  setInputFeedback('none');
                }}
                style={{
                  marginTop: '1.25rem',
                  background: 'transparent',
                  border: '1px solid #ffd700',
                  color: '#ffd700',
                  padding: '0.4rem 1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                }}
              >
                {t('dialogue.close')}
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
