import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`client pagination examples are accessible in ${theme}`, async ({ page }) => {
    const resizeErrors = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('ResizeObserver')) resizeErrors.push(error.message);
    });
    for (const id of [
      'data-table--url-pagination',
      'data-table--auto-page-size',
      'pagination-footer--without-page-size',
    ]) {
      await page.goto(`/preview.html?kind=block&id=${id}&theme=${theme}`);
      await expect(page.getByRole('navigation')).toBeVisible();
      if (id === 'data-table--auto-page-size') {
        await expect(page.getByRole('combobox', { name: 'Rows per page' })).toHaveCount(0);
        const rows = page.getByRole('table').locator('tbody > tr');
        // The parent grows by exactly five comfortable rows (5 * 44px).
        await expect.poll(() => rows.count()).toBeLessThan(10);
        const before = await rows.count();
        expect(before).toBeGreaterThan(0);
        await page.locator('.resize-y').evaluate((element) => {
          element.style.height = '700px';
        });
        await expect(rows).toHaveCount(before + 5);
        await page.locator('.resize-y').evaluate((element) => {
          element.style.height = 'auto';
        });
        await expect(rows).toHaveCount(10);
      }
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
      });
      expect(violations).toEqual([]);
    }
    expect(resizeErrors).toEqual([]);
  });
}
