import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const dir of ['ltr', 'rtl']) {
    test(`slider marks contain labels at 240px and are accessible — ${theme} ${dir}`, async ({ page }) => {
      await page.addInitScript((theme) => {
        localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
        localStorage.setItem('gntik-section', 'ui-components');
      }, theme);
      await page.goto('/#ui-components/slider');
      const example = page.locator('[data-slider-marks-example]');
      await expect(example).toBeVisible();
      await example.evaluate((element, dir) => {
        element.style.width = '240px';
        element.setAttribute('dir', dir);
      }, dir);
      for (const name of ['Temperature', 'Replicas']) {
        const slider = example.getByRole('slider', { name, exact: true });
        const track = slider.locator('..').locator('..');
        await expect
          .poll(async () =>
            track.locator('[data-position]').evaluateAll((labels) => {
              const track = labels[0].parentElement.parentElement.getBoundingClientRect();
              return labels.every((label) => {
                const rect = label.getBoundingClientRect();
                return rect.left >= track.left - 0.5 && rect.right <= track.right + 0.5;
              });
            }),
          )
          .toBe(true);
      }
      const temperature = example.getByRole('slider', { name: 'Temperature', exact: true });
      const track = temperature.locator('..').locator('..');
      const bounds = await track.boundingBox();
      const precise = await track.locator('[data-slider-mark]').first().boundingBox();
      expect(
        Math.abs(precise.x + precise.width / 2 - (dir === 'rtl' ? bounds.x + bounds.width : bounds.x)),
      ).toBeLessThan(1);
      await temperature.focus();
      await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      // The temperature example is continuous; the replicas example restricts keys.
      const replicas = example.getByRole('slider', { name: 'Replicas', exact: true });
      await replicas.focus();
      await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(replicas).toHaveAttribute('aria-valuenow', '8');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.addScriptTag({ content: AXE });
      const violations = await example.evaluate(async (element) => {
        const result = await window.axe.run(element, { rules: { region: { enabled: false } } });
        return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }));
      });
      expect(violations).toEqual([]);
    });
  }
}
