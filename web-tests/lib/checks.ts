import { test, expect } from '@playwright/test';
import { PageMeta, loadPage, bodyText } from './helpers';

// Text that signals a crashed render / missing route rather than real content.
const ERROR_INDICATORS = [
  /Something went wrong/i,
  /Application error/i,
  /This page could not be found/i,
  /Internal Server Error/i,
  /حدث خطأ ما/,
  /عذراً.*خطأ/,
];

// Registers a standard battery of checks for a single page. Each assertion is
// its own `test()` so a failure maps cleanly to one reported issue.
export function registerPageChecks(meta: PageMeta) {
  test.describe(`${meta.name} [${meta.path}]`, () => {
    test('loads without server error or crash, and sets a page <title>', async ({ page }) => {
      const { status } = await loadPage(page, meta.path);
      if (status !== null) {
        expect(status, `HTTP status for ${meta.path}`).toBeLessThan(400);
      }
      const text = await bodyText(page);
      for (const re of ERROR_INDICATORS) {
        expect(text, `crash/error indicator (${re}) shown on ${meta.path}`).not.toMatch(re);
      }
      const title = (await page.title()).trim();
      expect(title.length, `page <title> is empty on ${meta.path}`).toBeGreaterThan(0);
    });

    test('throws no uncaught JavaScript errors', async ({ page }) => {
      const { pageErrors } = await loadPage(page, meta.path);
      expect(pageErrors, `uncaught JS exceptions on ${meta.path}`).toEqual([]);
    });

    test('logs no console errors', async ({ page }) => {
      const { consoleErrors, failedRequests } = await loadPage(page, meta.path);
      const detail = failedRequests.length
        ? `\n\nFailing network requests behind these errors:\n - ${failedRequests.join('\n - ')}`
        : '';
      expect(consoleErrors, `console.error output on ${meta.path}${detail}`).toEqual([]);
    });

    test('declares Arabic RTL document (lang=ar, dir=rtl)', async ({ page }) => {
      await loadPage(page, meta.path);
      await expect(page.locator('html'), `<html lang> on ${meta.path}`).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html'), `<html dir> on ${meta.path}`).toHaveAttribute('dir', 'rtl');
    });

    test('renders meaningful content (and its expected heading)', async ({ page }) => {
      await loadPage(page, meta.path);
      const text = await bodyText(page);
      expect(text.length, `little/no content rendered on ${meta.path}`).toBeGreaterThan(40);
      if (meta.heading) {
        await expect(
          page.locator('body'),
          `expected text "${meta.heading}" not found on ${meta.path}`,
        ).toContainText(meta.heading, { timeout: 10_000 });
      }
    });

    test('has no broken images', async ({ page }) => {
      await loadPage(page, meta.path);
      const broken = await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0 && !!(img.currentSrc || img.src))
          .map((img) => img.currentSrc || img.src),
      );
      expect(broken, `broken/blank images on ${meta.path}`).toEqual([]);
    });

    test('has no horizontal overflow on a 375px mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await loadPage(page, meta.path);
      const overflowPx = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowPx, `horizontal overflow in px on ${meta.path} (mobile)`).toBeLessThanOrEqual(5);
    });
  });
}
