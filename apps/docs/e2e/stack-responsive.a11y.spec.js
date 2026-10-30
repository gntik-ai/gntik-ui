import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`responsive Stack toolbar layout and accessibility / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=stack-responsive-toolbar&theme=${theme}`);
    const toolbar = page.locator('[data-stack-responsive-toolbar]');
    await expect(toolbar).toBeVisible();
    for (const width of [375, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      const cancel = toolbar.getByRole('button', { name: 'Cancel', exact: true });
      const save = toolbar.getByRole('button', { name: 'Save', exact: true });
      const first = await cancel.boundingBox();
      const second = await save.boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (width === 375) {
        expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
        expect(Math.abs(second.x - first.x)).toBeLessThan(1);
      } else {
        expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
        expect(Math.abs(second.y - first.y)).toBeLessThan(1);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await toolbar.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    }
  });
}
