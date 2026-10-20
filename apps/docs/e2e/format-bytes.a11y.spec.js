import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`localized file sizes and formatter options / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
    }, theme);
    for (const [section, selector] of [
      ['file-upload', '[data-format-bytes-components]'],
      ['ui-components', '[data-format-bytes-preview]'],
    ]) {
      await page.goto(`/#${section}`);
      const preview = page.locator(selector);
      await expect(preview.getByRole('figure', { name: 'report-en.pdf' })).toContainText('1.5 kB');
      await expect(
        preview.getByRole('figure', { name: section === 'file-upload' ? 'report.pdf' : 'report-es.pdf' }),
      ).toContainText('1,5 kB');
      if (section === 'file-upload') {
        await expect(preview.getByText('1,5 kB', { exact: true })).toHaveCount(2);
        await expect(preview.getByRole('group')).toContainText('25 MB');
        await expect(preview.getByRole('listitem')).toContainText('1,5 kB');
      } else {
        await expect(preview.getByText('25MB', { exact: true })).toBeVisible();
        await expect(preview.getByText('25 megabytes', { exact: true })).toBeVisible();
      }
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await preview.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    }
  });
}
