import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`platform modifier example --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
      Object.defineProperty(navigator, 'platform', { configurable: true, value: 'Win32' });
      Object.defineProperty(navigator, 'userAgentData', { configurable: true, value: undefined });
    }, theme);
    await page.goto('/#ui-components');
    const example = page.locator('#ui-Kbd');
    await expect(example.getByText('useOs(): windows')).toBeVisible();
    await expect(example.getByText('Ctrl', { exact: true })).toHaveCount(2);
    await expect(example.getByText('Control', { exact: true })).toHaveCount(2);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await example.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      return (await axe.run(element)).violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
