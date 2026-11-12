/* global window */
import { expect, test } from '@playwright/test';

test('unregistered content blocks item discovery when idle callbacks have spare time', async ({
  page,
}) => {
  // Make the scheduler condition deterministic for this test only. Browsers may also
  // provide callbacks with no time remaining, which lets the current implementation escape.
  await page.addInitScript(() => {
    window.idleChecks = 0;
    window.requestIdleCallback = (callback) =>
      window.setTimeout(() => {
        window.idleChecks++;
        callback({ didTimeout: false, timeRemaining: () => 10 });
      }, 1);
    window.cancelIdleCallback = (id) => window.clearTimeout(id);
  });
  await page.goto('/');
  const heading = page.getByRole('button', { name: 'Section', exact: true });
  await expect(heading).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.idleChecks)).toBeGreaterThan(5);
  await expect(heading).toHaveAttribute('aria-expanded', 'false');
  await heading.click();
  await expect(heading).toHaveAttribute('aria-expanded', 'false');
  expect(
    await page.locator('demo-content').evaluate((element) => element.matches(':not(:defined)')),
  ).toBe(true);
  await expect
    .poll(() =>
      page.locator('fluent-accordion').evaluate((element) => element.accordionItems?.length ?? 0),
    )
    .toBe(0);

  // Remove only the unregistered host, keeping its content. This is a diagnostic
  // control in the test, not a second mode or workaround in the demo.
  await page.locator('demo-content').evaluate((element) => {
    element.replaceWith(...element.childNodes);
  });
  await expect
    .poll(() =>
      page.locator('fluent-accordion').evaluate((element) => element.accordionItems?.length ?? 0),
    )
    .toBe(1);
  await heading.click();
  await expect(heading).toHaveAttribute('aria-expanded', 'true');
});
