import { describe, it, expect } from 'vitest';
import { HologramScreen } from './HologramScreen';
import { renderThree } from '../test/renderThree';

describe('HologramScreen', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<HologramScreen emissive="#0044cc" />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
