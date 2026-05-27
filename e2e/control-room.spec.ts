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
// Terminal world [0, 0, -0.5] → depth 5.73 → (640, 346)
// Blast door world [0, 1.4, 3.92] → depth 1.10 → (640, 300)
const TERMINAL = { x: 640, y: 346 };
const DOOR = { x: 640, y: 300 };

const TERMINAL_CORRECT_MSG = 'Override accepted. Blast door unlocked. Proceed to the corridor.';
const DOOR_LOCKED_MSG = 'Blast door sealed. Complete the Imperial Override sequence first.';
const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];

test.describe('control room — scene 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toBeVisible();
    // Wait for Three.js / R3F to mount the canvas and set up its raycasting system.
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);
  });

  test('happy path: solve imperial override puzzle and exit control room', async ({ page }) => {
    // Inventory is empty before solving the puzzle
    await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).not.toBeAttached();

    // Click the terminal to activate input overlay
    await page.locator('canvas').click({ position: TERMINAL });

    // Terminal input overlay should be visible with the header
    await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).toBeVisible();
    await expect(page.getByText('Enter 4-symbol Aurebesh code:')).toBeVisible();

    // Type the correct sequence one letter at a time
    for (const letter of CORRECT_SEQUENCE) {
      await page.keyboard.press(letter);
    }

    // Verify the input buffer displays all 4 letters
    await expect(page.locator('div')).filter({ hasText: /> AURE/ }).first().toBeVisible();

    // Press Enter to submit the sequence
    await page.keyboard.press('Enter');

    // Success message should appear
    await expect(page.getByText(TERMINAL_CORRECT_MSG)).toBeVisible();

    // Override-code should now be in inventory
    await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).toBeVisible();

    // Dismiss the success dialogue
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(TERMINAL_CORRECT_MSG)).not.toBeVisible();

    // Click the blast door — it should now be unlocked (no locked message)
    await page.locator('canvas').click({ position: DOOR });

    // Brief poll to confirm no locked-door dialogue surfaces
    await page.waitForTimeout(300);
    await expect(page.getByText(DOOR_LOCKED_MSG)).not.toBeVisible();
  });

  test('door is locked before solving puzzle', async ({ page }) => {
    // Attempt to use the door before solving the puzzle
    await page.locator('canvas').click({ position: DOOR });

    // "Door locked" dialogue should appear
    await expect(page.getByText(DOOR_LOCKED_MSG)).toBeVisible();

    // Dismiss it — dialogue should disappear
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(DOOR_LOCKED_MSG)).not.toBeVisible();
  });

  test('wrong sequence triggers error and lockout', async ({ page }) => {
    // Click the terminal
    await page.locator('canvas').click({ position: TERMINAL });

    // Terminal input overlay should be visible
    await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).toBeVisible();

    // Type a wrong sequence
    const wrongSequence = ['W', 'R', 'O', 'N'];
    for (const letter of wrongSequence) {
      await page.keyboard.press(letter);
    }

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Error message should appear
    await expect(page.getByText('ACCESS DENIED. Incorrect sequence. Try again.')).toBeVisible();

    // Input should be cleared after lockout
    await page.waitForTimeout(1600); // Wait for the 1.5s lockout + buffer

    // Terminal should still be active (user can try again)
    await expect(page.getByText('Enter 4-symbol Aurebesh code:')).toBeVisible();
  });

  test('escape key cancels terminal input', async ({ page }) => {
    // Click the terminal
    await page.locator('canvas').click({ position: TERMINAL });

    // Terminal input overlay should be visible
    await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).toBeVisible();

    // Type a partial sequence
    await page.keyboard.press('A');
    await page.keyboard.press('U');

    // Press Escape to cancel
    await page.keyboard.press('Escape');

    // Terminal overlay should disappear
    await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).not.toBeVisible();
  });
});
