import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const examples = [
  'uncontrolled-pending',
  'uncontrolled-success',
  'uncontrolled-error',
  'controlled-idle',
  'controlled-submitting',
  'controlled-success',
  'controlled-error',
  'invite',
];

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const example of examples) {
    test(`create-wizard flow ${example}: ${theme}, every step and review state`, async ({ page }) => {
      await page.goto(`/preview.html?kind=template&id=create-wizard--${example}&theme=${theme}`);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.addScriptTag({ content: axeSource });
      const check = async () => {
        const violations = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const result = await axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          });
          return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
        });
        expect(violations).toEqual([]);
      };
      await check();
      const next = page.getByRole('button', { name: 'Next', exact: true });
      while (await next.count()) {
        const email = page.getByRole('textbox', { name: 'Email address', exact: true });
        if (await email.count()) await email.fill('person@example.com');
        const message = page.getByRole('textbox', { name: 'Message (optional)', exact: true });
        if (await message.count()) await message.fill('Welcome to the team.');
        await next.click();
        await check();
      }
      const finish = page.getByRole('button', {
        name: example === 'invite' ? 'Send invitation' : 'Create resource',
        exact: true,
      });
      if (
        (await finish.count()) &&
        (await finish.isEnabled()) &&
        (await finish.getAttribute('aria-disabled')) !== 'true'
      ) {
        await finish.click();
        if (example.endsWith('success'))
          await expect(page.getByRole('heading', { name: 'Resource created' })).toBeVisible();
        if (example === 'uncontrolled-error')
          await expect(
            page.locator('p').filter({ hasText: 'Could not create the resource. Try again.' }),
          ).toBeVisible();
        if (example === 'uncontrolled-pending')
          await expect(page.getByRole('button', { name: 'Creating resource…' })).toHaveAttribute(
            'aria-disabled',
            'true',
          );
        if (example === 'invite') await expect(page.getByRole('heading', { name: 'Invitation sent' })).toBeVisible();
        await check();
      }
      await page.getByRole('button', { name: 'Exit', exact: true }).click();
      await page.getByRole('alertdialog').waitFor();
      await check();
    });
  }
}
