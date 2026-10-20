import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function audit(locator) {
  const violations = await locator.evaluate(async (element) => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map(
      (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
    );
  });
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`Spanish built-in defaults and overlays / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const preview = page.locator('[data-i18n-catalog]');
    await expect(preview.getByRole('button', { name: 'Añadir marcados' })).toBeVisible();
    await expect(preview.getByRole('navigation', { name: 'Principal' })).toBeVisible();
    await expect(preview.getByRole('button', { name: '+3 más' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    await audit(preview);
    for (const [trigger, name] of [
      ['Start tour', 'Report'],
      ['View media', 'Visor multimedia'],
      ['Open sheet', 'Report details'],
    ]) {
      await preview.getByRole('button', { name: trigger }).click();
      const dialog = page.getByRole('dialog', { name, exact: true });
      await expect(dialog).toBeVisible();
      await audit(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test(`Spanish PageHeader / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=page-header--spanish&theme=${theme}`);
    await expect(page.getByRole('tablist', { name: 'Secciones de la página' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    await audit(page.locator('#root'));
  });
}
