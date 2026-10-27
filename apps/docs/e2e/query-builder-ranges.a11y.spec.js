import { openComponent } from './component-route.helpers.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`query builder inverted ranges --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'QueryBuilder');
    const example = page.locator('#ui-QueryBuilder').getByRole('group', { name: 'Query', exact: true });
    await expect(example).toBeVisible();
    const message = "'From' must not be after 'To'.";
    await expect(example.getByText(message, { exact: true })).toHaveCount(2);
    for (const input of await example.locator('input[aria-invalid="true"]').all()) {
      await expect(input).toHaveAccessibleDescription(message);
    }
    await expect(example.locator('input[aria-invalid="true"]')).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await example.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element);
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
    expect(violations).toEqual([]);
    await example.getByRole('textbox', { name: 'To', exact: true }).fill('20');
    await expect(example.getByRole('textbox', { name: 'From', exact: true })).not.toHaveAttribute('aria-invalid');
    await expect(example.getByRole('textbox', { name: 'To', exact: true })).not.toHaveAttribute('aria-describedby');
    await expect(example.getByText(message, { exact: true })).toHaveCount(1);
  });
}
