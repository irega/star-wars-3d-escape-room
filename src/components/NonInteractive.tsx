import { useRef, useLayoutEffect, type ReactNode } from 'react';
import type * as THREE from 'three';

/** Decorative 3D geometry — excluded from pointer raycasts so clicks reach gameplay objects behind. */
export function NonInteractive({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || typeof root.traverse !== 'function') return;

    const restored: Array<{ obj: THREE.Object3D; raycast: THREE.Object3D['raycast'] }> = [];
    root.traverse((obj) => {
      restored.push({ obj, raycast: obj.raycast });
      obj.raycast = () => undefined;
    });

    return () => {
      restored.forEach(({ obj, raycast }) => {
        obj.raycast = raycast;
      });
    };
  }, []);

  return <group ref={ref}>{children}</group>;
}
