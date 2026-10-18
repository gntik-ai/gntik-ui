import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`period picker examples, closed and open --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const component = page.locator('#ui-PeriodPicker');
    await expect(component).toBeVisible();
    await expect(component.getByRole('combobox')).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const check = async (locator) => {
      const violations = await locator.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
      });
      expect(violations).toEqual([]);
    };
    await check(component);
    for (const field of await component.getByRole('combobox').all()) {
      await field.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('[data-period][tabindex="0"]')).toBeFocused();
      await check(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(field).toBeFocused();
    }
  });
}
