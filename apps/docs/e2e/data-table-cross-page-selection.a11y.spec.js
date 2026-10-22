import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function scan(page) {
  await page.addScriptTag({ content: AXE });
  const violations = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.querySelector('#root'), {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
  });
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`cross-page server selection and matching selection are accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--server-pagination&theme=${theme}`);
    await page.getByRole('checkbox', { name: 'Select 21', exact: true }).click();
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByRole('checkbox', { name: 'Select 41', exact: true })).toBeVisible();
    await expect(page.getByText('1 selected', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Review selection' }).click();
    await expect(page.getByRole('status')).toHaveText('Review items: 21');
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click();
    await scan(page);
    const action = page.getByRole('button', { name: 'Select all 95 rows' });
    await action.click();
    await expect(page.getByRole('button', { name: 'Clear selection' })).toBeFocused();
    await scan(page);
    await page.getByRole('checkbox', { name: 'Select 43', exact: true }).click();
    await page.getByRole('button', { name: 'Review selection' }).click();
    await expect(page.getByRole('status')).toContainText('43');
    await scan(page);
  });

  test(`matching client selection keeps keyboard focus and is accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--client-selection&theme=${theme}`);
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click();
    await expect(page.getByText('All 9 rows on this page are selected.')).toBeVisible();
    await scan(page);
    await page.getByRole('button', { name: 'Select all 94 rows' }).click();
    await expect(page.getByRole('button', { name: 'Clear selection' })).toBeFocused();
    await expect(page.getByText('All 94 rows are selected.')).toBeVisible();
    await scan(page);
  });

  test(`paginated single selection keeps its off-page choice and is accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--paginated-single-selection&theme=${theme}`);
    const group = page.getByRole('group', { name: 'Server items; current choice Item 42' });
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(group.getByRole('radio', { name: 'Item 1', exact: true })).toHaveAttribute('tabindex', '0');
    await scan(page);
    await page
      .getByRole('navigation', { name: 'Server items pagination' })
      .getByRole('button', { name: 'Page 3' })
      .click();
    await expect(group.getByRole('radio', { name: 'Item 42', exact: true })).toBeChecked();
    await expect(group.getByRole('radio', { name: 'Item 42', exact: true })).toHaveAttribute('tabindex', '0');
    await scan(page);
  });
}
