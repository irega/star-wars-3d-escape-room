import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NonInteractive } from './NonInteractive';

describe('NonInteractive', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <NonInteractive>
          <group />
        </NonInteractive>,
      ),
    ).not.toThrow();
  });
});
