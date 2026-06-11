import { defineConfig, devices } from '@playwright/test';

// Target the live deployment by default; override with BASE_URL env var.
const BASE_URL = process.env.BASE_URL || 'https://145-14-158-100.sslip.io';

export default defineConfig({
  testDir: './tests',
  // Each page check is an independent test so every failure maps to one issue.
  fullyParallel: true,
  forbidOnly: false,
  // Retry once so a transient network blip on the live site doesn't masquerade
  // as a real defect — a genuine issue fails on both attempts.
  retries: 1,
  // Keep load on the live VPS reasonable.
  workers: 4,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'results/results.json' }],
    ['html', { open: 'never', outputFolder: 'results/html' }],
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'ar',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      // Public + auth pages, and the auth-guard redirect checks (no session).
      name: 'guest',
      testMatch: /tests\/guest\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Authenticated pages (main app + settings + dynamic routes).
      name: 'user',
      testMatch: /tests\/user\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    },
  ],
});
