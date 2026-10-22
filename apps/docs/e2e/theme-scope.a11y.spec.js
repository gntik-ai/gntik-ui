import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function audit(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addScriptTag({ content: AXE });
  const violations = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  });
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`light scope and open Select / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=theme-scope&theme=${theme}`);
    const card = page.locator('[data-scope-example]');
    await expect(card).toBeVisible();
    expect(
      await card.evaluate((el) => {
        const css = getComputedStyle(el);
        return [
          css.getPropertyValue('--background').trim(),
          css.getPropertyValue('--primary-text').trim(),
          css.colorScheme,
        ];
      }),
    ).toEqual(['78 28% 96%', '153 55% 22%', 'light']);
    const portal = page.locator('body > .light[data-theme-scope-portal]');
    const listbox = portal.getByRole('listbox', { name: 'Preview choice' });
    await expect(listbox).toBeVisible();
    expect(
      await listbox.evaluate((el) => {
        const css = getComputedStyle(el);
        return [
          css.getPropertyValue('--popover').trim(),
          css.getPropertyValue('--popover-foreground').trim(),
          css.colorScheme,
        ];
      }),
    ).toEqual(['0 0% 100%', '153 32% 11%', 'light']);
    await expect(listbox.locator('..')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await audit(page);
  });

  test(`nested dark scope / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=theme-scope--nested&theme=${theme}`);
    const inner = page.locator('[data-nested-scope]');
    await expect(inner).toHaveText('Dark');
    await expect(inner).toHaveCSS('color-scheme', 'dark');
    expect(await inner.evaluate((el) => getComputedStyle(el).getPropertyValue('--background').trim())).toBe(
      '152 30% 7.5%',
    );
    await audit(page);
  });

  test(`forced provider / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=theme-provider--forced&theme=${theme}`);
    await page.getByRole('button', { name: 'High contrast', exact: true }).click();
    await expect(page.getByTestId('forced-theme')).toHaveText('High contrast / Light');
    await audit(page);
    await page.getByRole('button', { name: 'Release forced theme' }).click();
    await expect(page.getByTestId('forced-theme')).toHaveText('High contrast / High contrast');
    await audit(page);
  });
}
