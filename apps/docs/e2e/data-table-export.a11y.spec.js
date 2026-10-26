import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`CSV export example and open menus are accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--csv-export&theme=${theme}`);
    const client = page.getByRole('region', { name: 'Client CSV export' });
    await expect(client.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
    await page.addScriptTag({ content: AXE });
    const scan = async () => {
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
      });
      expect(violations).toEqual([]);
    };
    await scan();
    for (const region of ['Client CSV export', 'Delegated server export', 'Single row export']) {
      await page
        .getByRole('region', { name: region })
        .getByRole('button', { name: /Export|Request export/ })
        .click();
      await expect(page.getByRole('menu')).toBeVisible();
      await scan();
      await page.keyboard.press('Escape');
    }
  });
}
