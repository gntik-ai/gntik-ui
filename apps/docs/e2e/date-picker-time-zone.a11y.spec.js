import { openComponent } from './catalog-items.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const [component, title, names] of [
    ['DatePicker', 'Date Picker Utc', ['Run at', 'Run at without zone labels', 'UTC date']],
    ['DateTimeRangePicker', 'Date Time Range Picker Utc', ['UTC window', 'Window without zone labels']],
  ]) {
    test(`${component} UTC example closed and open --${theme}`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('gntik-theme', value === 'light' ? '' : value), theme);
      await page.goto('/#ui-components');
      await openComponent(page, component);
      const example = page.locator(`#ui-${component}`).getByText(title, { exact: true }).locator('..');
      await example.scrollIntoViewIfNeeded();
      await expect(example).toBeVisible();
      await page.addScriptTag({ content: AXE });
      const check = async (locator) => {
        const violations = await locator.evaluate(async (element) => {
          // eslint-disable-next-line no-undef
          return (await axe.run(element, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
        });
        expect(violations).toEqual([]);
      };
      await check(example);
      for (const name of names) {
        await example.getByRole('combobox', { name, exact: true }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await check(dialog);
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
      }
    });
  }
}
