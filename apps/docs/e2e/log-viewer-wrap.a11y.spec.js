import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const width of [390, 960]) {
    test(`wrapped logs geometry, follow and a11y: ${theme}, ${width}px`, async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/preview.html?kind=block&id=log-viewer--wrap&theme=${theme}`);
      const log = page.getByRole('log', { name: 'Wrapped logs' });
      await expect(log).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const rows = log.locator('[data-slot="log-line"]');
      await expect
        .poll(async () => rows.first().evaluate((row) => row.getBoundingClientRect().height))
        .toBeGreaterThan(24);
      // Check both prose and an unbroken 200-character token, including after width changes.
      for (const nextWidth of [width, width === 390 ? 960 : 390]) {
        await page.setViewportSize({ width: nextWidth, height: 900 });
        await expect
          .poll(() =>
            rows.first().evaluate((row) => {
              const next = row.nextElementSibling;
              const token = next.nextElementSibling;
              const rect = row.getBoundingClientRect();
              const tokenRect = next.getBoundingClientRect();
              const message = row.querySelector('.flex-1').getBoundingClientRect();
              const tokenMessage = next.querySelector('.flex-1').getBoundingClientRect();
              const viewport = row.closest('[role="log"]');
              return (
                rect.height > 24 &&
                tokenRect.height > 24 &&
                rect.bottom <= tokenRect.top &&
                tokenRect.bottom <= token.getBoundingClientRect().top &&
                message.top >= rect.top &&
                message.bottom <= rect.bottom &&
                message.left >= rect.left &&
                message.right <= rect.right &&
                tokenMessage.left >= tokenRect.left &&
                tokenMessage.right <= tokenRect.right &&
                viewport.scrollWidth <= viewport.clientWidth
              );
            }),
          )
          .toBe(true);
      }
      const follow = page.getByRole('switch', { name: 'Follow', exact: true });
      await follow.click();
      await page.getByRole('button', { name: 'Append line' }).click();
      await expect
        .poll(() => log.evaluate((node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1))
        .toBe(true);
      const newest = log.getByText(/^Appended full message/).last();
      await expect
        .poll(() =>
          newest.evaluate((node) => {
            const row = node.closest('[data-slot="log-line"]').getBoundingClientRect();
            const view = node.closest('[role="log"]').getBoundingClientRect();
            return row.top >= view.top && row.bottom <= view.bottom + 1;
          }),
        )
        .toBe(true);
      await page.setViewportSize({ width: 600, height: 900 });
      await expect(follow).toBeChecked();
      await expect
        .poll(() => log.evaluate((node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1))
        .toBe(true);
      await log.evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(follow).not.toBeChecked();
      await page.getByRole('searchbox', { name: 'Search logs', exact: true }).fill('Long message');
      await expect(log.locator('mark')).toHaveCount(1);
      await rows.first().click();
      await expect(page.getByRole('status')).toHaveText('Selected log-0');
      await log.focus();
      await page.keyboard.press('Tab');
      const inspect = log.getByRole('button', { name: /^Inspect event/ });
      await expect(inspect).toBeFocused();
      await page.keyboard.press('Tab');
      const copy = log.getByRole('button', { name: /^Copy line/ });
      await expect(copy).toBeFocused();
      await page.keyboard.press('Enter');
      const expected = await rows.first().locator('.flex-1').textContent();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`12:00:00.000 INFO [api] ${expected}`);
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.querySelector('#root'));
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    });
  }
}
