import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const presentations = [
  ['default fullscreen', 'layout', 'wizard-layout--wizard-layout-overlay', true],
  ['explicit fullscreen', 'layout', 'wizard-layout--wizard-layout-overlay-fullscreen', true],
  ['default dialog', 'block', 'dialog-wizard', false],
];

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const [device, width] of [['desktop', 1280], ['tablet', 768], ['mobile', 390]]) {
    for (const [name, kind, id, fullscreen] of presentations) {
      test(`${name}: ${theme}, ${device}, sizing and mid/review axe`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/preview.html?kind=${kind}&id=${id}&theme=${theme}`);
        await page.getByRole('button', { name: 'Create resource', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Create resource', exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        const box = await dialog.boundingBox();
        if (fullscreen || device === 'mobile') {
          expect(box.x).toBe(0);
          expect(box.y).toBe(0);
          expect(box.width).toBe(width);
          expect(box.height).toBe(900);
        } else {
          expect(box.width).toBeLessThan(width);
          expect(box.height).toBeLessThan(900);
          expect(box.x).toBeGreaterThan(0);
          expect(box.y).toBeGreaterThan(0);
        }
        expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        await dialog.locator('input').fill('orders-api');
        await page.addScriptTag({ content: axeSource });
        for (const action of ['Next', 'Next']) {
          await dialog.getByRole('button', { name: action, exact: true }).click();
          await expect(dialog.locator('[role="status"]')).toContainText(/Step [23] of 3/);
          const violations = await page.evaluate(async () => {
            // eslint-disable-next-line no-undef
            const result = await axe.run(document.querySelector('[role="dialog"]'), {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
            });
            return result.violations.map((v) => `${v.id}: ${v.help}`);
          });
          expect(violations).toEqual([]);
        }
        const finish = dialog.getByRole('button', { name: /^(Finish|Create resource)$/ });
        await expect(finish).toBeInViewport();
        const actionBox = await finish.boundingBox();
        expect(actionBox.y + actionBox.height).toBeLessThanOrEqual(900);
      });
    }
  }
}
