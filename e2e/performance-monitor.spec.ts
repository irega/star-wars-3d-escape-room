import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * E2E tests for PerformanceMonitor quality tier switching.
 *
 * Verifies CPU throttling triggers degradation to low tier (dpr=0.75, no ContactShadows).
 * Recovery (onIncline) is not asserted here: drei's PerformanceMonitor keeps a sticky
 * peak refreshrate, so FPS after downgrade often stays below the incline threshold in CI.
 *
 * Uses Chrome DevTools Protocol (CDP) to apply CPU throttling and simulate low FPS.
 */

async function applyCpuThrottle(context: BrowserContext, rate: number) {
  const pages = context.pages();
  if (pages.length === 0) throw new Error('No pages available for throttling');

  const client = await context.newCDPSession(pages[0]);
  // CPU throttle: 1 = normal, 6 = 6x slowdown
  await client.send('Emulation.setCPUThrottlingRate', { rate });
}

test.describe('PerformanceMonitor E2E', () => {
  test('auto-degrades to low tier when CPU is throttled', async ({ page, context }) => {
    test.setTimeout(60_000);

    // Navigate to app and wait for it to fully load
    await page.goto('/');
    await expect(page.getByTestId('app')).toBeVisible();

    // Skip crawl and start game (same flow as escape-room.spec.ts)
    await expect(page.getByTestId('intro')).toBeVisible();
    await page.getByTestId('skip-crawl').click();

    const nameInput = page.getByRole('textbox', { name: /your name|tu nombre/i });
    await expect(nameInput).toBeVisible({ timeout: 10_000 });
    await nameInput.fill('TestPilot');
    await page.getByRole('button', { name: /begin mission|iniciar misión/i }).click();

    // Wait for Canvas to render and PerformanceMonitor to initialize
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);

    // Verify we start in high tier
    const appElement = page.locator('[data-testid="app"]');
    await expect(appElement).toHaveAttribute('data-quality-tier', 'high');

    // Apply CPU throttling (6x slowdown) to trigger FPS decline
    await applyCpuThrottle(context, 6);

    // Wait for PerformanceMonitor to detect the decline and switch to low tier.
    // drei's PerformanceMonitor measures FPS over ~2-3 seconds before triggering onDecline.
    // With 6x CPU throttling, we expect the decline callback within 4-5 seconds.
    await expect(appElement).toHaveAttribute('data-quality-tier', 'low', { timeout: 12_000 });
  });
});
