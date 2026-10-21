import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const block of ['month-calendar', 'week-calendar', 'agenda-list']) {
    test(`${block} locale defaults and overrides --${theme}`, async ({ page }) => {
      await page.goto(`/preview.html?kind=block&id=${block}--locale&theme=${theme}`);
      const examples = page.locator('#root [lang="en-US"], #root [lang="es-ES"]');
      await expect(examples).toHaveCount(3);
      await expect(examples.first().getByRole('heading').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (block === 'month-calendar') {
        await expect(examples.first().getByRole('columnheader').first()).toHaveAccessibleName('Sunday');
        await expect(examples.nth(1).getByRole('columnheader').first()).toHaveAccessibleName('lunes');
        await expect(examples.nth(2).getByRole('columnheader').first()).toHaveAccessibleName('Monday');
        const time = examples.first().getByText('9:00 AM', { exact: true }).first();
        await expect(time).toBeVisible();
        expect(
          await time.evaluate((el) => {
            const cell = el.closest('[role="gridcell"]').getBoundingClientRect();
            const text = el.getBoundingClientRect();
            return text.left >= cell.left && text.right <= cell.right;
          }),
        ).toBe(true);
      } else if (block === 'week-calendar') {
        const noon = examples.first().getByText('12 PM', { exact: true });
        await noon.scrollIntoViewIfNeeded();
        await expect(noon).toBeVisible();
        expect(
          await noon.evaluate((el) => {
            const gutter = el.parentElement.getBoundingClientRect();
            const text = el.getBoundingClientRect();
            return text.left >= gutter.left && text.right <= gutter.right;
          }),
        ).toBe(true);
        await expect(examples.nth(1).getByText('09:00', { exact: true }).first()).toBeAttached();
        await expect(examples.nth(2).getByText('09:00', { exact: true }).first()).toBeAttached();
      } else {
        await expect(examples.first().getByText('9:00 AM–10:00 AM', { exact: true })).toBeVisible();
        await expect(examples.nth(1).getByText('09:00–10:00', { exact: true })).toBeVisible();
        await expect(examples.nth(2).getByText('09:00–10:00', { exact: true })).toBeVisible();
      }
      await page.addScriptTag({ content: AXE });
      const violations = await page.locator('#root').evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
      });
      expect(violations).toEqual([]);
    });
  }
}
