import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Corridor, CELL_POSITIONS, DROID_GROUP_POSITION } from './Corridor';
import '../i18n';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Corridor', () => {
  it('renders without crashing', () => {
    expect(() => render(<Corridor />)).not.toThrow();
  });

  it('accepts an onDialogue callback prop', () => {
    const onDialogue = vi.fn();
    expect(() => render(<Corridor onDialogue={onDialogue} />)).not.toThrow();
  });

  it('power cell positions do not overlap droid wreckage footprint', () => {
    // Regression test for issue #55: Cell 1 was sitting on top of the droid.
    // Minimum XZ-plane clearance required so no cell obscures the droid.
    const MIN_CLEARANCE_XZ = 0.8;

    CELL_POSITIONS.forEach((pos, i) => {
      const dx = pos[0] - DROID_GROUP_POSITION[0];
      const dz = pos[2] - DROID_GROUP_POSITION[2];
      const distXZ = Math.sqrt(dx * dx + dz * dz);
      expect(distXZ, `cell ${i} at [${pos}] is too close to droid`).toBeGreaterThanOrEqual(
        MIN_CLEARANCE_XZ,
      );
    });
  });
});
