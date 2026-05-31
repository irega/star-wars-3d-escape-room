import { InteractiveObject } from '../../components/InteractiveObject';
import { isCellPlacementCorrect, CELL_SOLUTIONS } from './puzzle/corridorPuzzle';
import { CELL_COLORS } from './corridorLayout';
import type { CellOrientation } from './puzzle/corridorPuzzle';

interface CellState {
  orientation: CellOrientation;
  placedInSlot: number | null;
}

interface ConduitSlotProps {
  slotIndex: number;
  position: [number, number, number];
  cells: CellState[];
  slotPlacements: Array<{ cellId: number; orientation: CellOrientation } | null>;
  onSlotClick: (slotIndex: number) => void;
}

export function ConduitSlot({
  slotIndex,
  position,
  cells,
  slotPlacements,
  onSlotClick,
}: ConduitSlotProps) {
  const occupyingCellId = cells.findIndex((c) => c.placedInSlot === slotIndex);
  const isOccupied = occupyingCellId !== -1;
  const isCorrect =
    isOccupied &&
    slotPlacements[slotIndex] !== null &&
    isCellPlacementCorrect(occupyingCellId, slotIndex, cells[occupyingCellId].orientation);

  const slotEmissive = isCorrect ? '#004400' : isOccupied ? '#442200' : '#1a1a3a';
  const slotColor = isCorrect ? '#1a3a1a' : '#1a1a33';

  return (
    <InteractiveObject testId={`slot-${slotIndex}`} onClick={() => onSlotClick(slotIndex)}>
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.12, 0.55, 0.55]} />
          <meshStandardMaterial color={slotColor} emissive={slotEmissive} />
        </mesh>

        <mesh
          position={[0.07, 0, 0]}
          rotation={[0, 0, (CELL_SOLUTIONS[slotIndex].orientation * Math.PI) / 180]}
        >
          <boxGeometry args={[0.04, 0.28, 0.04]} />
          <meshStandardMaterial color="#4499cc" emissive="#113344" />
        </mesh>

        {Array.from({ length: slotIndex + 1 }).map((_, bi) => (
          <mesh key={bi} position={[0.07, -0.18 + bi * 0.1, -0.18]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshStandardMaterial color="#667799" emissive="#223344" />
          </mesh>
        ))}

        {isCorrect && (
          <group position={[0.07, 0, 0.18]}>
            <mesh>
              <boxGeometry args={[0.04, 0.06, 0.18]} />
              <meshStandardMaterial color="#44ff44" emissive="#004400" emissiveIntensity={2} />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <boxGeometry args={[0.04, 0.06, 0.22]} />
              <meshStandardMaterial color="#44ff44" emissive="#004400" emissiveIntensity={2} />
            </mesh>
          </group>
        )}

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
}
