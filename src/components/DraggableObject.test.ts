import { describe, it, expect } from 'vitest';
import { snapToSlot } from './DraggableObject';

describe('snapToSlot', () => {
  const slots: [number, number, number][] = [
    [1, 0, 0],
    [3, 0, 0],
    [-2, 0, 1],
  ];

  it('returns null when no slot is within snap radius', () => {
    expect(snapToSlot([10, 0, 0], slots, 1)).toBeNull();
  });

  it('returns the closest slot within snap radius', () => {
    expect(snapToSlot([0.8, 0, 0], slots, 1)).toEqual([1, 0, 0]);
  });

  it('returns the nearest slot when multiple are within radius', () => {
    expect(snapToSlot([2.4, 0, 0], slots, 1)).toEqual([3, 0, 0]);
  });

  it('snaps exactly at the snap radius boundary', () => {
    expect(snapToSlot([2, 0, 0], slots, 1)).toEqual([1, 0, 0]);
  });

  it('returns null when position is just outside snap radius of all slots', () => {
    expect(snapToSlot([4.01, 0, 0], slots, 1)).toBeNull();
  });

  it('returns null when slots list is empty', () => {
    expect(snapToSlot([0, 0, 0], [], 5)).toBeNull();
  });
});
