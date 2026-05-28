import { useState, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { InteractiveObject } from '../components/InteractiveObject';
import { HintTrigger } from '../components/HintTrigger';
import {
  areAllSlotsCorrect,
  canExitCorridor,
  cycleOrientation,
  isCellPlacementCorrect,
  CELL_SOLUTIONS,
  PUZZLE_3_ID,
  PUZZLE_3_HINT_DELAYS,
  FREQUENCY_NUMBER,
  type CellOrientation,
} from './corridorPuzzle';

// World positions for each power cell (scattered near droid wreckage)
const CELL_POSITIONS: [number, number, number][] = [
  [0.7, 0.3, 2.0], // Cell 0
  [1.4, 0.3, 1.5], // Cell 1
  [2.0, 0.3, 2.0], // Cell 2
];

// World positions for conduit slots on the left wall panel
const SLOT_POSITIONS: [number, number, number][] = [
  [-2.85, 2.0, -2.0], // Slot 0 (top)
  [-2.85, 1.5, -2.0], // Slot 1 (middle)
  [-2.85, 1.0, -2.0], // Slot 2 (bottom)
];

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
    ref.current.intensity = 0.15 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={active ? 0.15 : 0} />;
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
  const moveToRoom = useGameStore((s) => s.moveToRoom);
  const solvedPuzzles = useGameStore((s) => s.solvedPuzzles);
  const puzzleSolved = solvedPuzzles.includes(PUZZLE_3_ID);
  const hintLevel = useHintStore((s) => s.getHintLevel(PUZZLE_3_ID));

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
      if (selectedCellId === null || puzzleSolved) return;

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
            onDialogue?.(t('puzzle3.solved', { freq: FREQUENCY_NUMBER }));
          }, 0);
        }

        return next;
      });

      setSelectedCellId(null);
    },
    [selectedCellId, puzzleSolved, addItem, solvePuzzle, t, onDialogue],
  );

  const handleDoorClick = useCallback(() => {
    if (canExitCorridor(puzzleSolved)) {
      moveToRoom('hangar-bay');
    } else {
      onDialogue?.(t('puzzle3.door.locked'));
    }
  }, [puzzleSolved, moveToRoom, t, onDialogue]);

  const doorColor = puzzleSolved ? '#1e3a1e' : '#1a1a2e';
  const doorEmissive = puzzleSolved ? '#0d3311' : '#00001a';
  const doorIndicatorColor = puzzleSolved ? '#44ff44' : '#ff4444';
  const doorIndicatorEmissive = puzzleSolved ? '#004400' : '#440000';

  return (
    <group>
      <HintTrigger puzzleId={PUZZLE_3_ID} delays={PUZZLE_3_HINT_DELAYS} />

      <ambientLight intensity={0.35} />
      <pointLight position={[0, 3, 0]} intensity={0.9} color="#5577aa" />
      <pointLight position={[-2, 2, -1]} intensity={0.6} color="#225588" />

      {/* Pulsing lights near each correct slot at hint level 2 */}
      {SLOT_POSITIONS.map((pos, i) => (
        <PulsingLight
          key={i}
          position={[pos[0] + 0.5, pos[1], pos[2]]}
          color={CELL_COLORS[i]}
          active={hintLevel >= 2 && !puzzleSolved}
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#131320" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#0a0a12" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.75, -4]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#171730" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#181830" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#181830" />
      </mesh>

      {/* Conduit panel backing on left wall */}
      <mesh position={[-2.98, 1.5, -2.0]}>
        <boxGeometry args={[0.04, 2.0, 1.4]} />
        <meshStandardMaterial color="#252545" emissive="#000022" />
      </mesh>

      {/* Conduit slots — three slots in vertical column on left wall */}
      {SLOT_POSITIONS.map((pos, slotIndex) => {
        const occupyingCellId = cells.findIndex((c) => c.placedInSlot === slotIndex);
        const isOccupied = occupyingCellId !== -1;
        const isCorrect =
          isOccupied &&
          slotPlacements[slotIndex] !== null &&
          isCellPlacementCorrect(occupyingCellId, slotIndex, cells[occupyingCellId].orientation);

        const slotEmissive = isCorrect ? '#003300' : isOccupied ? '#221100' : '#000011';
        const slotColor = isCorrect ? '#1a3a1a' : '#11111f';

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

      {/* Droid wreckage — scattered boxes on right side */}
      <group position={[1.5, 0, 1.2]}>
        {/* Main droid body (collapsed) */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0.4, 0.2]}>
          <boxGeometry args={[0.5, 0.36, 0.4]} />
          <meshStandardMaterial color="#445566" emissive="#001122" />
        </mesh>
        {/* Droid head */}
        <mesh position={[0.1, 0.55, 0.15]} rotation={[0.3, 0, 0.1]}>
          <boxGeometry args={[0.28, 0.28, 0.22]} />
          <meshStandardMaterial color="#3a4a5a" emissive="#001122" />
        </mesh>
        {/* Eye sensor */}
        <mesh position={[0.1, 0.56, 0.27]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
          <meshStandardMaterial
            color={hintLevel >= 1 ? '#44aaff' : '#111122'}
            emissive={hintLevel >= 1 ? '#1144aa' : '#000011'}
            emissiveIntensity={hintLevel >= 1 ? 2 : 0.5}
          />
        </mesh>
        {/* Arm fragment */}
        <mesh position={[-0.35, 0.12, 0.1]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#3a4a5a" />
        </mesh>
        {/* Holographic projector (glows at hint level 1+) */}
        {hintLevel >= 1 && (
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.12]} />
            <meshStandardMaterial color="#44aaff" emissive="#1144aa" emissiveIntensity={1.5} />
          </mesh>
        )}
      </group>

      {/* Clickable droid schematic trigger — shows schematic overlay when hint level >= 1 */}
      {hintLevel >= 1 && (
        <InteractiveObject onClick={() => setSchematicOpen(true)}>
          <mesh position={[1.5, 0.5, 1.2]}>
            <boxGeometry args={[0.6, 0.8, 0.6]} />
            <meshStandardMaterial color="#000000" transparent opacity={0} />
          </mesh>
        </InteractiveObject>
      )}

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

      {/* Blast door — leads to Hangar Bay when puzzle solved */}
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
          {/* Door panel */}
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
