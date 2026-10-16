import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const state of ['default', 'extra-fields', 'server', 'network', 'no-access', 'not-found']) {
    test(`confirm-destructive / ${state} / ${theme}`, async ({ page }) => {
      const id = state === 'default' ? 'confirm-destructive' : `confirm-destructive--${state}`;
      await page.goto(`/preview.html?kind=block&id=${id}&theme=${theme}`);
      await page.getByRole('button', { name: state === 'default' ? 'Delete project' : 'Revoke version' }).click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog).toBeVisible();
      const input = dialog.getByRole('textbox', { name: /Type .* to confirm/ });
      await expect(input).toBeFocused();
      if (state !== 'default') {
        await dialog.getByRole('textbox', { name: 'Justification' }).fill('No longer needed');
        await dialog.getByRole('checkbox', { name: 'Force revocation' }).check();
      }
      if (!['default', 'extra-fields'].includes(state)) {
        await input.fill('version-7');
        await dialog.getByRole('button', { name: 'Revoke version', exact: true }).click();
        await expect(dialog.getByRole('alert')).toHaveCount(1);
        if (['server', 'network'].includes(state)) {
          await expect(dialog.getByRole('button', { name: 'Try again' })).toBeVisible();
          await expect(dialog.getByRole('textbox', { name: 'Justification' })).toHaveValue('No longer needed');
        } else {
          await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
          await expect(dialog.getByRole('button')).toHaveCount(1);
        }
      }
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      });
      expect(violations).toEqual([]);
    });
  }
}
