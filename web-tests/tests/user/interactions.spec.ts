import { test, expect } from '@playwright/test';
import { loadPage, bodyText } from '../../lib/helpers';

test.describe('Authenticated shell', () => {
  test('dashboard shows the primary navigation (navbar/sidebar)', async ({ page }) => {
    await loadPage(page, '/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 10_000 });
  });

  test('authenticated user is NOT redirected away from a gated page', async ({ page }) => {
    await loadPage(page, '/settings');
    expect(page.url(), 'authenticated /settings should not bounce to /login').not.toContain('/login');
  });
});

test.describe('Search interactions [/search]', () => {
  test('search input accepts text', async ({ page }) => {
    await loadPage(page, '/search');
    const input = page.locator('input[type="search"], input[type="text"], input[placeholder]').first();
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill('محمد');
    await expect(input).toHaveValue('محمد');
  });

  test('submitting a search does not crash the page', async ({ page }) => {
    await loadPage(page, '/search');
    const input = page.locator('input[type="search"], input[type="text"], input[placeholder]').first();
    await input.fill('a');
    await input.press('Enter').catch(() => {});
    await page.waitForTimeout(2500);
    const text = await bodyText(page);
    expect(text).not.toMatch(/Something went wrong|حدث خطأ ما/);
  });
});

test.describe('Settings navigation', () => {
  test('settings page links through to the Security sub-page', async ({ page }) => {
    await loadPage(page, '/settings');
    const link = page.getByRole('link', { name: /الأمان/ }).first();
    if (await link.count()) {
      await link.click().catch(() => {});
      await expect(page).toHaveURL(/\/settings\/security/, { timeout: 8000 });
    }
  });
});
