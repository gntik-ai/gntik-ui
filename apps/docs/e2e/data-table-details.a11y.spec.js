import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`expandable data table is accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--expandable-rows&theme=${theme}`);
    const toggle = page.getByRole('button', { name: 'Details for inv-42', exact: true });
    const panel = page.getByRole('region', { name: 'Details for inv-42', exact: true });
    await expect(panel).toBeVisible();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(panel).toBeVisible();
    await expect(toggle).toBeFocused();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}

test('detail panel retains viewport width and alignment while pinned columns scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/preview.html?kind=block&id=data-table--expandable-rows&theme=dark');
  const panel = page.getByRole('region', { name: 'Details for inv-42', exact: true });
  await expect(panel).toBeVisible();
  const dimensions = () =>
    panel.evaluate((element) => {
      const viewport = element.closest('table').parentElement;
      const bounds = element.getBoundingClientRect();
      const container = viewport.getBoundingClientRect();
      return {
        widthError: Math.abs(bounds.width - viewport.clientWidth),
        offsetError: Math.abs(bounds.left - container.left),
        overflow: viewport.scrollWidth > viewport.clientWidth,
      };
    });
  await expect.poll(dimensions).toEqual({ widthError: 0, offsetError: 0, overflow: true });
  await panel.evaluate((element) => {
    const viewport = element.closest('table').parentElement;
    viewport.scrollLeft = viewport.scrollWidth;
  });
  await expect.poll(dimensions).toEqual({ widthError: 0, offsetError: 0, overflow: true });
  await page.setViewportSize({ width: 400, height: 900 });
  await expect.poll(async () => (await dimensions()).widthError).toBe(0);
});
