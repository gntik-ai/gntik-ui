import { openComponent } from './catalog-items.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const width of [1024, 320]) {
    test(`DatePickerExpiryPresets popup is axe clean${width === 320 ? ' and does not scroll horizontally' : ''} at ${width}px --${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.addInitScript((value) => localStorage.setItem('gntik-theme', value === 'light' ? '' : value), theme);
      await page.goto('/#ui-components');
      await openComponent(page, 'DatePicker');
      const example = page
        .locator('#ui-DatePicker')
        .getByText('Date Picker Expiry Presets', { exact: true })
        .locator('..');
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
      await example.getByRole('combobox', { name: 'Expires on', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const presets = dialog.getByRole('group', { name: 'Quick dates' });
      await expect(presets.getByRole('button')).toHaveCount(4);
      await check(dialog);
      if (width === 320) {
        const overflow = await dialog.evaluate((element) => ({
          page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          dialog: element.scrollWidth - element.clientWidth,
          right: element.getBoundingClientRect().right - document.documentElement.clientWidth,
        }));
        expect(overflow.page).toBeLessThanOrEqual(0);
        expect(overflow.dialog).toBeLessThanOrEqual(0);
        expect(overflow.right).toBeLessThanOrEqual(0);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    });
  }
}
