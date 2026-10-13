import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const previews = [
  'sign-up-form',
  'sign-up-form--custom-fields',
  'sign-up-form--no-terms',
  'sign-up-form--unavailable',
  'sign-up-form--loading',
  'sign-up-form--submitting',
  'sign-up-form--error',
];

for (const id of previews) {
  for (const theme of ['dark', 'light', 'high_contrast']) {
    test(`${id} / ${theme}`, async ({ page }) => {
      await page.goto(`/preview.html?kind=block&id=${id}&theme=${theme}`);
      const inactive = ['sign-up-form--unavailable', 'sign-up-form--loading'].includes(id);
      if (inactive) {
        await expect(page.getByRole('status').first()).toBeVisible();
        await expect(page.getByRole('form')).toHaveCount(0);
        await expect(page.locator('input')).toHaveCount(0);
      } else {
        await expect(page.getByRole('form', { name: 'Create account' })).toBeVisible();
      }
      await page.addScriptTag({ content: AXE });
      const scan = async () => {
        const violations = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const result = await axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          });
          return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        });
        expect(violations).toEqual([]);
      };
      await scan();
      if (inactive) {
        await expect(page.getByRole('button', { name: 'Create account', exact: true })).toHaveCount(0);
      } else if (id === 'sign-up-form--submitting') {
        await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeDisabled();
      } else {
        await page.getByRole('button', { name: 'Create account', exact: true }).click();
        await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('aria-invalid', 'true');
        if (id === 'sign-up-form--custom-fields') {
          const summary = page.getByRole('region', { name: 'There are 6 problems with this form' });
          await expect(summary).toBeFocused();
          await expect(summary.getByRole('link')).toHaveCount(6);
          for (const link of await summary.getByRole('link').all()) {
            const target = await link.getAttribute('href');
            await link.click();
            await expect(page.locator(`[id="${target.slice(1)}"]`)).toBeFocused();
          }
        }
        await scan();
      }
    });
  }
}
