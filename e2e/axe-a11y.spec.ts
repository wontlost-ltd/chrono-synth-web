import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
];

for (const { name, path } of PAGES) {
  test(`${name} page passes axe automated a11y checks`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    if (violations.length > 0) {
      const summary = violations.map(v => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n');
      expect.soft(violations, `axe violations on ${name}:\n${summary}`).toEqual([]);
    }
  });
}

test('authenticated billing page passes axe checks', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'test-token');
  });
  await page.route('**/api/**', route => route.fulfill({ status: 200, body: '{}' }));
  await page.goto('/billing');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  if (violations.length > 0) {
    const summary = violations.map(v => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n');
    expect.soft(violations, `axe violations on billing:\n${summary}`).toEqual([]);
  }
});
