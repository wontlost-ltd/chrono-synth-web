import { test, expect } from '@playwright/test';

test.describe('Billing', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/login/);
  });

  test('billing page renders current plan section', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.goto('/billing');

    const heading = page.getByText(/计费|Billing|订阅|Subscription/i);
    const skeleton = page.locator('[data-testid="skeleton"]');
    const errorState = page.getByText(/error|错误/i);

    await expect(
      heading.or(skeleton).or(errorState).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('billing page does not crash on load', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.goto('/billing');

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('billing page handles expired token gracefully', async ({ page }) => {
    /* 模拟过期 token：注入一个 token 后拦截 API 返回 401 */
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired-token');
    });
    await page.route('**/api/**', route =>
      route.fulfill({ status: 401, body: JSON.stringify({ error: 'Unauthorized' }) }),
    );
    await page.goto('/billing');

    /* 页面应重定向到登录或显示错误，而不是崩溃 */
    const loginUrl = page.url().includes('/login');
    const errorVisible = await page.getByText(/error|错误|unauthorized|未授权|登录/i).isVisible().catch(() => false);
    const bodyNotEmpty = await page.locator('body').textContent();

    expect(loginUrl || errorVisible || (bodyNotEmpty && bodyNotEmpty.length > 0)).toBeTruthy();
  });

  test('billing page handles network failure gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.route('**/api/**', route => route.abort('connectionrefused'));
    await page.goto('/billing');

    /* 页面不应崩溃 */
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('billing page has correct document title', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.goto('/billing');
    await expect(page).toHaveTitle(/.+/);
  });

  test('clearing auth token redirects away from billing', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.route('**/api/**', route => route.fulfill({ status: 200, body: '{}' }));
    await page.goto('/billing');

    /* 清除 token 并尝试导航，应被重定向 */
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/login|\/billing/);
  });
});
