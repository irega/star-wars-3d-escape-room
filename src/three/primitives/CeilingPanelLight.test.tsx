import { describe, it, expect } from 'vitest';
import { CeilingPanelLight } from './CeilingPanelLight';
import { renderThree } from '../../test/renderThree';

describe('CeilingPanelLight', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<CeilingPanelLight />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
