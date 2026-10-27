import { test, expect } from '@playwright/test';
import { openComponent } from './component-route.helpers.js';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`clearable field examples and popup actions --${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'Input');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const check = async () => {
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.querySelector('main'), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations
          .filter((violation) =>
            violation.nodes.some((node) =>
              node.target.some((selector) => /ui-(Input|Textarea|Select|DatePicker|TimePicker)/.test(selector)),
            ),
          )
          .map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    await check();
    const search = page.locator('#ui-Input').getByRole('textbox', { name: 'Search projects', exact: true }).last();
    await search.focus();
    await search.press('Escape');
    await expect(search).toHaveValue('');
    await expect(search).toBeFocused();
    await openComponent(page, 'Select');
    const region = page.locator('#ui-Select').getByRole('combobox', { name: 'Region', exact: true });
    await region.focus();
    await region.press('Delete');
    await expect(region).toBeFocused();
    await openComponent(page, 'DatePicker');
    const expiry = page.locator('#ui-DatePicker').getByRole('combobox', { name: 'Expiry', exact: true });
    await expiry.click();
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    const popupViolations = await popup.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element);
      return result.violations.map((violation) => violation.id);
    });
    expect(popupViolations).toEqual([]);
    await popup.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(expiry).toHaveValue('');
    await expect(expiry).toBeFocused();
    await openComponent(page, 'Textarea');
    await page.locator('#ui-Textarea').getByRole('button', { name: 'Reset notes' }).click();
    await expect(page.locator('#ui-Textarea').getByRole('textbox', { name: 'Notes', exact: true })).toBeFocused();
    await openComponent(page, 'TimePicker');
    await page.locator('#ui-TimePicker').getByRole('button', { name: 'Reset start time' }).click();
    await expect(page.locator('#ui-TimePicker [data-segment="hour"]').last()).toBeFocused();
    await check();
  });
}
