import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`popup search examples, focus, windowing and axe --${theme || 'light'}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await expect(page.locator('#ui-SearchableSelect')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const examples = [
      '[data-example="searchable-select-field"]',
      '[data-example="searchable-select-toolbar"]',
      '[data-example="searchable-select-grouped"]',
      '[data-example="searchable-select-virtualized"]',
      '[data-example="searchable-select-actions"]',
      '[data-example="combobox-popup-search"]',
      '#ui-WorkspaceSwitcher',
    ];
    for (const selector of examples) {
      const example = page.locator(selector);
      const trigger =
        selector === '#ui-WorkspaceSwitcher'
          ? example.getByRole('combobox', { name: 'Data Platform, Switch workspace' })
          : example.getByRole('combobox').first();
      const closed = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element);
        return result.violations.map((violation) => violation.id);
      });
      expect(closed).toEqual([]);
      await trigger.click();
      const popup = page.locator(`[id="${await trigger.getAttribute('aria-controls')}"]`);
      const input = popup.getByRole('combobox');
      await expect(input).toBeFocused();
      const list = popup.getByRole('listbox');
      if (selector.includes('virtualized')) {
        expect(await list.getByRole('option').count()).toBeLessThan(60);
        await expect(list.getByRole('option').first()).toHaveAttribute('aria-setsize', '5000');
        for (let index = 0; index < 80; index++) await input.press('ArrowDown');
        const option = list.getByRole('option', { name: 'Node 80', exact: true });
        await expect(option).toHaveAttribute('data-highlighted', '');
        expect(
          await option.evaluate((element) => {
            const row = element.getBoundingClientRect();
            const viewport = element.closest('[role="listbox"]').getBoundingClientRect();
            return row.top >= viewport.top - 1 && row.bottom <= viewport.bottom + 1;
          }),
        ).toBe(true);
      }
      const opened = await popup.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element);
        return result.violations.map(
          (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
        );
      });
      expect(opened).toEqual([]);
      await input.press('Escape');
      await expect(trigger).toBeFocused();
    }
  });
}
