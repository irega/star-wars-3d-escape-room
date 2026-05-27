import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('loads the app shell', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Star Wars 3D Escape Room/i);
    await expect(page.getByTestId('app')).toBeVisible();
  });
});
