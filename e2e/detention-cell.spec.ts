import { test, expect } from '@playwright/test';

// Canvas click coordinates for Playwright Desktop Chrome (viewport 1280×720).
// Camera: position [0, 1.6, 5], fov=75, lookAt [0,0,0] (R3F default).
// Camera is tilted ~17.7° downward (rotation.x = -atan(1.6/5) ≈ -0.310 rad).
//
// Transform world → camera space (R = column vectors: right, up, camera-z):
//   x_cam = wx
//   y_cam = (wy−1.6)·0.9524 + (wz−5)·(−0.3048)
//   depth = −[(wy−1.6)·0.3048 + (wz−5)·0.9524]
//   ndcX = x_cam / (depth · halfFovX)   halfFovX = tan(37.5°)·(1280/720) ≈ 1.364
//   ndcY = y_cam / (depth · halfFovY)   halfFovY = tan(37.5°) ≈ 0.767
//   screenX = (ndcX + 1) / 2 · 1280
//   screenY = (1 − ndcY) / 2 · 720
//
// Loose panel  world [2.82, 1.5, −3.0]  → depth 7.65 → (813, 216)
// Cell door bar world [0.26, 1.4, 3.94] → depth 1.07 → (754, 302)
//   (clicking a bar — door frame is now a hollow bezel so clicks pass through to the interior)
const PANEL = { x: 813, y: 216 };
const DOOR = { x: 754, y: 302 };

const PANEL_FOUND_MSG = 'A hidden maintenance keycard! This must open the cell door.';
const DOOR_LOCKED_MSG = 'The cell door is sealed. You need a keycard to open it.';

test.describe('detention cell — scene 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toBeVisible();
    // Wait for Three.js / R3F to mount the canvas and set up its raycasting system.
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);
  });

  test('happy path: find keycard and exit detention cell', async ({ page }) => {
    // Inventory is empty before finding the panel
    await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).not.toBeAttached();

    // Click the loose wall panel on the right side of the cell
    await page.locator('canvas').click({ position: PANEL });

    // Keycard-found dialogue appears
    await expect(page.getByText(PANEL_FOUND_MSG)).toBeVisible();

    // HUD inventory now shows the keycard
    await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).toBeVisible();

    // Dismiss the dialogue
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(PANEL_FOUND_MSG)).not.toBeVisible();

    // Click the door — it is unlocked now, so no "door locked" message appears
    await page.locator('canvas').click({ position: DOOR });
    // Brief poll to confirm no locked-door dialogue surfaces
    await page.waitForTimeout(300);
    await expect(page.getByText(DOOR_LOCKED_MSG)).not.toBeVisible();
  });

  test('door is locked without keycard', async ({ page }) => {
    // Attempt to use the door before finding the keycard
    await page.locator('canvas').click({ position: DOOR });

    // "Door locked" dialogue appears
    await expect(page.getByText(DOOR_LOCKED_MSG)).toBeVisible();

    // Dismiss it — dialogue should disappear
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(DOOR_LOCKED_MSG)).not.toBeVisible();
  });
});
