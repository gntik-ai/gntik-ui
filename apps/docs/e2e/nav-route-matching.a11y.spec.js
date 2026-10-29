import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', '', 'high_contrast']) {
  test(`route matching example is axe clean --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const example = page.locator('[data-example="nav-list-route-matching"]');
    await expect(example.getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const checkAxe = async () => {
      const violations = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    await checkAxe();
    await example.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(example.getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
    await checkAxe();
  });
}
