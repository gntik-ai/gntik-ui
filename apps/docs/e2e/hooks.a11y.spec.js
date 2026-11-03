// Accessibility gate for the Library > Hooks page and a hook sub-page: axe (WCAG 2.2 A/AA, colour
// contrast included) in dark, light and high_contrast. New page, so nothing is baselined.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const route of ['ui-hooks', 'ui-hooks/use-fit-count']) {
  for (const theme of ['dark', '', 'high_contrast']) {
    const name = theme || 'light';
    test(`${route} a11y --${name}`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('gntik-theme', value);
        localStorage.setItem('gntik-section', 'ui-hooks');
      }, theme);
      await page.goto(`/#${route}`);
      await page.locator('main h1').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const r = await axe.run(document.querySelector('main'), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
      });
      expect(violations, `axe violations on ${route} in ${name}`).toEqual([]);
    });
  }
}
