import { describe, it, expect } from 'vitest';
import { BlastDoor } from './BlastDoor';
import { renderThree } from '../test/renderThree';

describe('BlastDoor', () => {
  it('renders locked', async () => {
    const renderer = await renderThree(<BlastDoor />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('renders unlocked', async () => {
    const renderer = await renderThree(<BlastDoor unlocked />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
