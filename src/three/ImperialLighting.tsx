import { ContactShadows } from '@react-three/drei';

/** Shared scene lighting — mount once inside Canvas alongside the active room. */
export function ImperialLighting() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#8aa8cc', '#2a2e42', 0.65]} />
      <directionalLight position={[2, 7, 5]} intensity={0.75} color="#e8eeff" />
      <directionalLight position={[-3, 4, 2]} intensity={0.35} color="#99aacc" />
      <directionalLight position={[0, 3, 8]} intensity={0.45} color="#c5d4f0" />
      <pointLight
        position={[0, 3.8, 1]}
        intensity={0.85}
        color="#b8c8e8"
        distance={14}
        decay={1.5}
      />
      <pointLight position={[0, 2.5, -2]} intensity={0.5} color="#6688bb" distance={10} decay={2} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.28} scale={14} blur={2} far={4} />
    </>
  );
}
