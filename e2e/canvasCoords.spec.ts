import { test, expect } from '@playwright/test';
import { worldToCanvas, CAMERA, VIEWPORT } from './canvasCoords';

test.describe('worldToCanvas', () => {
  test('projects scene 1 panel to expected canvas coords', () => {
    const result = worldToCanvas([2.82, 1.5, -3.0], CAMERA, VIEWPORT);
    expect(result.x).toBe(813);
    expect(result.y).toBe(216);
  });

  test('projects scene 1 door bar to expected canvas coords', () => {
    const result = worldToCanvas([0.26, 1.4, 3.94], CAMERA, VIEWPORT);
    expect(result.x).toBe(754);
    expect(result.y).toBe(302);
  });

  test('projects a point on the camera look axis to the canvas center', () => {
    // Any point along the camera's optical axis (x=0, z approaching 0 from camera side)
    // should project near the horizontal center
    const result = worldToCanvas([0, 1.6, 0], CAMERA, VIEWPORT);
    expect(result.x).toBe(VIEWPORT.width / 2);
  });
});
