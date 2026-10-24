import { test, expect } from '@playwright/test';

test('production HTML uses a fresh nonce on every response', async ({ request }) => {
  const first = await request.get('/csp');
  const second = await request.get('/csp');
  expect(first.ok()).toBe(true);
  expect(second.ok()).toBe(true);
  const nonce = (response) => response.headers()['content-security-policy'].match(/script-src 'nonce-([^']+)'/)[1];
  expect(nonce(first)).not.toBe(nonce(second));
  const html = await first.text();
  expect(html).toContain(`nonce="${nonce(first)}"`);
});

test('Select, scrolling and theme changes produce no CSP violations', async ({ page }) => {
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.cspViolations.push({ directive: event.effectiveDirective, blocked: event.blockedURI });
    });
  });
  const response = await page.goto('/csp');
  expect(response.ok()).toBe(true);
  const nonce = response.headers()['content-security-policy'].match(/script-src 'nonce-([^']+)'/)[1];
  // Every script, including Next's bootstrap/streaming scripts and the theme script, is covered.
  const inline = page.locator('script:not([src])');
  expect(await inline.count()).toBeGreaterThan(0);
  expect(
    await inline.evaluateAll((elements, expected) => elements.every((element) => element.nonce === expected), nonce),
  ).toBe(true);
  await page.getByRole('combobox', { name: 'Preview choice' }).click();
  await expect(page.getByRole('listbox', { name: 'Preview choice' })).toBeVisible();
  // Next currently passes a script-only nonce to React's server renderer. The app uses
  // disableStyleElements plus static CSS, avoiding unnonced hoisted resource styles.
  await expect(page.locator('style')).toHaveCount(0);
  await expect(page.getByRole('listbox')).toHaveClass(/\[scrollbar-width:none\]/);
  await page.keyboard.press('Escape');
  const viewport = page.getByRole('region', { name: 'Scrollable preview content' });
  await viewport.evaluate((element) => element.scrollTo(0, 160));
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  for (const [label, theme] of [
    ['Light', ''],
    ['High contrast', 'high_contrast'],
    ['Dark', 'dark'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect.poll(() => page.locator('html').getAttribute('class')).toBe(theme);
  }
  // Drain two paint frames so violations from the final theme update are delivered.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});
