import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`JsonViewer capped, empty and uncapped a11y --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const viewer = page.locator('#ui-JsonViewer');
    await viewer.getByRole('region', { name: 'Capped result payload' }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await viewer.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element);
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);

    const region = viewer.getByRole('region', { name: 'Capped result payload' });
    const copyValue = viewer.getByRole('button', { name: 'Copy value', exact: true }).first();
    await copyValue.focus();
    await page.keyboard.press('Tab');
    await expect(region).toBeFocused();
    expect(await region.evaluate((element) => element.clientHeight)).toBeLessThanOrEqual(160);
    expect(await region.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    const afterArrow = await region.evaluate((element) => element.scrollTop);
    await page.keyboard.press('PageDown');
    await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(afterArrow);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('PageUp');
    await expect(region).toBeFocused();
  });
}
