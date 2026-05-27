import { useState, useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

const DEFAULT_SNAP_RADIUS = 0.8;

export function snapToSlot(
  position: [number, number, number],
  slots: [number, number, number][],
  snapRadius: number = DEFAULT_SNAP_RADIUS,
): [number, number, number] | null {
  let closest: [number, number, number] | null = null;
  let minDist = Infinity;

  for (const slot of slots) {
    const dx = position[0] - slot[0];
    const dy = position[1] - slot[1];
    const dz = position[2] - slot[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist <= snapRadius && dist < minDist) {
      minDist = dist;
      closest = slot;
    }
  }

  return closest;
}

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
