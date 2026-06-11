import { test, expect } from '@playwright/test';
import { GATED_PATHS } from '../../lib/pages';

// Every gated route should bounce an unauthenticated visitor to /login.
for (const path of GATED_PATHS) {
  test(`unauthenticated visit to ${path} redirects to /login`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => {});
    // AuthGuard runs client-side in a useEffect, then router.replace('/login').
    await page.waitForURL(/\/login/, { timeout: 12_000 }).catch(() => {});
    await page.waitForTimeout(500);
    expect(page.url(), `${path} should redirect guests to /login`).toContain('/login');
  });
}
