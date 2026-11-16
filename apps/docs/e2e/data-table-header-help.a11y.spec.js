import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`header help example closed and open is accessible in ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=data-table--header-help&theme=${theme}`);
    const header = page.getByRole('columnheader', { name: 'p95 latency', exact: true });
    await expect(header.getByText('(ms)')).toBeVisible();
    await page.addScriptTag({ content: AXE });
    const scan = async () => {
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
      });
      expect(violations).toEqual([]);
    };
    await scan();
    for (const label of ['p95 latency', 'Tokens', 'Cost']) {
      const trigger = page.getByRole('button', { name: `More information about ${label}`, exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog', { name: label, exact: true })).toBeVisible();
      await expect(header).toHaveAttribute('aria-sort', 'none');
      await scan();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  });
}
