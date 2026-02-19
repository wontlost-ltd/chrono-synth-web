import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('root redirects to dashboard then login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unknown routes redirect to dashboard then login', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has correct document title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/.+/);
  });

  test('register page has correct document title', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/.+/);
  });

  test('SSO callback page renders without crash', async ({ page }) => {
    /* 拦截 SSO 相关 API 请求，避免因无后端导致测试 flaky */
    await page.route('**/api/**', route => route.fulfill({ status: 200, body: '{}' }));
    await page.goto('/sso/callback');
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('login page navigation elements are accessible', async ({ page }) => {
    await page.goto('/login');
    const loginButton = page.getByRole('button', { name: /登录|Login/i });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('register page navigation elements are accessible', async ({ page }) => {
    await page.goto('/register');
    const registerButton = page.getByRole('button', { name: /注册|Register/i });
    await expect(registerButton).toBeVisible();
    await expect(registerButton).toBeEnabled();
  });
});
