import { useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

export interface InteractiveObjectProps {
  children: React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
}

export function InteractiveObject({
  children,
  onClick,
  isDisabled = false,
}: InteractiveObjectProps) {
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isDisabled) onClick?.();
    },
    [isDisabled, onClick],
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!isDisabled) document.body.style.cursor = 'pointer';
    },
    [isDisabled],
  );

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {children}
    </group>
  );
}
