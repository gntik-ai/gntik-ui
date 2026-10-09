// Auth-specific WCAG matrix, including the opt-in identifier previews. No baseline exceptions.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const entries = [
  { kind: 'block', id: 'sign-in-form', variant: 'username', recovery: false },
  { kind: 'block', id: 'forgot-password-form', variant: 'username-or-email', recovery: true },
  { kind: 'template', id: 'sign-in-card', variant: 'username', recovery: false },
  { kind: 'template', id: 'forgot-password', variant: 'username-or-email', recovery: true },
];

for (const { kind, id, variant, recovery } of entries) {
  for (const theme of ['dark', 'light', 'high_contrast']) {
    for (const mode of ['email', 'username']) {
      for (const headings of ['default', 'suppressed']) {
        test(`${id} / ${theme} / ${mode} / ${headings}`, async ({ page }) => {
          const previewId = mode === 'email' ? id : `${id}--${variant}`;
          await page.goto(`/preview.html?kind=${kind}&id=${previewId}&theme=${theme}&headings=${headings}`);
          const input = page.getByRole('textbox');
          await expect(input).toBeVisible();
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
            if (headings === 'suppressed') await expect(page.getByRole('heading')).toHaveCount(0);
          };
          await scan();
          await page.getByRole('button', { name: recovery ? 'Send reset link' : 'Sign in', exact: true }).click();
          await expect(input).toBeFocused();
          await expect(input).toHaveAttribute('aria-invalid', 'true');
          await scan();
          if (recovery) {
            await input.fill(mode === 'email' ? 'avery@example.com' : 'avery');
            await page.getByRole('button', { name: 'Send reset link' }).click();
            await expect(input).toHaveCount(0);
            await scan();
          }
        });
      }
    }
  }
}
