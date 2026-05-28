import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DamagedAstromechDroid } from './DamagedAstromechDroid';

describe('DamagedAstromechDroid', () => {
  it('renders without crashing', () => {
    expect(() => render(<DamagedAstromechDroid hintLevel={0} />)).not.toThrow();
  });

  it('renders with holoprojector at hint level 1+', () => {
    expect(() => render(<DamagedAstromechDroid hintLevel={1} />)).not.toThrow();
  });
});
