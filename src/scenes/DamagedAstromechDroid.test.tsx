import { describe, it, expect } from 'vitest';
import { DamagedAstromechDroid } from './DamagedAstromechDroid';
import { renderThree } from '../test/renderThree';

describe('DamagedAstromechDroid', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<DamagedAstromechDroid hintLevel={0} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });

  it('renders with holoprojector at hint level 1+', async () => {
    const renderer = await renderThree(<DamagedAstromechDroid hintLevel={1} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
