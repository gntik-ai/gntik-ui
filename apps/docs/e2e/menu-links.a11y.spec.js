import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const trigger of ['Run navigation', 'Deployment actions', 'Account']) {
    test(`Menu ${trigger} open has no axe violations in ${theme}`, async ({ page }) => {
      await page.addInitScript((theme) => {
        localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
        localStorage.setItem('gntik-palette', 'green');
        localStorage.setItem('gntik-section', 'ui-components');
      }, theme);
      await page.goto('/#ui-components/menu');
      const component = page.locator('#ui-Menu');
      await expect(component).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await component.getByRole('button', { name: trigger, exact: true }).click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.addScriptTag({ content: AXE });
      const violations = await component.evaluate(async (element) => {
        // Include the documented examples and their portalled popups in the audit.
        // The catalog sidebar is outside the Menu examples' accessibility contract.
        const context = [element, ...document.querySelectorAll('[role="menu"]')];
        // eslint-disable-next-line no-undef
        const result = await axe.run(context, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map(
          (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
        );
      });
      expect(violations).toEqual([]);
    });
  }
}
