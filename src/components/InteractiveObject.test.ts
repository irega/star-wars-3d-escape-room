import { describe, it, expect } from 'vitest';
import { getInteractiveScale } from './InteractiveObject';

describe('getInteractiveScale', () => {
  it('returns base scale when not hovered', () => {
    expect(getInteractiveScale(false, false)).toBe(1);
  });

  it('returns hover scale when hovered and enabled', () => {
    expect(getInteractiveScale(true, false)).toBeCloseTo(1.05);
  });

  it('returns base scale when hovered but disabled', () => {
    expect(getInteractiveScale(true, true)).toBe(1);
  });

  it('returns base scale when not hovered and disabled', () => {
    expect(getInteractiveScale(false, true)).toBe(1);
  });

  it('accepts custom hover scale', () => {
    expect(getInteractiveScale(true, false, 1.2)).toBeCloseTo(1.2);
  });
});
