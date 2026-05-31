import { test, expect, type Page } from '@playwright/test';
import { SCENE1_WORLD } from '../src/scenes/DetentionCell';
import { SCENE2_WORLD } from '../src/scenes/ControlRoom';
import { SCENE3_WORLD } from '../src/scenes/Corridor';
import { SCENE4_WORLD } from '../src/scenes/HangarBay';
import { worldToCanvas } from '../src/utils/canvasCoords';

const CAMERA = {
  position: [0, 1.6, 5] as [number, number, number],
  fov: 75,
};
const CORRECT_SEQUENCE = ['A', 'U', 'R', 'E'];
const WRONG_SEQUENCE = ['W', 'X', 'Y', 'Z'];

test('happy path: escape from detention cell through control room to corridor', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();

  await completeIntro(page);

  // ── Scene 1: Detention Cell ───────────────────────────────────────────────

  // Find the hidden keycard behind the loose wall panel
  await clickWorld(page, SCENE1_WORLD.panel);
  await expect(
    page.getByText('A hidden maintenance keycard! This must open the cell door.'),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'keycard' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit the detention cell — door now unlocked
  await clickWorld(page, SCENE1_WORLD.doorClick);

  // ── Scene 2: Control Room ─────────────────────────────────────────────────

  await waitForRoom(page, 'control-room');
  await page.waitForTimeout(500);

  // Solve the Imperial Override puzzle at the terminal
  await clickWorld(page, SCENE2_WORLD.terminal);
  await expect(page.getByTestId('control-room-terminal')).toBeVisible();
  await expect(page.getByText('IMPERIAL OVERRIDE SYSTEM v4.2')).toBeVisible();

  for (const letter of CORRECT_SEQUENCE) {
    await page.keyboard.press(letter);
  }
  await page.keyboard.press('Enter');

  await expect(
    page.getByText('Override accepted. Blast door unlocked. Proceed to the corridor.'),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'override-code' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the blast door to the corridor
  await clickWorld(page, SCENE2_WORLD.door);
  await page.waitForTimeout(300);
  await expect(
    page.getByText('Blast door sealed. Complete the Imperial Override sequence first.'),
  ).not.toBeVisible();

  // ── Scene 3: Corridor ─────────────────────────────────────────────────────

  await waitForRoom(page, 'corridor');
  await page.waitForTimeout(500);
  await dismissOverlays(page);

  // Cell 0 starts at 0° — correct orientation for Slot 0 (no rotation needed)
  await clickWorld(page, SCENE3_WORLD.cell0);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.slot0);
  await page.waitForTimeout(200);

  // Cell 1 starts at 0° — needs 90° for Slot 1 (one rotation)
  await clickWorld(page, SCENE3_WORLD.cell1);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.cell1);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.slot1);
  await page.waitForTimeout(200);

  // Cell 2 starts at 0° — needs 180° for Slot 2 (two rotations)
  await clickWorld(page, SCENE3_WORLD.cell2);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.cell2);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.cell2);
  await page.waitForTimeout(200);
  await clickWorld(page, SCENE3_WORLD.slot2);
  await page.waitForTimeout(500);

  // All conduits powered — frequency in inventory, dialogue shown
  await expect(page.getByText(/All conduits powered! Frequency 1138 acquired/)).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'frequency' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();

  // Exit through the corridor blast door to the hangar bay
  await clickWorld(page, SCENE3_WORLD.door);
  await page.waitForTimeout(300);
  await waitForRoom(page, 'hangar-bay');

  // ── Scene 4: Hangar Bay ───────────────────────────────────────────────────

  await dismissOverlays(page);
  // Click the launch console to open the credential verification overlay
  await clickWorld(page, SCENE4_WORLD.console);
  await expect(page.getByText('IMPERIAL LAUNCH CONTROL v7.1')).toBeVisible();

  // Verify all three credentials are present and slots show "filled" status
  await expect(page.getByText('KEYCARD INSERTED')).toBeVisible();
  await expect(page.getByText('AURE — ACCEPTED')).toBeVisible();
  await expect(page.getByText('FREQ 1138 — LOCKED')).toBeVisible();

  // Launch the shuttle — all credentials are present
  await page.getByRole('button', { name: /INITIATE LAUNCH/i }).click();
  await page.waitForTimeout(500);

  // Verify victory screen appears
  await expect(page.getByText(/escaped Detention Block AA-23/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Play Again/i })).toBeVisible();
});

test('edge case: wrong terminal input shows access denied and keeps terminal open', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByTestId('app')).toBeVisible();
  await completeIntro(page);

  // Fast-path through Scene 1 to reach the control room
  await clickWorld(page, SCENE1_WORLD.panel);
  await expect(
    page.getByText('A hidden maintenance keycard! This must open the cell door.'),
  ).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();
  await clickWorld(page, SCENE1_WORLD.doorClick);
  
  // Wait for Scene 2: Control Room
  await waitForRoom(page, 'control-room');
  await page.waitForTimeout(500);

  // Open the terminal
  await clickWorld(page, SCENE2_WORLD.terminal);
  await expect(page.getByTestId('control-room-terminal')).toBeVisible();

  // Type an incorrect 4-symbol sequence and submit
  for (const letter of WRONG_SEQUENCE) {
    await page.keyboard.press(letter);
  }
  await page.keyboard.press('Enter');

  // ACCESS DENIED message should appear
  await expect(page.getByText('ACCESS DENIED. Incorrect sequence. Try again.')).toBeVisible();
  
  // Terminal must stay open — wrong input does not close the overlay
  await expect(page.getByTestId('control-room-terminal')).toBeVisible();
});

/** Skip crawl and start the game (intro requires skip or full crawl before the name form). */
async function completeIntro(page: Page, playerName = 'Playwright') {
  await expect(page.getByTestId('intro')).toBeVisible();

  await page.getByTestId('skip-crawl').click();

  const nameInput = page.getByRole('textbox', { name: /your name|tu nombre/i });
  await expect(nameInput).toBeVisible({ timeout: 10_000 });
  await nameInput.fill(playerName);

  await page.getByRole('button', { name: /begin mission|iniciar misión/i }).click();

  await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(500);
}

/** Click a world position using the live canvas size (R3F pointer uses container pixels, not a fixed viewport). */
async function clickWorld(page: Page, world: [number, number, number]) {
  const canvas = await page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not available');

  const position = worldToCanvas(world, CAMERA, {
    width: box.width,
    height: box.height,
  });
  await page.mouse.click(box.x + position.x, box.y + position.y);
}

async function waitForRoom(page: Page, room: string) {
  await expect(page.locator('[data-testid="app"]')).toHaveAttribute('data-room', room, {
    timeout: 15_000,
  });
}

/** Dismiss dialogue or schematic overlays so canvas clicks are not blocked. */
async function dismissOverlays(page: Page) {
  const close = page.getByRole('button', { name: /close/i });
  while (await close.isVisible().catch(() => false)) {
    await close.click();
    await page.waitForTimeout(150);
  }
}