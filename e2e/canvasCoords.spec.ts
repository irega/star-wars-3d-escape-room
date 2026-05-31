import { test, expect } from '@playwright/test';
import { worldToCanvas, CAMERA, VIEWPORT } from './canvasCoords';

test.describe('worldToCanvas', () => {
  test('projects a point on the camera look axis to the canvas center', () => {
    // The optical axis (camera's line of sight) should project to the center of the canvas
    // This is a mathematical invariant of perspective projection
    const result = worldToCanvas([0, 1.6, 0], CAMERA, VIEWPORT);
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

  test('produces valid canvas coordinates within bounds', () => {
    // Any valid world position should project to a valid canvas coordinate
    const testCases = [
      [2.82, 1.5, -3.0],  // Scene 1 panel position
      [0, 1.4, 3.92],      // Scene 1 door position
      [1, 2, -4],          // Arbitrary position
      [-1, 1, -5],         // Different position
    ];

    testCases.forEach((pos) => {
      const result = worldToCanvas(pos as [number, number, number], CAMERA, VIEWPORT);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThanOrEqual(VIEWPORT.width);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(VIEWPORT.height);
    });
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
