import { InteractiveObject } from '../../../components/InteractiveObject';
import { CELL_COLORS, CELL_LABEL_HEIGHTS } from '../corridorLayout';
import type { CellOrientation } from '../puzzle/corridorPuzzle';

interface PowerCellProps {
  cellId: number;
  position: [number, number, number];
  orientation: CellOrientation;
  isSelected: boolean;
  hintGlow: boolean;
  puzzleSolved: boolean;
  onCellClick: (cellId: number) => void;
}

export function PowerCell({
  cellId,
  position,
  orientation,
  isSelected,
  hintGlow,
  puzzleSolved,
  onCellClick,
}: PowerCellProps) {
  return (
    <InteractiveObject
      testId={`cell-${cellId}`}
      onClick={() => onCellClick(cellId)}
      isDisabled={puzzleSolved}
    >
      <group position={position} rotation={[0, 0, (orientation * Math.PI) / 180]}>
        <mesh>
          <boxGeometry args={[0.28, 0.5, 0.18]} />
          <meshStandardMaterial
            color={CELL_COLORS[cellId]}
            emissive={CELL_COLORS[cellId]}
            emissiveIntensity={isSelected ? 0.8 : hintGlow ? 0.25 : 0.1}
          />
        </mesh>

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

        {Array.from({ length: cellId + 1 }).map((_, bi) => (
          <mesh key={bi} position={[0, 0.3, 0.1 - bi * 0.06]}>
            <boxGeometry args={[0.06, CELL_LABEL_HEIGHTS[cellId], 0.04]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
        ))}

        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#ffdd44" emissive="#443300" emissiveIntensity={1} />
        </mesh>
      </group>
    </InteractiveObject>
  );
}
