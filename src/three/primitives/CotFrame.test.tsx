import { describe, it, expect } from 'vitest';
import { CotFrame } from './CotFrame';
import { renderThree } from '../../test/renderThree';

describe('CotFrame', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(<CotFrame />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
