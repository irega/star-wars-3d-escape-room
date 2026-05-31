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
import { playTone } from '../../audio/playTone';
import { PUZZLE_1_ID } from './puzzle/detentionCellPuzzle';
import { HiddenMaintenancePanel } from './HiddenMaintenancePanel';

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
    playTone(880, 600);
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

      <HiddenMaintenancePanel
        position={SCENE1_WORLD.panel}
        panelFound={panelFound}
        onClick={handlePanelClick}
      />

      <InteractiveObject testId="door" onClick={handleDoorClick}>
        <group position={SCENE1_WORLD.door}>
          <BarredCellDoor unlocked={hasKeycard} />
        </group>
      </InteractiveObject>
    </group>
  );
}
