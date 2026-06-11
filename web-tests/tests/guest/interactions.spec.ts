import { test, expect } from '@playwright/test';
import { loadPage } from '../../lib/helpers';

test.describe('Login form interactions [/login]', () => {
  test('email & password fields and submit button are present', async ({ page }) => {
    await loadPage(page, '/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('password show/hide toggle reveals the password', async ({ page }) => {
    await loadPage(page, '/login');
    const pwd = page.locator('input[type="password"]').first();
    await pwd.fill('SecretValue1');
    // The eye toggle is the button rendered next to the password input.
    const toggle = page.locator('input[type="password"] ~ button, button:near(input[type="password"])').first();
    await toggle.click({ timeout: 5000 }).catch(() => {});
    const revealed = page.locator('input[type="text"]').filter({ hasNot: page.locator('[type="email"]') });
    await expect(revealed.first()).toBeVisible({ timeout: 5000 });
  });

  test('invalid credentials show an inline error message', async ({ page }) => {
    await loadPage(page, '/login');
    await page.locator('input[type="email"]').fill('nobody-xyz@tayyibt.test');
    await page.locator('input[type="password"]').fill('definitely-wrong-123');
    await page.locator('button[type="submit"]').click();
    // Arabic error copy from LoginForm.formatAuthError.
    await expect(
      page.getByText(/غير صحيحة|تعذّر الاتصال|بيانات الدخول/),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('"forgot password" link navigates to /forgot-password', async ({ page }) => {
    await loadPage(page, '/login');
    await page.getByRole('link', { name: /نسيت كلمة المرور/ }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe('Register form interactions [/register]', () => {
  test('shows email and password inputs', async ({ page }) => {
    await loadPage(page, '/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('link back to /login works', async ({ page }) => {
    await loadPage(page, '/register');
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|لديك حساب/ }).first();
    await loginLink.click({ timeout: 5000 }).catch(() => {});
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});

test.describe('Forgot-password interactions [/forgot-password]', () => {
  test('has an email input and submit control', async ({ page }) => {
    await loadPage(page, '/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
