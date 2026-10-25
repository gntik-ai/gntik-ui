import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`motion scope and variants / ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/preview.html?kind=block&id=theme-provider--motion&theme=${theme}`);
    const scope = page.getByTestId('motion-scope');
    const scoped = page.getByTestId('motion-skeleton');
    const outside = page.getByTestId('unscoped-skeleton');
    await expect(scope).toHaveAttribute('data-motion', 'reduce');
    await expect(scoped).toHaveCSS('animation-name', 'none');
    await expect(outside).toHaveCSS('animation-name', 'pulse');
    await expect(scope.locator('[data-pulse]')).toHaveCSS('display', 'none');
    await expect(page.getByTestId('unscoped-dot').locator('[data-pulse]')).toHaveCSS('animation-name', 'ping');
    await scoped.evaluate((el) => el.classList.add('motion-safe:animate-pulse'));
    await expect(scoped).toHaveCSS('animation-name', 'none');
    expect(await scoped.evaluate((el) => getComputedStyle(el).getPropertyValue('--duration-normal').trim())).toBe(
      '0ms',
    );
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.body);
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
    await page.getByRole('switch', { name: 'Reduce motion' }).click();
    await expect(scoped).toHaveCSS('animation-name', 'pulse');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(scoped).toHaveCSS('animation-name', 'none');
    await expect(outside).toHaveCSS('animation-name', 'none');
  });
}

test('html scope collapses Dialog transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/preview.html?kind=block&id=motion-dialog');
  await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduce'));
  await page.getByRole('button', { name: 'New project', exact: true }).first().click();
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('transition-duration', '0s');
});
