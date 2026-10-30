// Focused browser reproduction for #735: these pages must pass without a baseline.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { componentPages } from './catalog-items.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const names = ['ChoiceCard', 'DiffViewer', 'Field', 'Textarea', 'ThemeProvider', 'Token', 'TokenInput', 'Toolbar'];

for (const name of names) {
  const component = componentPages.find((entry) => entry.name === name);
  for (const [palette, theme] of [
    ['green', 'dark'],
    ['green', ''],
    ['green', 'high_contrast'],
    ['navy', 'dark'],
    ['navy', ''],
  ]) {
    test(`${name} --${palette}-${theme || 'light'}`, async ({ page }) => {
      await page.addInitScript(
        ([palette, theme]) => {
          localStorage.setItem('gntik-palette', palette);
          localStorage.setItem('gntik-theme', theme);
          localStorage.setItem('gntik-section', 'ui-components');
        },
        [palette, theme],
      );
      await page.goto(`/#ui-components/${component.id}`);
      await page.locator('main h1').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.querySelector('main'), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.flatMap((violation) =>
          violation.nodes.map((node) => `${violation.id} :: ${node.target.join(' ')} :: ${node.failureSummary}`),
        );
      });
      expect(violations).toEqual([]);
    });
  }
}
