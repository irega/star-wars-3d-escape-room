import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/useGameStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useHintStore } from '../../stores/useHintStore';
import { InteractiveObject } from '../../components/InteractiveObject';
import { BarredCellDoor, ImperialRoomShell, CeilingPanelLight, CotFrame } from '../../three';
import { useRoomExit } from '../../levels';
import { PUZZLE_1_ID } from './detentionCellPuzzle';

export const SCENE1_WORLD = {
  panel: [2.82, 1.5, -3.0] as [number, number, number],
  door: [0.26, 1.4, 3.94] as [number, number, number],
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
  const hintLevel = useHintStore((s) => s.hintLevels[PUZZLE_1_ID] ?? 0);
  const handleDoorClick = useRoomExit('detention-cell', onDialogue);

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

  return (
    <group>
      <ImperialRoomShell wallBackColor="#1e2d50" />

      <CeilingPanelLight />
      <FlickerLight hintLevel={hintLevel} position={[2.4, 2.2, -3.0]} active={!panelFound} />
      <CotFrame />

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
