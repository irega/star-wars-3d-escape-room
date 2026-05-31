import { describe, it, expect } from 'vitest';
import { PropBox } from './PropBox';
import { renderThree } from '../../test/renderThree';

describe('PropBox', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<PropBox size={[1, 1, 1]} color="#fff" />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
