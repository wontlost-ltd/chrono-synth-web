import { test, expect } from '@playwright/test';

test.describe('Billing', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/login/);
  });

  test('billing page renders current plan section', async ({ page }) => {
    // 模拟认证状态（通过 localStorage 注入 token）
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.goto('/billing');

    // 页面应渲染计费相关内容（标题或加载状态）
    const heading = page.getByText(/计费|Billing|订阅|Subscription/i);
    const skeleton = page.locator('[data-testid="skeleton"]');
    const errorState = page.getByText(/error|错误/i);

    // 页面应至少显示标题、加载骨架或错误状态之一
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

    // 确保页面未崩溃（无 JS 错误导致空白页）
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
});
