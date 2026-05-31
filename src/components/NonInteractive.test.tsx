import { describe, it, expect } from 'vitest';
import { NonInteractive } from './NonInteractive';
import { renderThree } from '../test/renderThree';

describe('NonInteractive', () => {
  it('renders without crashing', async () => {
    const renderer = await renderThree(
      <NonInteractive>
        <mesh />
      </NonInteractive>,
    );
    expect(renderer.scene.children.length).toBeGreaterThan(0);
    await renderer.unmount();
  });
});
