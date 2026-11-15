import { openComponent } from './catalog-items.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`editable date picker examples closed and open --${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('gntik-theme', value === 'light' ? '' : value), theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'DatePicker');
    await page.addScriptTag({ content: AXE });
    const check = async (locator) => {
      const violations = await locator.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
      });
      expect(violations).toEqual([]);
    };
    for (const title of ['Date Picker Editable', 'Date Range Picker Editable']) {
      const example = page.locator('#ui-DatePicker').getByText(title, { exact: true }).locator('..');
      await example.scrollIntoViewIfNeeded();
      await expect(example).toBeVisible();
      await check(example);
      const choose = example.getByRole('button', { name: 'Choose date', exact: true }).first();
      await choose.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await check(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(choose).toBeFocused();
    }
  });
}
