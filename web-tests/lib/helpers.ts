import { Page } from '@playwright/test';

export type PageMeta = {
  name: string; // human label used in test titles
  path: string; // URL path to visit
  heading?: RegExp; // a piece of text expected to be visible on the page
  auth: 'guest' | 'user';
};

export type LoadResult = {
  status: number | null;
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};

// Console noise that is not a real application defect.
const CONSOLE_IGNORE = [
  /favicon/i,
  /sourcemap/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /Warning: Extra attributes from the server/i, // hydration cosmetic
  /net::ERR_ABORTED.*\.map/i,
];

// Navigate and collect console errors + uncaught exceptions during load.
export async function loadPage(page: Page, path: string): Promise<LoadResult> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!CONSOLE_IGNORE.some((re) => re.test(text))) consoleErrors.push(text);
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`${err.name}: ${err.message}`);
  });
  // Capture the actual URLs behind "Failed to load resource" console noise so
  // the reported issue says *what* 404'd, not just that something did.
  page.on('response', (resp) => {
    const s = resp.status();
    if (s >= 400 && !/favicon/i.test(resp.url())) {
      failedRequests.push(`${s} ${resp.request().method()} ${resp.url()}`);
    }
  });
  page.on('requestfailed', (req) => {
    const f = req.failure();
    if (f && !/favicon/i.test(req.url())) {
      failedRequests.push(`FAILED ${req.method()} ${req.url()} (${f.errorText})`);
    }
  });

  let status: number | null = null;
  try {
    const resp = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    status = resp ? resp.status() : null;
  } catch {
    // navigation error is asserted by callers via status/content
  }
  // The app uses Socket.IO (never goes "networkidle"); settle on a fixed delay.
  try {
    await page.waitForLoadState('load', { timeout: 12_000 });
  } catch {
    /* ignore */
  }
  await page.waitForTimeout(1800);

  return { status, consoleErrors, pageErrors, failedRequests };
}

export async function bodyText(page: Page): Promise<string> {
  const t = await page.locator('body').innerText().catch(() => '');
  return (t || '').replace(/\s+/g, ' ').trim();
}
