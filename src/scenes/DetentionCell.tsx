import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { InteractiveObject } from '../components/InteractiveObject';
import { BarredCellDoor, ImperialRoomShell } from '../three';
import { canExitDetentionCell, PUZZLE_1_ID } from './detentionCellPuzzle';

// World coordinates for interactive objects in this scene
export const SCENE1_WORLD = {
  panel: [2.82, 1.5, -3.0] as [number, number, number],
  door: [0.26, 1.4, 3.94] as [number, number, number],
  /** Center of a door bar (group origin sits in gaps between bars). */
  doorClick: [0.52, 1.4, 3.96] as [number, number, number],
};

interface FlickerLightProps {
  hintLevel: number;
  position: [number, number, number];
  active: boolean;
}

function FlickerLight({ hintLevel, position, active }: FlickerLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current || !active) return;
    const t = clock.getElapsedTime();
    const speed = hintLevel >= 1 ? 14 : 4;
    const base = hintLevel >= 1 ? 1.5 : 0.85;
    lightRef.current.intensity = base + Math.sin(t * speed) * 0.35;
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color="#88aaff"
      intensity={active ? 0.85 : 0}
      distance={2.5}
      decay={2}
    />
  );
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
  const hintLevel = useHintStore((s) => s.hintLevels[PUZZLE_1_ID] ?? 0);

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

  const panelLightPos: [number, number, number] = [2.4, 2.2, -3.0];

  return (
    <group>
      <ImperialRoomShell wallBackColor="#1e2d50" />

      {/* Ceiling panel — diegetic fill on back wall */}
      <mesh position={[0, 3.35, -3.85]}>
        <boxGeometry args={[1.4, 0.08, 0.12]} />
        <meshStandardMaterial color="#445577" emissive="#334466" emissiveIntensity={0.55} />
      </mesh>
      <pointLight
        position={[0, 3.2, -3.5]}
        color="#88aaff"
        intensity={0.65}
        distance={3}
        decay={2}
      />

      <FlickerLight hintLevel={hintLevel} position={panelLightPos} active={!panelFound} />

      {/* Cot frame */}
      <mesh position={[-1.5, 0.25, -2]}>
        <boxGeometry args={[1.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#3a3a58" />
      </mesh>
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

      <InteractiveObject onClick={handlePanelClick} isDisabled={panelFound}>
        <group position={SCENE1_WORLD.panel}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.06]} />
            <meshStandardMaterial
              color={panelFound ? '#1a1a2e' : '#2d5080'}
              emissive={panelFound ? '#000000' : '#0a1830'}
              emissiveIntensity={panelFound ? 0 : 0.25}
            />
          </mesh>
          {!panelFound && (
            <mesh position={[0, 0.46, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.72, 0.02, 0.1]} />
              <meshStandardMaterial color="#4499cc" emissive="#224466" emissiveIntensity={0.4} />
            </mesh>
          )}
        </group>
      </InteractiveObject>

      <InteractiveObject onClick={handleDoorClick}>
        <group position={SCENE1_WORLD.door}>
          <BarredCellDoor unlocked={hasKeycard} />
        </group>
      </InteractiveObject>
    </group>
  );
}
