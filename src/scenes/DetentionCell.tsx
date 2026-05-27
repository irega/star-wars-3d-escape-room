export function DetentionCell() {
  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={1} color="#4488ff" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.75, -4]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 1.75, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Cot */}
      <mesh position={[-1.5, 0.25, -2]}>
        <boxGeometry args={[1.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>
    </group>
  );
}
