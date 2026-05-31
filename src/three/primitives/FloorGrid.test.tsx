import { describe, it, expect } from 'vitest';
import { FloorGrid } from './FloorGrid';
import { renderThree } from '../../test/renderThree';

describe('FloorGrid', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<FloorGrid width={8} depth={8} />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
