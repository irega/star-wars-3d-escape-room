import { describe, it, expect } from 'vitest';
import { InteractiveObject } from './InteractiveObject';

describe('InteractiveObject', () => {
  it('exports the component', () => {
    expect(InteractiveObject).toBeDefined();
    expect(typeof InteractiveObject).toBe('function');
  });
});
