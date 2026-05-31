import { describe, it, expect, vi } from 'vitest';
import { ImperialLighting } from './ImperialLighting';
import { renderThree } from '../test/renderThree';

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  ContactShadows: () => null,
}));

describe('ImperialLighting', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<ImperialLighting />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
