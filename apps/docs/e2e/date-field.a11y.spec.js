import { openComponent } from './component-route.helpers.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`date field examples, keyboard and paste --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'DateField');
    const component = page.locator('#ui-DateField');
    await expect(component).toBeVisible();
    await expect(component.getByRole('spinbutton')).toHaveCount(21);
    const basic = component.getByRole('group', { name: 'Date', exact: true }).first();
    await basic.getByRole('spinbutton', { name: 'Year' }).evaluate((element) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '2026-11-02');
      element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    });
    await expect(component.locator('input[name="date"]')).toHaveValue('2026-11-02');
    const day = basic.getByRole('spinbutton', { name: 'Day' });
    await day.focus();
    await day.press('ArrowUp');
    await expect(component.locator('input[name="date"]')).toHaveValue('2026-11-03');
    await day.press('ArrowRight');
    await expect(basic.getByRole('spinbutton', { name: 'Year' })).toBeFocused();
    await page.addScriptTag({ content: AXE });
    const violations = await component.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
