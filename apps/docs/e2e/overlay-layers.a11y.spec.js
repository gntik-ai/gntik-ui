import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Read the effective stacking surface, including the portal viewport/positioner.
const layer = (locator) =>
  locator.evaluate((element) => {
    for (let node = element; node; node = node.parentElement) {
      const value = getComputedStyle(node).zIndex;
      if (value !== 'auto') return Number(value);
    }
    return 0;
  });

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`modal popup, toast and tooltip stacking / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=layered-overlays&theme=${theme}`);
    for (const kind of ['dialog', 'drawer']) {
      await page.getByRole('button', { name: `Open ${kind}`, exact: true }).click();
      const modal = page.getByRole('dialog', { name: `Layered ${kind}`, exact: true });
      await expect(modal).toBeVisible();
      expect(await layer(modal)).toBe(1400);
      const backdrop = await modal.evaluate(
        (element) => getComputedStyle(element.parentElement.previousElementSibling).zIndex,
      );
      expect(backdrop).toBe('1300');

      await page.getByRole('combobox', { name: 'Select an option' }).click();
      const select = page.getByRole('listbox');
      expect(await layer(select)).toBe(1500);
      await page.getByRole('option', { name: 'First option' }).click();
      await page.getByRole('combobox', { name: 'Search options' }).click();
      expect(await layer(page.getByRole('listbox'))).toBe(1500);
      await page.getByRole('option', { name: 'Second option' }).click();
      await page.getByRole('button', { name: 'More actions', exact: true }).click();
      expect(await layer(page.getByRole('menu'))).toBe(1500);
      await page.keyboard.press('Escape');

      await page.getByRole('button', { name: 'Show hint' }).hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      expect(await layer(tooltip)).toBe(1800);
      // The tooltip floats above the notification button; finish this interaction first.
      await page.keyboard.press('Escape');
      await expect(tooltip).toBeHidden();
      await page.getByRole('button', { name: 'Show notification', exact: true }).click();
      const toast = page.getByRole('dialog', { name: 'Settings saved', exact: true });
      await expect(toast).toBeVisible();
      expect(await layer(toast)).toBe(1700);
      await toast.hover();
      // An unforced click proves that the modal backdrop/viewport does not intercept it.
      await toast.getByRole('button', { name: 'Dismiss notification' }).click();
      await expect(toast).toHaveCount(0);
      await expect(modal).toBeVisible();
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.body);
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
      await modal.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(modal).toHaveCount(0);
    }
  });
}

test('menu-triggered and nested dialogs retain modal portal order', async ({ page }) => {
  await page.goto('/preview.html?kind=block&id=layered-overlays');
  await page.getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: 'Open dialog' }).click();
  const parent = page.getByRole('dialog', { name: 'Layered dialog', exact: true });
  await expect(parent).toBeVisible();
  expect(await layer(parent)).toBe(1400);
  await page.getByRole('button', { name: 'Open nested dialog' }).click();
  const nested = page.getByRole('dialog', { name: 'Nested dialog', exact: true });
  await expect(nested).toBeVisible();
  expect(await layer(nested)).toBe(1400);
  const close = nested.getByRole('button', { name: 'Close', exact: true });
  // Playwright's actionability check verifies the nested surface receives the click.
  await close.click();
  await expect(nested).toHaveCount(0);
  await expect(parent).toBeVisible();
});
