import { imperialPalette } from './palette';

export interface BarredCellDoorProps {
  unlocked?: boolean;
}

const FRAME_EDGES: { pos: [number, number, number]; args: [number, number, number] }[] = [
  { pos: [-1.0, 0, 0], args: [0.2, 2.8, 0.06] },
  { pos: [1.0, 0, 0], args: [0.2, 2.8, 0.06] },
  { pos: [0, 1.3, 0], args: [2.2, 0.2, 0.06] },
  { pos: [0, -1.3, 0], args: [2.2, 0.2, 0.06] },
];

const BAR_X = [-0.77, -0.26, 0.26, 0.77] as const;

/** Barred detention cell door with visible frame, emissive bars, and keycard slot LED. */
export function BarredCellDoor({ unlocked = false }: BarredCellDoorProps) {
  const frameColor = unlocked ? imperialPalette.doorOpen : imperialPalette.cellFrame;
  const barColor = unlocked ? imperialPalette.barOpen : imperialPalette.barLocked;
  const barEmissive = unlocked
    ? imperialPalette.barOpenEmissive
    : imperialPalette.barLockedEmissive;
  const slotColor = unlocked ? imperialPalette.indicatorOpen : imperialPalette.indicatorLocked;
  const slotEmissive = unlocked
    ? imperialPalette.indicatorOpenEmissive
    : imperialPalette.indicatorLockedEmissive;

  return (
    <group>
      {FRAME_EDGES.map(({ pos, args }, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={args} />
          <meshStandardMaterial
            color={frameColor}
            emissive={imperialPalette.frameEmissive}
            emissiveIntensity={0.15}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}

      {BAR_X.map((x) => (
        <mesh key={x} position={[x, 0, 0.02]}>
          <boxGeometry args={[0.07, 2.8, 0.08]} />
          <meshStandardMaterial
            color={barColor}
            emissive={barEmissive}
            emissiveIntensity={unlocked ? 0.35 : 0.55}
          />
        </mesh>
      ))}

      <mesh position={[0.95, -0.9, 0.05]}>
        <boxGeometry args={[0.16, 0.07, 0.04]} />
        <meshStandardMaterial color={slotColor} emissive={slotEmissive} emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}
