/** Wrecked maintenance astromech (R2-style) — cylindrical body, domed head, three-leg stance. */
export interface DamagedAstromechDroidProps {
  /** Hint level 1+ brightens the optical sensor and shows the holoprojector. */
  hintLevel: number;
}

// Mid-tone greens: readable on dark corridor floor (#131320) without washing out
const BODY_GREEN = '#4a9a72';
const BODY_GREEN_DARK = '#357a5a';
const DOME_CREAM = '#ece6d4';
const DOME_STRIPE = '#3d7a58';
const SILVER = '#b8c8d4';
const LENS_OFF = '#223344';
const LENS_ACTIVE = '#77ccff';

function hullMaterial(
  color: string,
  opts?: { metalness?: number; roughness?: number; emissive?: string; emissiveIntensity?: number },
) {
  const emissive = opts?.emissive ?? color;
  return (
    <meshStandardMaterial
      color={color}
      metalness={opts?.metalness ?? 0.2}
      roughness={opts?.roughness ?? 0.5}
      emissive={emissive}
      emissiveIntensity={opts?.emissiveIntensity ?? 0.45}
    />
  );
}

function metalMaterial(color = SILVER) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.7}
      roughness={0.3}
      emissive={color}
      emissiveIntensity={0.55}
    />
  );
}

/** Shared tilt for torso + dome so the head stays centered on the cylinder. */
const CHASSIS_ROTATION: [number, number, number] = [0.05, 0.2, 0.12];
const BODY_CENTER_Y = 0.28;
const BODY_HALF_HEIGHT = 0.24;
const NECK_HALF_HEIGHT = 0.03;
const DOME_RADIUS = 0.26;
const BODY_TOP_Y = BODY_CENTER_Y + BODY_HALF_HEIGHT;
const NECK_CENTER_Y = BODY_TOP_Y + NECK_HALF_HEIGHT;
const DOME_EQUATOR_Y = NECK_CENTER_Y + NECK_HALF_HEIGHT;

export function DamagedAstromechDroid({ hintLevel }: DamagedAstromechDroidProps) {
  const eyeActive = hintLevel >= 1;
  const pose: [number, number, number] = [-0.12, 0, 0.08];

  return (
    <group rotation={pose}>
      {/* Local fill — body is too dark for corridor ambient alone */}
      <pointLight
        position={[0.2, 0.55, 0.45]}
        intensity={1.1}
        color="#d8e8f8"
        distance={1.8}
        decay={2}
      />
      <pointLight
        position={[-0.35, 0.25, 0.2]}
        intensity={0.45}
        color="#88bbaa"
        distance={1.4}
        decay={2}
      />

      {/* Wreckage pad — grounds silhouette on dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshStandardMaterial
          color="#2a3548"
          emissive="#1a2838"
          emissiveIntensity={0.5}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      <group rotation={CHASSIS_ROTATION}>
        {/* Main chassis */}
        <mesh position={[0, BODY_CENTER_Y, 0]}>
          <cylinderGeometry args={[0.27, 0.29, BODY_HALF_HEIGHT * 2, 24]} />
          {hullMaterial(BODY_GREEN, { emissive: '#2a6a4a', emissiveIntensity: 0.55 })}
        </mesh>

        {/* Lower skirt ring */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.3, 0.27, 0.1, 24]} />
          {hullMaterial(BODY_GREEN_DARK, { emissive: '#1e5040', emissiveIntensity: 0.5 })}
        </mesh>

        {/* Front panel — lighter accent for silhouette */}
        <mesh position={[0, BODY_CENTER_Y, 0.29]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.22, 0.34, 0.05]} />
          {hullMaterial('#5ab088', { emissive: '#3a8068', emissiveIntensity: 0.6 })}
        </mesh>

        {/* Silver vent slats */}
        {[0.08, 0.0, -0.08].map((y) => (
          <mesh key={y} position={[0, BODY_CENTER_Y + y, 0.3]}>
            <boxGeometry args={[0.14, 0.05, 0.03]} />
            {metalMaterial()}
          </mesh>
        ))}

        {/* Neck collar */}
        <mesh position={[0, NECK_CENTER_Y, 0]}>
          <cylinderGeometry args={[0.22, 0.24, NECK_HALF_HEIGHT * 2, 24]} />
          {metalMaterial('#c8d4dc')}
        </mesh>

        {/* Dome — equator sits flush on neck / body top */}
        <mesh position={[0, DOME_EQUATOR_Y, 0]}>
          <sphereGeometry args={[DOME_RADIUS, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {hullMaterial(DOME_CREAM, {
            emissive: '#c8c0a8',
            emissiveIntensity: 0.35,
            metalness: 0.1,
          })}
        </mesh>

        {/* Dome band stripes */}
        {[0.12, 0.2].map((bandOffset, i) => (
          <mesh
            key={i}
            position={[0, DOME_EQUATOR_Y + bandOffset, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[DOME_RADIUS - 0.015 - i * 0.02, 0.018, 10, 32]} />
            {hullMaterial(DOME_STRIPE, { emissive: '#2a6048', emissiveIntensity: 0.45 })}
          </mesh>
        ))}

        {/* Photoreceptor — forward (+Z) in chassis space */}
        <mesh position={[0, DOME_EQUATOR_Y + 0.04, DOME_RADIUS + 0.02]}>
          <boxGeometry args={[0.1, 0.09, 0.04]} />
          {hullMaterial(DOME_STRIPE, { emissiveIntensity: 0.4 })}
        </mesh>

        <mesh
          position={[0, DOME_EQUATOR_Y + 0.04, DOME_RADIUS + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
          <meshStandardMaterial
            color={eyeActive ? LENS_ACTIVE : LENS_OFF}
            metalness={0.6}
            roughness={0.2}
            emissive={eyeActive ? '#3399ee' : '#1a3344'}
            emissiveIntensity={eyeActive ? 1.8 : 0.7}
          />
        </mesh>

        <mesh position={[0.06, DOME_EQUATOR_Y + 0.08, DOME_RADIUS]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          {metalMaterial('#d0d8e0')}
        </mesh>

        {/* Scorch on dome */}
        <mesh position={[-0.1, DOME_EQUATOR_Y + 0.14, -0.04]} rotation={[0.3, 0.2, 0.5]}>
          <boxGeometry args={[0.12, 0.06, 0.08]} />
          <meshStandardMaterial
            color="#4a5448"
            emissive="#2a3228"
            emissiveIntensity={0.3}
            roughness={0.9}
          />
        </mesh>

        {eyeActive && (
          <mesh position={[0, BODY_CENTER_Y + 0.08, 0.14]}>
            <cylinderGeometry args={[0.05, 0.07, 0.06, 16]} />
            <meshStandardMaterial
              color="#88ccff"
              emissive="#44aaee"
              emissiveIntensity={1.6}
              metalness={0.4}
              roughness={0.25}
            />
          </mesh>
        )}
      </group>

      {/* Center foot */}
      <mesh position={[0.02, 0.03, 0.22]} rotation={[0.55, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.24]} />
        {metalMaterial('#6a8a78')}
      </mesh>

      {/* Right foot */}
      <mesh position={[0.24, 0.03, -0.1]} rotation={[0.1, -0.4, -0.25]}>
        <boxGeometry args={[0.14, 0.06, 0.22]} />
        {metalMaterial('#6a8a78')}
      </mesh>

      {/* Left leg — damaged */}
      <group position={[-0.2, 0.14, -0.06]} rotation={[0.2, 0.5, -0.85]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.28, 12]} />
          {hullMaterial(BODY_GREEN, { emissive: '#2a6a4a' })}
        </mesh>
        <mesh position={[0, 0.02, 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.12, 0.06, 0.2]} />
          {hullMaterial(BODY_GREEN_DARK, { emissive: '#1e5040' })}
        </mesh>
        <mesh position={[0.06, 0.18, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
          {metalMaterial()}
        </mesh>
      </group>

      {/* Damaged arm */}
      <group position={[-0.32, 0.34, 0.02]} rotation={[0.35, 0.1, -1.05]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.04, 0.32, 10]} />
          {hullMaterial('#9aacb8', { emissive: '#5a6a78', emissiveIntensity: 0.5 })}
        </mesh>
        <mesh position={[0, -0.2, 0.04]} rotation={[0.5, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          {metalMaterial('#8a98a4')}
        </mesh>
      </group>
    </group>
  );
}
