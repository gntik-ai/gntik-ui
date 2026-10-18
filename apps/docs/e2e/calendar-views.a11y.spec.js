import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`calendar views and captions --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const calendar = page.locator('#ui-Calendar').getByRole('group', { name: 'Calendar', exact: true }).first();
    await expect(calendar).toBeVisible();
    await expect(calendar.getByRole('grid')).toHaveAccessibleName('March 2026');
    const example = calendar.locator('..');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const check = async () => {
      const violations = await page.evaluate(async () => {
        // Include portalled select options as well as the example.
        const example = document.querySelector('#ui-Calendar [role="group"][aria-label="Calendar"]').parentElement;
        const listbox = document.querySelector('[role="listbox"][aria-label="Year"]');
        // eslint-disable-next-line no-undef
        const result = await axe.run(listbox ? [example, listbox] : example, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
      });
      expect(violations).toEqual([]);
    };
    await check();
    await calendar.getByRole('button', { name: 'March 2026, choose a month' }).click();
    await expect(calendar.getByRole('grid')).toHaveAccessibleName('2026');
    await expect(calendar.getByRole('button', { name: 'March 2026', exact: true })).toBeFocused();
    await check();
    await calendar.getByRole('button', { name: '2026, choose a year' }).click();
    await expect(calendar.getByRole('button', { name: '2026', exact: true })).toBeFocused();
    await check();
    await example.getByRole('combobox', { name: 'Year', exact: true }).click();
    await expect(page.getByRole('listbox', { name: 'Year', exact: true })).toBeVisible();
    await check();
  });
}
