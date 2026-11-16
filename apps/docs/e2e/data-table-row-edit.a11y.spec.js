import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function scan(page) {
  const violations = await page.evaluate(async () => {
    const result = await globalThis.axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
  });
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`row editors, validation, bulk, creation and deletion are accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--editable-rows&theme=${theme}`);
    const table = page.getByRole('table', { name: 'Row editing and save all' });
    await expect(table.getByRole('button', { name: 'Edit api-gateway', exact: true })).toBeVisible();
    await page.addScriptTag({ content: AXE });
    await scan(page);
    await table.getByRole('button', { name: 'Edit api-gateway', exact: true }).click();
    const quota = table.getByRole('spinbutton', { name: 'Quota for api-gateway' });
    await quota.fill('900');
    await quota.press('Enter');
    await expect(quota).toHaveAccessibleDescription('Exceeds the plan limit');
    await expect(page.getByRole('button', { name: 'Save all', exact: true })).toBeVisible();
    await scan(page);
    await table.getByRole('button', { name: 'Cancel', exact: true }).click();
    const add = page.getByRole('button', { name: 'Add row', exact: true });
    await add.click();
    await expect(table.getByRole('textbox', { name: 'Name for Add row' })).toBeFocused();
    await scan(page);
    await page.keyboard.press('Escape');
    await expect(add).toBeFocused();
    const actions = table.getByRole('button', { name: 'Actions for api-gateway' });
    await actions.click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete api-gateway?' });
    await expect(dialog).toBeVisible();
    await scan(page);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(actions).toBeFocused();
  });

  test(`form-array rows keep keyboard focus and accessible feedback in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--field-array&theme=${theme}`);
    await expect(page.getByRole('button', { name: 'Edit api-gateway', exact: true })).toBeVisible();
    await page.addScriptTag({ content: AXE });
    await scan(page);
    await page.getByRole('button', { name: 'Edit api-gateway', exact: true }).click();
    const name = page.getByRole('textbox', { name: 'Name for api-gateway' });
    await name.fill('gateway');
    await name.press('Enter');
    await expect(page.getByRole('button', { name: 'Edit gateway', exact: true })).toBeFocused();
    await scan(page);
    await page.getByRole('button', { name: 'Actions for gateway' }).click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete gateway?' });
    await scan(page);
    await dialog.getByRole('textbox').fill('gateway');
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Actions for billing' })).toBeFocused();
    await expect(page.getByText('Form submitted', { exact: true })).toHaveCount(0);
    await scan(page);
  });
}
