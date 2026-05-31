import { InteractiveObject } from '../../components/InteractiveObject';
import { BlastDoor } from '../../three';
import { useRoomExit } from '../../levels';
import { DamagedAstromechDroid } from './components/DamagedAstromechDroid';
import { CorridorEnvironment } from './components/CorridorEnvironment';
import { ConduitSlot } from './components/ConduitSlot';
import { PowerCell } from './components/PowerCell';
import { DroidSchematicModal } from './components/DroidSchematicModal';
import { useCorridorPuzzle } from './hooks/useCorridorPuzzle';
import {
  CELL_POSITIONS,
  DROID_GROUP_POSITION,
  SCENE3_WORLD,
  SLOT_POSITIONS,
} from './corridorLayout';

export { SCENE3_WORLD, CELL_POSITIONS, DROID_GROUP_POSITION } from './corridorLayout';

export interface CorridorProps {
  onDialogue?: (text: string | null) => void;
}

export function Corridor({ onDialogue }: CorridorProps) {
  const {
    cells,
    schematicOpen,
    setSchematicOpen,
    slotPlacements,
    puzzleSolved,
    hintLevel,
    handleCellClick,
    handleSlotClick,
    selectedCellId,
  } = useCorridorPuzzle({ onDialogue });

  const handleDoorClick = useRoomExit('corridor', onDialogue);

  return (
    <group>
      <CorridorEnvironment hintLevel={hintLevel} puzzleSolved={puzzleSolved} />

      {SLOT_POSITIONS.map((pos, slotIndex) => (
        <ConduitSlot
          key={slotIndex}
          slotIndex={slotIndex}
          position={pos}
          cells={cells}
          slotPlacements={slotPlacements}
          onSlotClick={handleSlotClick}
        />
      ))}

      <group position={DROID_GROUP_POSITION}>
        <DamagedAstromechDroid hintLevel={hintLevel} />

        {hintLevel >= 1 && !schematicOpen && (
          <InteractiveObject testId="droid" onClick={() => setSchematicOpen(true)}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.32, 0.55, 0.32]} />
              <meshStandardMaterial color="#000000" transparent opacity={0} />
            </mesh>
          </InteractiveObject>
        )}
      </group>

      {cells.map((cell, cellId) => {
        if (cell.placedInSlot !== null) return null;

        return (
          <PowerCell
            key={cellId}
            cellId={cellId}
            position={CELL_POSITIONS[cellId]}
            orientation={cell.orientation}
            isSelected={selectedCellId === cellId}
            hintGlow={hintLevel >= 2 && !puzzleSolved}
            puzzleSolved={puzzleSolved}
            onCellClick={handleCellClick}
          />
        );
      })}

      <InteractiveObject testId="door" onClick={handleDoorClick}>
        <group position={SCENE3_WORLD.door}>
          <BlastDoor unlocked={puzzleSolved} />
        </group>
      </InteractiveObject>

      {schematicOpen && <DroidSchematicModal onClose={() => setSchematicOpen(false)} />}
    </group>
  );
}
