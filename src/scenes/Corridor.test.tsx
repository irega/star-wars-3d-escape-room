import { describe, it, expect, vi } from 'vitest';
import { Corridor, CELL_POSITIONS, DROID_GROUP_POSITION } from './Corridor';
import { renderThree } from '../test/renderThree';
import '../i18n';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('Corridor', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<Corridor />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('accepts an onDialogue callback prop', async () => {
    const onDialogue = vi.fn();
    const renderer = await renderThree(<Corridor onDialogue={onDialogue} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
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

  it('power cell positions do not overlap with each other', () => {
    // Regression test: cells must be separated to avoid visual overlap.
    // Each cell is approximately [0.28, 0.5, 0.18], so minimum safe distance ≈ 0.6 units.
    const MIN_CELL_SEPARATION = 0.6;

    for (let i = 0; i < CELL_POSITIONS.length; i++) {
      for (let j = i + 1; j < CELL_POSITIONS.length; j++) {
        const pos1 = CELL_POSITIONS[i];
        const pos2 = CELL_POSITIONS[j];
        const dx = pos1[0] - pos2[0];
        const dz = pos1[2] - pos2[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        expect(distXZ, `cell ${i} and ${j} are overlapping`).toBeGreaterThanOrEqual(
          MIN_CELL_SEPARATION,
        );
      }
    }
  });
});
