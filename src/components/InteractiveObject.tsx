import { useState, useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

const BASE_SCALE = 1;
const HOVER_SCALE = 1.05;

export function getInteractiveScale(
  isHovered: boolean,
  isDisabled: boolean,
  hoverScale = HOVER_SCALE,
): number {
  return isHovered && !isDisabled ? hoverScale : BASE_SCALE;
}

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
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isDisabled) onClick?.();
    },
    [isDisabled, onClick],
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => setHovered(false), []);

  const scale = getInteractiveScale(hovered, isDisabled);

  return (
    <group
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      scale={scale}
    >
      {children}
    </group>
  );
}
