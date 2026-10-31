import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { openComponent } from './catalog-items.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`TreeList filter and link examples --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('gntik-theme', value), theme);
    await page.goto('/#ui-components/tree-list');
    await openComponent(page, 'TreeList');
    const example = page.locator('#ui-TreeList');
    await expect(example.getByRole('status').filter({ hasText: '1 match' })).toHaveText('1 match');
    await expect(example.locator('mark')).toHaveText('Dialog');
    const navigation = example.getByRole('tree', { name: 'Documentation navigation' });
    await expect(navigation.getByRole('treeitem', { name: 'Getting started' })).toHaveAttribute('aria-current', 'page');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const check = async () => {
      const violations = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element)).violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    await check();
    await example.getByRole('textbox', { name: 'Filter loaded files' }).fill('zzz');
    await expect(example.getByText('No matches.')).toBeVisible();
    await check();
  });
}
