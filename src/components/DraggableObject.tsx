import { useState, useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

export interface DraggableObjectProps {
  children: React.ReactNode;
  position?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
  isDraggable?: boolean;
}

export function DraggableObject({
  children,
  position = [0, 0, 0],
  isSelected = false,
  onClick,
  isDraggable = true,
}: DraggableObjectProps) {
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (isDraggable) onClick?.();
    },
    [isDraggable, onClick],
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => setHovered(false), []);

  const scale = isSelected ? 1.15 : hovered && isDraggable ? 1.05 : 1;

  return (
    <group
      position={position}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
    </group>
  );
}
