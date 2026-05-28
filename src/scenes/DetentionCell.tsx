import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { InteractiveObject } from '../components/InteractiveObject';
import { HintTrigger } from '../components/HintTrigger';
import { canExitDetentionCell, PUZZLE_1_ID, PUZZLE_1_HINT_DELAYS } from './detentionCellPuzzle';

interface FlickerLightProps {
  hintLevel: number;
  position: [number, number, number];
}

function FlickerLight({ hintLevel, position }: FlickerLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    // Aggressive flicker after hint level 1 (30s)
    const speed = hintLevel >= 1 ? 14 : 4;
    const base = hintLevel >= 1 ? 1.6 : 0.8;
    lightRef.current.intensity = base + Math.sin(t * speed) * 0.45;
  });

  return <pointLight ref={lightRef} position={position} color="#88aaff" intensity={0.8} />;
}

export interface DetentionCellProps {
  onDialogue?: (text: string | null) => void;
}

export function DetentionCell({ onDialogue }: DetentionCellProps) {
  const { t } = useTranslation();
  const [panelFound, setPanelFound] = useState(false);

  const addItem = useInventoryStore((s) => s.addItem);
  const hasKeycard = useInventoryStore((s) => s.hasItem('keycard'));
  const solvePuzzle = useGameStore((s) => s.solvePuzzle);
  const moveToRoom = useGameStore((s) => s.moveToRoom);
  const hintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_1_ID));

  // Audio beep at hint level 2 (60s) — generated via Web Audio API, no asset needed
  useEffect(() => {
    if (hintLevel < 2) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio unavailable (test env, browser autoplay restriction)
    }
  }, [hintLevel]);

  const handlePanelClick = useCallback(() => {
    if (panelFound) return;
    setPanelFound(true);
    addItem('keycard');
    solvePuzzle(PUZZLE_1_ID);
    onDialogue?.(t('puzzle1.panel.found'));
  }, [panelFound, addItem, solvePuzzle, t, onDialogue]);

  const handleDoorClick = useCallback(() => {
    if (canExitDetentionCell(hasKeycard)) {
      moveToRoom('control-room');
    } else {
      onDialogue?.(t('puzzle1.door.locked'));
    }
  }, [hasKeycard, moveToRoom, t, onDialogue]);

  // Flickering panel light position — near the loose panel on the right wall
  const panelLightPos: [number, number, number] = [2.4, 2.2, -3.0];

  const doorColor = hasKeycard ? '#1e3a1e' : '#3a1e1e';
  const barColor = hasKeycard ? '#33aa33' : '#aa3333';
  const barEmissive = hasKeycard ? '#0d3311' : '#331100';
  const slotColor = hasKeycard ? '#44ff44' : '#ff4444';
  const slotEmissive = hasKeycard ? '#004400' : '#440000';

  return (
    <group>
      <HintTrigger puzzleId={PUZZLE_1_ID} delays={PUZZLE_1_HINT_DELAYS} />

      {/* Ambient and fill light */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={1.0} color="#5577aa" />

      {/* Flickering panel light — hint escalation: slow flicker → aggressive at 30s */}
      <FlickerLight hintLevel={hintLevel} position={panelLightPos} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#141428" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.75, -4]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#1e2d50" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#222238" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#222238" />
      </mesh>

      {/* Cot frame */}
      <mesh position={[-1.5, 0.25, -2]}>
        <boxGeometry args={[1.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#3a3a58" />
      </mesh>
      {/* Cot legs */}
      {(
        [
          [-2.3, 0.12, -1.65],
          [-0.7, 0.12, -1.65],
          [-2.3, 0.12, -2.35],
          [-0.7, 0.12, -2.35],
        ] as [number, number, number][]
      ).map(([x, y, z]) => (
        <mesh key={`${x},${z}`} position={[x, y, z]}>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#252542" />
        </mesh>
      ))}

      {/* Loose wall panel — puzzle 1
          Displaced ~0.18 units from right wall (x=3) into room, lighter blue shade.
          Visual cues: different color, slight gap at top edge. */}
      <InteractiveObject onClick={handlePanelClick} isDisabled={panelFound}>
        <group position={[2.82, 1.5, -3.0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.06]} />
            <meshStandardMaterial
              color={panelFound ? '#1a1a2e' : '#2d5080'}
              emissive={panelFound ? '#000000' : '#0a1830'}
            />
          </mesh>
          {/* Visible seam at top edge when panel is loose */}
          {!panelFound && (
            <mesh position={[0, 0.46, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.72, 0.02, 0.1]} />
              <meshStandardMaterial color="#4499cc" emissive="#224466" />
            </mesh>
          )}
        </group>
      </InteractiveObject>

      {/* Cell door — color indicates locked (red) / unlocked (green) */}
      <InteractiveObject onClick={handleDoorClick}>
        <group position={[0, 1.4, 3.92]}>
          {/* Door frame — hollow (4 edge beams) so cell interior is visible through the bars */}
          {(
            [
              { pos: [-1.0, 0, 0], args: [0.2, 2.8, 0.06] as [number, number, number] }, // left
              { pos: [1.0, 0, 0], args: [0.2, 2.8, 0.06] as [number, number, number] }, // right
              { pos: [0, 1.3, 0], args: [2.2, 0.2, 0.06] as [number, number, number] }, // top
              { pos: [0, -1.3, 0], args: [2.2, 0.2, 0.06] as [number, number, number] }, // bottom
            ] as { pos: [number, number, number]; args: [number, number, number] }[]
          ).map(({ pos, args }, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={args} />
              <meshStandardMaterial color={doorColor} />
            </mesh>
          ))}
          {/* Vertical bars */}
          {([-0.77, -0.26, 0.26, 0.77] as number[]).map((x) => (
            <mesh key={x} position={[x, 0, 0.02]}>
              <boxGeometry args={[0.07, 2.8, 0.08]} />
              <meshStandardMaterial color={barColor} emissive={barEmissive} />
            </mesh>
          ))}
          {/* Keycard slot indicator — red=locked, green=unlocked */}
          <mesh position={[0.95, -0.9, 0.05]}>
            <boxGeometry args={[0.16, 0.07, 0.04]} />
            <meshStandardMaterial color={slotColor} emissive={slotEmissive} />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
}
