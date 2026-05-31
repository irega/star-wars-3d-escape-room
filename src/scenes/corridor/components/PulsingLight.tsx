import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PulsingLightProps {
  position: [number, number, number];
  color: string;
  active: boolean;
}

export function PulsingLight({ position, color, active }: PulsingLightProps) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    ref.current.intensity = 0.35 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={active ? 0.35 : 0} />;
}
