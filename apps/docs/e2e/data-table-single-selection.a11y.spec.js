import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

test.beforeEach(async ({ page }) => {
  await page.goto('/preview.html?kind=block&id=data-table--single-selection');
  await expect(page.getByRole('group', { name: 'Available versions' })).toBeVisible();
  // External tab stops surround the public example, without changing its radio group.
  await page.locator('#root').evaluate((root) => {
    const before = document.createElement('button');
    before.textContent = 'Before tables';
    root.before(before);
    const after = document.createElement('button');
    after.textContent = 'After tables';
    root.after(after);
  });
});

test('Tab reaches the first enabled radio when the checked version is disabled, and Shift+Tab exits', async ({
  page,
}) => {
  const items = page.getByRole('group', { name: 'Available items' });
  const versions = page.getByRole('group', { name: 'Available versions' });
  const checked = versions.getByRole('radio', { name: 'Version 2' });
  const firstEnabled = versions.getByRole('radio', { name: 'Version 3' });
  await expect(checked).toBeChecked();
  await expect(checked).toBeDisabled();
  await items.getByRole('radio', { name: 'Item A' }).focus();
  await page.keyboard.press('Tab');
  await expect(versions.getByRole('button', { name: 'Version', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  const resize = versions.getByRole('separator', { name: 'Resize Version column' });
  await expect(resize).toBeFocused();
  const width = Number(await resize.getAttribute('aria-valuenow'));
  await page.keyboard.press('ArrowRight');
  await expect(resize).toBeFocused();
  await expect(resize).toHaveAttribute('aria-valuenow', String(width + 10));
  await expect(checked).toBeChecked();
  await page.keyboard.press('Tab');
  const collapse = versions.getByRole('button', { name: /Version history/ });
  await expect(collapse).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(collapse).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstEnabled).toBeFocused();
  await expect(checked).toBeChecked();
  await expect(firstEnabled).not.toBeChecked();
  await expect(checked).toHaveAttribute('name', 'example-version-choice');
  await expect(firstEnabled).toHaveAttribute('name', 'example-version-choice');
  await page.keyboard.press('Shift+Tab');
  await expect(collapse).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'After tables' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(firstEnabled).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(versions.getByRole('radio', { name: 'Version 1' })).toBeFocused();
  await expect(versions.getByRole('radio', { name: 'Version 1' })).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(firstEnabled).toBeFocused();
  await expect(firstEnabled).toBeChecked();
});

test('Tab enters on a checked enabled radio after the first row', async ({ page }) => {
  const items = page.getByRole('group', { name: 'Available items' });
  const selected = items.getByRole('radio', { name: 'Item C' });
  await selected.click();
  await page.getByRole('button', { name: 'Before tables' }).focus();
  await page.keyboard.press('Tab');
  await expect(selected).toBeFocused();
  await expect(selected).toBeChecked();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Before tables' })).toBeFocused();
});

test('pressing version text does not redirect pointer focus to a radio', async ({ page }) => {
  const versions = page.getByRole('group', { name: 'Available versions' });
  const text = versions.getByText('Version 2', { exact: true });
  const firstEnabled = versions.getByRole('radio', { name: 'Version 3' });
  await page.getByRole('button', { name: 'Before tables' }).focus();
  await text.click();
  await expect(firstEnabled).not.toBeFocused();
  await expect(versions.getByRole('radio', { name: 'Version 2' })).toBeChecked();
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`single selection has no axe violations in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--single-selection&theme=${theme}`);
    await expect(page.getByRole('group', { name: 'Available versions' })).toBeVisible();
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.querySelector('#root'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
    });
    expect(violations).toEqual([]);
  });
}
