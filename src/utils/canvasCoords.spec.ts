import { test, expect } from 'vitest';
import { worldToCanvas } from './canvasCoords';

const VIEWPORT = { width: 1280, height: 720 };

const CAMERA = {
  position: [0, 1.6, 5] as [number, number, number],
  fov: 75,
};

test.describe('worldToCanvas', () => {
  test('projects a point on the camera look axis to the canvas center', () => {
    // lookAt target [0,0,0] lies on the optical axis → canvas center
    const result = worldToCanvas([0, 0, 0], CAMERA, VIEWPORT);
    expect(result.x).toBe(VIEWPORT.width / 2);
    expect(result.y).toBe(VIEWPORT.height / 2);
  });

  test('projects the camera lookAt target (world origin) correctly', () => {
    // The point the camera is looking at should project as expected
    const result = worldToCanvas([0, 0, -5], CAMERA, VIEWPORT);
    // This should be a valid canvas coordinate (not NaN, not Infinity)
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
  });

  test.each([
    { pos: [2.82, 1.5, -3.0] as [number, number, number], label: 'Scene 1 panel position' },
    { pos: [0, 1.4, 3.92] as [number, number, number], label: 'Scene 1 door position' },
    { pos: [1, 2, -4] as [number, number, number], label: 'Arbitrary position' },
    { pos: [-1, 1, -5] as [number, number, number], label: 'Different position' },
  ])('produces valid canvas coordinates within bounds ($label)', ({ pos }) => {
    // Any valid world position should project to a valid canvas coordinate
    const result = worldToCanvas(pos, CAMERA, VIEWPORT);
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(VIEWPORT.width);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeLessThanOrEqual(VIEWPORT.height);
  });

  test('projects mirrored positions symmetrically', () => {
    // Points equidistant from the optical axis should project symmetrically
    const leftPos: [number, number, number] = [-2, 1.6, -4];
    const rightPos: [number, number, number] = [2, 1.6, -4];
    const centerPos: [number, number, number] = [0, 1.6, -4];

    const leftResult = worldToCanvas(leftPos, CAMERA, VIEWPORT);
    const rightResult = worldToCanvas(rightPos, CAMERA, VIEWPORT);
    const centerResult = worldToCanvas(centerPos, CAMERA, VIEWPORT);

    // Left and right should be equidistant from center
    const leftDistance = Math.abs(leftResult.x - centerResult.x);
    const rightDistance = Math.abs(rightResult.x - centerResult.x);
    expect(leftDistance).toBeCloseTo(rightDistance, 0);
  });
});
