import { Environment, ContactShadows } from '@react-three/drei';

/** Shared scene lighting — mount once inside Canvas alongside the active room. */
export function ImperialLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#5577aa', '#1a1a28', 0.35]} />
      <directionalLight position={[2, 6, 4]} intensity={0.4} />
      <Environment preset="night" environmentIntensity={0.3} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2} far={4} />
    </>
  );
}
