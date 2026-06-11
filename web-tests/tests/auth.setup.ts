import { test as setup, expect } from '@playwright/test';

// Logs in once via the API and persists the tokens into localStorage so the
// client-side AuthGuard (which reads localStorage.access_token) lets the
// authenticated test project through.
const authFile = 'playwright/.auth/user.json';

const EMAIL = process.env.TEST_EMAIL || 'admin@tayyibt.com';
const PASSWORD = process.env.TEST_PASSWORD || 'Test1234';

setup('authenticate', async ({ page, baseURL }) => {
  const apiBase = `${baseURL}/api/v1`;
  const res = await page.request.post(`${apiBase}/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok(), `login API should succeed (got ${res.status()})`).toBeTruthy();

  const body = await res.json();
  const d = body.data ?? body;
  const access = d.accessToken as string | undefined;
  const refresh = (d.refreshToken as string | undefined) ?? '';
  expect(access, 'login response must contain accessToken').toBeTruthy();

  // Set tokens on the app origin, then snapshot storage state.
  await page.goto('/login');
  await page.evaluate(
    ([a, r]) => {
      localStorage.setItem('access_token', a);
      if (r) localStorage.setItem('refresh_token', r);
    },
    [access as string, refresh],
  );
  await page.context().storageState({ path: authFile });
});
