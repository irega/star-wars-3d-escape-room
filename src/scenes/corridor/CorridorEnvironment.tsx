import { ImperialRoomShell } from '../../three';
import { PulsingLight } from './PulsingLight';
import { CELL_COLORS, SLOT_POSITIONS } from './corridorLayout';

interface CorridorEnvironmentProps {
  hintLevel: number;
  puzzleSolved: boolean;
}

export function CorridorEnvironment({ hintLevel, puzzleSolved }: CorridorEnvironmentProps) {
  return (
    <>
      <pointLight position={[-2, 2, -1]} intensity={0.6} color="#3366aa" distance={5} decay={2} />
      <pointLight position={[0, 3.2, 0]} intensity={0.55} color="#8899bb" distance={8} decay={2} />

      <ImperialRoomShell
        floorColor="#222838"
        wallBackColor="#283858"
        wallSideColor="#262a3a"
        trimColor="#2a3048"
      />

      {SLOT_POSITIONS.map((pos, i) => (
        <PulsingLight
          key={i}
          position={[pos[0] + 0.5, pos[1], pos[2]]}
          color={CELL_COLORS[i]}
          active={hintLevel >= 2 && !puzzleSolved}
        />
      ))}

      <mesh position={[-2.98, 1.5, -2.0]}>
        <boxGeometry args={[0.04, 2.0, 1.4]} />
        <meshStandardMaterial color="#252545" emissive="#004455" emissiveIntensity={0.6} />
      </mesh>
    </>
  );
}
