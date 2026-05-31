import { PropBox } from '../../three/primitives';

export interface ForceFieldBarrierProps {
  active: boolean;
  position?: [number, number, number];
  width?: number;
  height?: number;
}

/** Blue force field blocking shuttle launch until clearance is granted. */
export function ForceFieldBarrier({
  active,
  position = [0, 2.5, -2.8],
  width = 10,
  height = 5,
}: ForceFieldBarrierProps) {
  if (!active) return null;

  const [x, y, z] = position;
  const emissive = '#0033cc';
  const frameColor = '#0055ff';

  return (
    <>
      <mesh position={position}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#0044ff"
          emissive={emissive}
          emissiveIntensity={1.5}
          transparent
          opacity={0.45}
        />
      </mesh>
      <PropBox
        position={[x - width / 2, y, z]}
        size={[0.08, height, 0.08]}
        color={frameColor}
        emissive={emissive}
        emissiveIntensity={2}
      />
      <PropBox
        position={[x + width / 2, y, z]}
        size={[0.08, height, 0.08]}
        color={frameColor}
        emissive={emissive}
        emissiveIntensity={2}
      />
      <PropBox
        position={[x, y + height / 2, z]}
        size={[width, 0.08, 0.08]}
        color={frameColor}
        emissive={emissive}
        emissiveIntensity={2}
      />
    </>
  );
}
