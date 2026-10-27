import { test, expect } from '@playwright/test';
import { openComponent } from './component-route.helpers.js';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`responsive Grid, Section and helpers / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    for (const id of ['Grid', 'Section']) {
      await openComponent(page, id);
      const example = page.locator(`#ui-${id} [data-responsive-example]`);
      await expect(example).toBeVisible();
      await page.addScriptTag({ content: AXE });
      const violations = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => v.id);
      });
      expect(violations).toEqual([]);
    }
    await openComponent(page, 'responsive');
    await expect(page.locator('#ui-responsive')).toContainText('Dialog from medium screens');
    const responsive = page.locator('#ui-responsive');
    await responsive.getByRole('button', { name: 'tsx', exact: true }).last().click();
    await expect(responsive.locator('pre code').last()).toBeVisible();
    await expect(responsive.locator('pre code').last()).toContainText("from '@gntik-ai/ui'");
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run('[data-responsive-example]', {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.flatMap((violation) =>
        violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
      );
    });
    expect(violations).toEqual([]);
  });
}
