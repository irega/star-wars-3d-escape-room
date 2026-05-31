import { PropBox } from '../../three/primitives';

export interface ImperialShuttleProps {
  cleared: boolean;
  position?: [number, number, number];
}

/** Lambda-class shuttle blocking the hangar force field. */
export function ImperialShuttle({ cleared, position = [-0.5, 0, -4.5] }: ImperialShuttleProps) {
  return (
    <group position={position}>
      <PropBox
        position={[0, 1.1, 0]}
        size={[1.4, 1.0, 3.2]}
        color="#282840"
        emissive="#0a0a18"
        emissiveIntensity={0.08}
      />
      <PropBox
        position={[0, 1.3, 1.7]}
        size={[0.9, 0.7, 0.8]}
        color="#1e1e33"
        emissive="#080812"
        emissiveIntensity={0.06}
      />
      <PropBox
        position={[0, 1.4, 2.08]}
        size={[0.6, 0.3, 0.04]}
        color="#001133"
        emissive="#002266"
        emissiveIntensity={1.2}
      />
      <PropBox
        position={[0, 2.5, -0.4]}
        rotation={[0.15, 0, 0]}
        size={[0.14, 2.2, 1.6]}
        color="#282840"
        emissive="#0a0a18"
        emissiveIntensity={0.06}
      />
      <PropBox
        position={[-1.8, 0.5, -0.2]}
        rotation={[0, 0, 0.18]}
        size={[2.2, 0.12, 1.2]}
        color="#20202e"
        emissive="#060610"
        emissiveIntensity={0.05}
      />
      <PropBox
        position={[1.8, 0.5, -0.2]}
        rotation={[0, 0, -0.18]}
        size={[2.2, 0.12, 1.2]}
        color="#20202e"
        emissive="#060610"
        emissiveIntensity={0.05}
      />
      {([-0.5, 0.5] as number[]).map((x) => (
        <PropBox
          key={`strut-${x}`}
          position={[x, 0.18, 0.6]}
          size={[0.1, 0.36, 0.1]}
          color="#30303f"
        />
      ))}
      <PropBox
        position={[0, 0.9, -1.65]}
        size={[0.5, 0.3, 0.08]}
        color={cleared ? '#001166' : '#000033'}
        emissive={cleared ? '#003399' : '#000022'}
        emissiveIntensity={cleared ? 3.0 : 0.5}
      />
    </group>
  );
}
