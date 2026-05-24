/**
 * §8 Step 10 — Feature-flag remote provider kill-switch e2e.
 *
 * What this test proves:
 *   Admin flipping a feature flag via the OS API reaches connected web
 *   clients live (over SSE) and the affected feature stops rendering
 *   without a page reload. This is the load-bearing acceptance criterion
 *   for incident response — a kill switch with a >0s reload requirement
 *   is not a kill switch.
 *
 * Strategy:
 *   1. Seed session + mock the bootstrap API to return cmdk.enabled=true.
 *   2. Mock the SSE endpoint with a route handler that holds the
 *      connection open, sends the initial snapshot, then later sends a
 *      'change' event setting cmdk.enabled=false on operator command.
 *   3. Wait for the CommandPalette's keyboard handler to be wired up,
 *      open it via Cmd/Ctrl-K, assert the dialog appears.
 *   4. Trigger the SSE 'change' push.
 *   5. Wait for the registry tick, assert the CommandPalette listener is
 *      gone (Cmd-K no longer opens the dialog).
 *
 *   The bootstrap mock fires immediately on load; the SSE mock keeps a
 *   long-lived ReadableStream and a server-side handle so the test can
 *   push 'change' events synchronously from the test process.
 */

import { test, expect, type Page } from '@playwright/test';

const SESSION_STATE = JSON.stringify({
  apiKey: 'kill-switch-test-key',
  tenantId: 'default',
  mode: 'authenticated',
  user: { id: 'kill-test-user', email: 'kill@example.test', role: 'admin' },
});

async function seedSession(page: Page) {
  await page.goto('/login');
  await page.evaluate((value) => {
    localStorage.setItem('chrono-session', value);
    localStorage.setItem('chrono.user.welcome-seen', 'true');
  }, SESSION_STATE);
}

/** Mock the bootstrap endpoint to return cmdk.enabled=true. */
async function mockBootstrap(page: Page) {
  await page.route('**/api/v1/feature-flags/bootstrap', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        flags: [
          { flag: 'cmdk.enabled', value: true, source: 'remote' },
          { flag: 'changelog.drawer.enabled', value: true, source: 'remote' },
          { flag: 'onboarding.checklist.enabled', value: true, source: 'remote' },
        ],
      }),
    });
  });
}

test.describe('Feature flag kill switch (Step 10)', () => {
  test('SSE-pushed cmdk.enabled=false hides the palette without reload', async ({ page }) => {
    await seedSession(page);
    await mockBootstrap(page);

    /* SSE mock: we need a writable handle so the test can push events
     * after the initial snapshot. Playwright's route.fulfill is
     * one-shot; route() with a ReadableStream + a controller stored
     * outside lets us write asynchronously. */
    let sseController: ReadableStreamDefaultController<Uint8Array> | null = null;
    const encoder = new TextEncoder();

    await page.route('**/api/v1/feature-flags/stream', async (route) => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          sseController = controller;
          /* Send the 'snapshot' event the provider expects on connect. */
          const snapshot = {
            flags: [
              { flag: 'cmdk.enabled', value: true, source: 'remote' },
            ],
          };
          controller.enqueue(
            encoder.encode(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`),
          );
        },
      });
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        },
        body: stream as unknown as string, /* Playwright accepts Uint8Array streams */
      });
    });

    /* Go to a stable authed surface. /dashboard is small enough to mount
     * the AppShell without pulling in heavy data. */
    await page.route('**/api/v1/**', (route) => {
      /* Catch-all empty stub for anything else dashboard hits. */
      if (route.request().url().includes('/feature-flags/')) {
        /* Already handled by the routes above; do not re-fulfill. */
        return;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    /* Allow the bootstrap fetch + initial SSE snapshot to apply to the
     * registry. The CommandPalette listens for Cmd/Ctrl+K and renders a
     * dialog with role=dialog. Verify it opens. */
    await page.waitForTimeout(500);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
    /* Close before the kill-switch test so reopening proves the
     * post-kill state, not a leftover open dialog. */
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 2000 });

    /* === Kill the flag === */
    expect(sseController).not.toBeNull();
    const changeEvent = { flag: 'cmdk.enabled', value: false };
    sseController!.enqueue(
      encoder.encode(`event: change\ndata: ${JSON.stringify(changeEvent)}\n\n`),
    );

    /* The registry processes the SSE event synchronously, but React
     * needs a tick to re-render AppShell and unmount CommandPalette.
     * Brief settle. */
    await page.waitForTimeout(300);

    /* === Try to open again — should NOT open === */
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
    /* Give it a beat; a kill switch with >300ms latency wouldn't
     * count as live. */
    await page.waitForTimeout(300);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    /* Cleanup. */
    sseController!.close();
  });
});
