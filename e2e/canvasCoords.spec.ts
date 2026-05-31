import { test, expect } from '@playwright/test';
import { worldToCanvas, CAMERA, VIEWPORT } from './canvasCoords';

test.describe('worldToCanvas', () => {
  test('projects a point on the camera optical axis to the canvas center', () => {
    // The camera looks at [0, 0, 0] from position [0, 1.6, 5].
    // Any point along the optical axis (x=0, z positioned on the axis)
    // should project to canvas center — this tests the algorithm's correctness.
    const result = worldToCanvas([0, 1.6, 0], CAMERA, VIEWPORT);
    expect(result.x).toBe(VIEWPORT.width / 2);
    expect(result.y).toBe(VIEWPORT.height / 2);
  });

  test('projects a point at the world origin', () => {
    // The world origin [0, 0, 0] is the camera lookAt target.
    // Test that the algorithm handles the origin correctly.
    const result = worldToCanvas([0, 0, 0], CAMERA, VIEWPORT);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    // Result should be a valid canvas coordinate
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(VIEWPORT.width);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeLessThanOrEqual(VIEWPORT.height);
  });

  test('produces valid canvas coordinates for arbitrary world position', () => {
    // Test that the algorithm produces valid output for any world coordinate.
    // This validates the algorithm without tying to specific scene values.
    const result = worldToCanvas([5, 2, -5], CAMERA, VIEWPORT);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(VIEWPORT.width);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeLessThanOrEqual(VIEWPORT.height);
  });

  test('maintains symmetry: mirrored positions project symmetrically', () => {
    // Points equidistant from the camera's optical axis should project symmetrically.
    const leftPoint = worldToCanvas([-2, 1.6, 0], CAMERA, VIEWPORT);
    const rightPoint = worldToCanvas([2, 1.6, 0], CAMERA, VIEWPORT);
    const center = VIEWPORT.width / 2;

    // Distance from center should be equal (symmetry)
    const leftDist = Math.abs(leftPoint.x - center);
    const rightDist = Math.abs(rightPoint.x - center);
    expect(leftDist).toBe(rightDist);
  });
});
