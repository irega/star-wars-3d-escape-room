import { ImperialRoomShell, imperialPalette } from '../../three';
import { FloorGrid, PropBox, ScenePointLight } from '../../three/primitives';

/** Hangar shell, deck grid, ambient lights, and space viewport. */
export function HangarBayEnvironment() {
  return (
    <>
      <ScenePointLight position={[0, 3, -4]} intensity={0.75} color="#4466bb" distance={8} />
      <ScenePointLight position={[-4, 2.5, 0]} intensity={0.65} color="#aa4444" distance={6} />
      <ScenePointLight position={[4, 2.5, 0]} intensity={0.65} color="#aa4444" distance={6} />
      <ScenePointLight position={[0, 1.2, 2]} intensity={0.8} color="#7799cc" distance={10} />
      <ScenePointLight
        position={[0, 4.5, -2]}
        intensity={0.6}
        color="#aabbdd"
        distance={12}
        decay={1.5}
      />

      <ImperialRoomShell
        width={10}
        depth={12}
        height={6}
        ceilingY={6}
        floorColor={imperialPalette.deck}
        ceilingColor="#0a0a14"
        wallBackColor="#131322"
        wallSideColor="#12121e"
        sidePanelCount={3}
      />

      <FloorGrid width={10} depth={12} />

      <SpaceViewport />
    </>
  );
}

function SpaceViewport() {
  return (
    <group position={[0, 3.2, -5.92]}>
      <PropBox size={[4.2, 2.4, 0.08]} color="#0a0a1a" emissive="#001133" emissiveIntensity={0.2} />
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[3.6, 1.8]} />
        <meshStandardMaterial color="#000822" emissive="#113366" emissiveIntensity={0.55} />
      </mesh>
      {([-1.9, 1.9] as const).map((x) => (
        <PropBox
          key={x}
          position={[x, 0, 0.04]}
          size={[0.12, 2.5, 0.1]}
          color="#2a3048"
          emissive="#151a28"
          emissiveIntensity={0.15}
        />
      ))}
    </group>
  );
}
