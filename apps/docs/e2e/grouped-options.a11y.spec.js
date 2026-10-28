import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function checkAxe(page, example) {
  const violations = await page.evaluate(async (selector) => {
    const root = document.querySelector(selector);
    const input = root.querySelector('[role="combobox"][aria-expanded="true"]');
    const list = input && document.getElementById(input.getAttribute('aria-controls'));
    // Include the portaled status/empty state while Base UI hides the background.
    const context = input && list ? [input, list.parentElement] : root;
    // eslint-disable-next-line no-undef
    const result = await axe.run(context);
    return result.violations.map((violation) => violation.id);
  }, example);
  expect(violations).toEqual([]);
}

for (const theme of ['dark', '', 'high_contrast']) {
  test(`grouped pickers and filtered states are axe clean --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    for (const [selector, labels] of [
      ['[data-example="combobox-grouped"]', ['City by region', 'Remote city by region']],
      ['[data-example="multi-select-grouped"]', ['Cities by region']],
    ]) {
      const example = page.locator(selector);
      await expect(example).toBeVisible();
      await checkAxe(page, selector);
      for (const name of labels) {
        const input = example.getByRole('combobox', { name, exact: true });
        await input.click();
        const id = await input.getAttribute('aria-controls');
        const list = page.locator(`[id="${id}"]`);
        await expect(list.getByRole('group', { name: 'Europe' })).toBeVisible();
        await expect(list.getByRole('group', { name: 'Americas' })).toBeVisible();
        await checkAxe(page, selector);
        await input.fill('par');
        await expect(list.getByRole('group', { name: 'Americas' })).toHaveCount(0);
        await expect(list.getByRole('option', { name: 'Paris', exact: true })).toBeVisible();
        await checkAxe(page, selector);
        await input.fill('zzz');
        await expect(list.getByRole('group')).toHaveCount(0);
        await checkAxe(page, selector);
        await input.press('Escape');
        await expect(input).toHaveAttribute('aria-expanded', 'false');
      }
    }
  });
}
