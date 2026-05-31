import { useState, useCallback, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/useGameStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useHintStore } from '../../stores/useHintStore';
import { InteractiveObject } from '../../components/InteractiveObject';
import { useRoomExit, usePuzzleSolved } from '../../levels';
import {
  areAllSlotsCorrect,
  cycleOrientation,
  isCellPlacementCorrect,
  shouldExtractFromSlot,
  CELL_SOLUTIONS,
  PUZZLE_3_ID,
  type CellOrientation,
} from './corridorPuzzle';
import { LAUNCH_FREQUENCY } from './launchFrequency';
import { BlastDoor, ImperialRoomShell } from '../../three';
import { DamagedAstromechDroid } from './DamagedAstromechDroid';

export const DROID_GROUP_POSITION: [number, number, number] = [1.5, 0, 1.2];

// World positions for each power cell (scattered near droid wreckage, clear of droid footprint)
// Positioned to avoid droid (≥0.8 units in XZ) and avoid cell-cell overlap (≥0.6 units minimum)
export const CELL_POSITIONS: [number, number, number][] = [
  [0.5, 0.3, 2.3], // Cell 0 — left-back
  [2.6, 0.3, 1.3], // Cell 1 — right-front
  [1.5, 0.3, 2.8], // Cell 2 — center-back
];

// World positions for conduit slots on the left wall panel
const SLOT_POSITIONS: [number, number, number][] = [
  [-2.85, 2.0, -2.0], // Slot 0 (top)
  [-2.85, 1.5, -2.0], // Slot 1 (middle)
  [-2.85, 1.0, -2.0], // Slot 2 (bottom)
];

// World coordinates for interactive objects in this scene
export const SCENE3_WORLD = {
  cell0: CELL_POSITIONS[0],
  cell1: CELL_POSITIONS[1],
  cell2: CELL_POSITIONS[2],
  slot0: SLOT_POSITIONS[0],
  slot1: SLOT_POSITIONS[1],
  slot2: SLOT_POSITIONS[2],
  door: [0, 1.4, -3.92] as [number, number, number],
};

// Distinct color per cell — used together with shape labels for color-blind safety
const CELL_COLORS = ['#4488ff', '#ff8833', '#44cc66'] as const;
// Greek letter labels rendered as notch shapes (one short + one tall bar per cell)
const CELL_LABEL_HEIGHTS = [0.5, 0.35, 0.2] as const;

interface CellState {
  orientation: CellOrientation;
  placedInSlot: number | null;
}

interface PulsingLightProps {
  position: [number, number, number];
  color: string;
  active: boolean;
}

function PulsingLight({ position, color, active }: PulsingLightProps) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    ref.current.intensity = 0.35 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={active ? 0.35 : 0} />;
}

export interface CorridorProps {
  onDialogue?: (text: string | null) => void;
}

export function Corridor({ onDialogue }: CorridorProps) {
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
  const handleDoorClick = useRoomExit('corridor', onDialogue);

  // Build slot placements array for validation
  const slotPlacements = CELL_SOLUTIONS.map((_, slotIndex) => {
    const cellId = cells.findIndex((c) => c.placedInSlot === slotIndex);
    if (cellId === -1) return null;
    return { cellId, orientation: cells[cellId].orientation };
  });

  const handleCellClick = useCallback(
    (cellId: number) => {
      if (puzzleSolved) return;
      if (selectedCellId === cellId) {
        // Second click on same cell: rotate orientation
        // NOTE: setCells called directly (not inside another updater) so Strict Mode
        // double-invokes the updater with the same prevState → idempotent, rotates once.
        setCells((cs) =>
          cs.map((c, id) =>
            id === cellId ? { ...c, orientation: cycleOrientation(c.orientation) } : c,
          ),
        );
        // selectedCellId stays the same — no setSelectedCellId call needed
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
        // Extract mode: return the occupying cell to its world position
        setCells((prev) =>
          prev.map((c) => (c.placedInSlot === slotIndex ? { ...c, placedInSlot: null } : c)),
        );
        return;
      }

      if (selectedCellId === null) return;

      // Place mode: put the selected cell into the slot
      setCells((prev) => {
        const next = prev.map((c, id) => {
          // Evict any existing cell in that slot
          if (c.placedInSlot === slotIndex && id !== selectedCellId) {
            return { ...c, placedInSlot: null };
          }
          // Place selected cell into slot
          if (id === selectedCellId) {
            return { ...c, placedInSlot: slotIndex };
          }
          return c;
        });

        // Check completion after this placement
        const newPlacements = CELL_SOLUTIONS.map((_, si) => {
          const cId = next.findIndex((c) => c.placedInSlot === si);
          if (cId === -1) return null;
          return { cellId: cId, orientation: next[cId].orientation };
        });

        if (areAllSlotsCorrect(newPlacements)) {
          // Defer side effects outside of setState
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

  // Close schematic modal on Escape key
  useEffect(() => {
    if (!schematicOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSchematicOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [schematicOpen]);

  return (
    <group>
      <pointLight position={[-2, 2, -1]} intensity={0.6} color="#3366aa" distance={5} decay={2} />
      <pointLight position={[0, 3.2, 0]} intensity={0.55} color="#8899bb" distance={8} decay={2} />

      <ImperialRoomShell
        floorColor="#222838"
        wallBackColor="#283858"
        wallSideColor="#262a3a"
        trimColor="#2a3048"
      />

      {/* Pulsing lights near each correct slot at hint level 2 */}
      {SLOT_POSITIONS.map((pos, i) => (
        <PulsingLight
          key={i}
          position={[pos[0] + 0.5, pos[1], pos[2]]}
          color={CELL_COLORS[i]}
          active={hintLevel >= 2 && !puzzleSolved}
        />
      ))}

      {/* Conduit panel backing on left wall */}
      <mesh position={[-2.98, 1.5, -2.0]}>
        <boxGeometry args={[0.04, 2.0, 1.4]} />
        <meshStandardMaterial color="#252545" emissive="#004455" emissiveIntensity={0.6} />
      </mesh>

      {/* Conduit slots — three slots in vertical column on left wall */}
      {SLOT_POSITIONS.map((pos, slotIndex) => {
        const occupyingCellId = cells.findIndex((c) => c.placedInSlot === slotIndex);
        const isOccupied = occupyingCellId !== -1;
        const isCorrect =
          isOccupied &&
          slotPlacements[slotIndex] !== null &&
          isCellPlacementCorrect(occupyingCellId, slotIndex, cells[occupyingCellId].orientation);

        const slotEmissive = isCorrect ? '#004400' : isOccupied ? '#442200' : '#1a1a3a';
        const slotColor = isCorrect ? '#1a3a1a' : '#1a1a33';

        return (
          <InteractiveObject key={slotIndex} onClick={() => handleSlotClick(slotIndex)}>
            <group position={pos}>
              {/* Slot housing */}
              <mesh>
                <boxGeometry args={[0.12, 0.55, 0.55]} />
                <meshStandardMaterial color={slotColor} emissive={slotEmissive} />
              </mesh>

              {/* Slot opening indicator — shows required orientation as a rotated notch bar */}
              <mesh
                position={[0.07, 0, 0]}
                rotation={[0, 0, (CELL_SOLUTIONS[slotIndex].orientation * Math.PI) / 180]}
              >
                <boxGeometry args={[0.04, 0.28, 0.04]} />
                <meshStandardMaterial color="#4499cc" emissive="#113344" />
              </mesh>

              {/* Slot number label (shape-based: number of stacked bars) */}
              {Array.from({ length: slotIndex + 1 }).map((_, bi) => (
                <mesh key={bi} position={[0.07, -0.18 + bi * 0.1, -0.18]}>
                  <boxGeometry args={[0.04, 0.06, 0.04]} />
                  <meshStandardMaterial color="#667799" emissive="#223344" />
                </mesh>
              ))}

              {/* Correct placement indicator: checkmark shape (two rotated bars, + and ×) */}
              {isCorrect && (
                <group position={[0.07, 0, 0.18]}>
                  {/* Horizontal bar of checkmark */}
                  <mesh>
                    <boxGeometry args={[0.04, 0.06, 0.18]} />
                    <meshStandardMaterial
                      color="#44ff44"
                      emissive="#004400"
                      emissiveIntensity={2}
                    />
                  </mesh>
                  {/* Diagonal bar of checkmark */}
                  <mesh rotation={[Math.PI / 4, 0, 0]}>
                    <boxGeometry args={[0.04, 0.06, 0.22]} />
                    <meshStandardMaterial
                      color="#44ff44"
                      emissive="#004400"
                      emissiveIntensity={2}
                    />
                  </mesh>
                </group>
              )}

              {/* Placed cell visible in slot */}
              {isOccupied && (
                <mesh rotation={[0, 0, (cells[occupyingCellId].orientation * Math.PI) / 180]}>
                  <boxGeometry args={[0.08, 0.42, 0.18]} />
                  <meshStandardMaterial
                    color={CELL_COLORS[occupyingCellId]}
                    emissive={isCorrect ? CELL_COLORS[occupyingCellId] : '#110800'}
                    emissiveIntensity={isCorrect ? 0.6 : 0.1}
                  />
                </mesh>
              )}

              {/* Glow point light when correctly placed */}
              {isCorrect && (
                <pointLight
                  position={[0.1, 0, 0]}
                  color={CELL_COLORS[occupyingCellId]}
                  intensity={0.4}
                  distance={1.5}
                />
              )}
            </group>
          </InteractiveObject>
        );
      })}

      <group position={DROID_GROUP_POSITION}>
        <DamagedAstromechDroid hintLevel={hintLevel} />

        {/* Schematic trigger — tight hit volume on droid torso only (avoids stealing cell clicks) */}
        {hintLevel >= 1 && !schematicOpen && (
          <InteractiveObject onClick={() => setSchematicOpen(true)}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.32, 0.55, 0.32]} />
              <meshStandardMaterial color="#000000" transparent opacity={0} />
            </mesh>
          </InteractiveObject>
        )}
      </group>

      {/* Power cells — appear at their starting position when not placed */}
      {cells.map((cell, cellId) => {
        if (cell.placedInSlot !== null) return null;

        const pos = CELL_POSITIONS[cellId];
        const isSelected = selectedCellId === cellId;
        const hintGlow = hintLevel >= 2 && !puzzleSolved;

        return (
          <InteractiveObject
            key={cellId}
            onClick={() => handleCellClick(cellId)}
            isDisabled={puzzleSolved}
          >
            <group position={pos} rotation={[0, 0, (cell.orientation * Math.PI) / 180]}>
              {/* Cell body */}
              <mesh>
                <boxGeometry args={[0.28, 0.5, 0.18]} />
                <meshStandardMaterial
                  color={CELL_COLORS[cellId]}
                  emissive={CELL_COLORS[cellId]}
                  emissiveIntensity={isSelected ? 0.8 : hintGlow ? 0.25 : 0.1}
                />
              </mesh>

              {/* Selection highlight ring */}
              {isSelected && (
                <mesh>
                  <boxGeometry args={[0.32, 0.54, 0.22]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.3}
                    wireframe
                  />
                </mesh>
              )}

              {/* Shape label — distinct height indicator bars (color-blind safe: shape + color) */}
              {Array.from({ length: cellId + 1 }).map((_, bi) => (
                <mesh key={bi} position={[0, 0.3, 0.1 - bi * 0.06]}>
                  <boxGeometry args={[0.06, CELL_LABEL_HEIGHTS[cellId], 0.04]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              ))}

              {/* Orientation indicator — a small bar showing which direction is "up" */}
              <mesh position={[0, 0.27, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.04]} />
                <meshStandardMaterial color="#ffdd44" emissive="#443300" emissiveIntensity={1} />
              </mesh>
            </group>
          </InteractiveObject>
        );
      })}

      <InteractiveObject onClick={handleDoorClick}>
        <group position={SCENE3_WORLD.door}>
          <BlastDoor unlocked={puzzleSolved} />
        </group>
      </InteractiveObject>

      {/* Droid schematic overlay — shown when droid is clicked at hint level >= 1 */}
      {schematicOpen && (
        <Html fullscreen>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.8)',
              zIndex: 30,
              fontFamily: '"Courier New", Courier, monospace',
            }}
          >
            <div
              style={{
                border: '1px solid #44aaff',
                padding: '2rem',
                background: 'rgba(0,8,24,0.97)',
                minWidth: '400px',
                color: '#44aaff',
              }}
            >
              <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                {t('puzzle3.schematic.header')}
              </div>
              <div style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
                {t('puzzle3.schematic.prompt')}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  lineHeight: 2,
                }}
              >
                <div>
                  <span style={{ color: '#4488ff' }}>■</span> {t('puzzle3.schematic.cell0')}
                </div>
                <div>
                  <span style={{ color: '#ff8833' }}>■</span> {t('puzzle3.schematic.cell1')}
                </div>
                <div>
                  <span style={{ color: '#44cc66' }}>■</span> {t('puzzle3.schematic.cell2')}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1rem' }}>
                {t('puzzle3.schematic.instructions')}
              </div>
              <button
                onClick={() => setSchematicOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #44aaff',
                  color: '#44aaff',
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
