import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const scan = (page) =>
  page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.querySelector('#root'), {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
  });

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`quick filter example has no axe violations in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--quick-filter&theme=${theme}`);
    const field = page.getByRole('searchbox', { name: 'Search Deployments' });
    await expect(field).toBeVisible();
    await field.fill('eu-west gold');
    await expect(page.getByRole('status').filter({ hasText: '3 rows match' })).toHaveCount(1);
    await page.addScriptTag({ content: AXE });
    expect(await scan(page)).toEqual([]);
  });

  test(`collapsible quick filter returns focus to its button in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--quick-filter&theme=${theme}`);
    const button = page.getByRole('button', { name: 'Search Releases' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(page.getByRole('searchbox', { name: 'Search Releases' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Search Releases' })).toBeFocused();
    await page.addScriptTag({ content: AXE });
    expect(await scan(page)).toEqual([]);
  });
}
