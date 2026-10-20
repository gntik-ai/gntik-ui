import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`accent-insensitive matching and highlights --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const example = page.locator('#ui-match-text');
    await expect(example.locator('mark')).toHaveText('Función');
    await example.getByRole('textbox').fill('stan');
    await expect(example.locator('mark')).toHaveText('stan');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    for (const target of [example, page.locator('#ui-Combobox'), page.locator('#ui-MultiSelect')]) {
      const violations = await target.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element)).violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    }
  });
}
