import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`row reordering is accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--row-reorder&theme=${theme}`);
    const handle = page.getByRole('button', { name: 'Reorder orders-api', exact: true });
    await expect(page.getByRole('button', { name: 'Reorder default-route' })).toBeDisabled();
    await handle.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await expect(handle).toBeFocused();
    await expect(page.getByRole('rowheader').nth(1)).toHaveText('orders-api');
    await expect(page.locator('[data-live-announcer="polite"]')).toHaveText('orders-api dropped at position 2 of 4.');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
