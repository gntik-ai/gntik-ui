import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { closed } from './block-labels.helpers.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const [kind, id] of [
    ['block', 'csp-provider'],
    ['layout', 'print-layout--print-layout-static-styles'],
  ]) {
    test(`${id} / ${theme}`, async ({ page }) => {
      await page.goto(`/preview.html?kind=${kind}&id=${id}&theme=${theme}`);
      await page.getByRole('button', { name: 'Disable style elements' }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const audit = async (selector = 'body') => {
        const violations = await page.evaluate(async (selector) => {
          // eslint-disable-next-line no-undef
          const result = await axe.run(document.querySelector(selector), {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
          });
          return result.violations.map((violation) => violation.id);
        }, selector);
        expect(violations).toEqual([]);
      };
      await audit();
      await page.getByRole('button', { name: 'Disable style elements' }).click();
      if (kind === 'block') {
        const trigger = page.getByRole('combobox', { name: 'Preview choice' });
        await trigger.click();
        await expect(page.getByRole('listbox')).toBeVisible();
        await audit('[role="listbox"]');
        await page.keyboard.press('Escape');
        // Audit the closed page after Base UI removes its focus guards and restores focus.
        await closed(page, 'listbox');
        await expect(trigger).toBeFocused();
      }
      await audit();
    });
  }
}
