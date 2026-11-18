import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// The example answers each request after 800 ms. Once the first page is on screen, hold later answers back
// so the refresh stays active while axe scans it.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window);
    window.setTimeout = (handler, delay, ...args) =>
      original(handler, window.__holdRefresh && delay === 800 ? 600_000 : delay, ...args);
  });
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`refresh loading keeps rows and has no axe violations in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--refresh-loading&theme=${theme}`);
    const next = page.getByRole('button', { name: 'Next page' });
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(next).toBeEnabled();
    const rowCount = await page.getByRole('row').count();
    await page.evaluate(() => {
      window.__holdRefresh = true;
    });
    await next.click();
    await expect(page.getByRole('progressbar')).toHaveCount(1);
    await expect(page.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('status').filter({ hasText: 'Updating deployments…' })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(rowCount);
    await expect(next).toBeEnabled();
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.querySelector('#root'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
    });
    expect(violations).toEqual([]);
  });

  test(`refresh example empty states have no axe violations in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--refresh-loading&theme=${theme}`);
    await expect(page.getByRole('button', { name: 'Next page' })).toBeEnabled();
    await page.getByRole('textbox', { name: 'Search deployments' }).fill('zzz');
    await expect(page.getByText(/zzz/).first()).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.querySelector('#root'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
    });
    expect(violations).toEqual([]);
  });
}
