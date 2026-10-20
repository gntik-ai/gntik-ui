import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`localised charts / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'bar-charts');
    }, theme);
    await page.goto('/#bar-charts');
    const preview = page.locator('[data-chart-i18n]');
    await expect(preview.getByRole('status', { name: 'Cargando gráfico' })).toBeVisible();
    await expect(
      preview.getByRole('figure', { name: 'Gráfico de barras: Requests', exact: true }).first(),
    ).toBeVisible();
    await expect(preview.getByRole('slider', { name: 'Inicio del rango' }).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await preview.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    });
    expect(violations).toEqual([]);
    await preview.getByRole('combobox', { name: 'Chart language' }).selectOption('en');
    await expect(preview.getByRole('status', { name: 'Loading chart' })).toBeVisible();
    await expect(preview.getByRole('figure', { name: 'Bar chart: Requests', exact: true }).first()).toBeVisible();
  });
}
