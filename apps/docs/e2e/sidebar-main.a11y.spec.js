import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`ConsoleShell main supports keyboard scrolling and loses its Tab stop when content fits / ${theme}`, async ({
    page,
  }) => {
    await page.goto(`/preview.html?kind=template&id=shell-sidebar--keyboard-main&theme=${theme}`);
    const main = page.getByRole('main', { name: 'Reading area' });
    await expect(main).toHaveAttribute('tabindex', '0');
    await expect(main.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0);
    await page.getByRole('button', { name: /^Theme:/ }).focus();
    await page.keyboard.press('Tab');
    await expect(main).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await page.addScriptTag({ content: AXE });
    const violations = await main.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);

    await page.getByRole('button', { name: 'Show short content' }).click();
    const fittingMain = page.getByRole('main');
    await expect(fittingMain).toHaveAttribute('tabindex', '-1');
    await expect(fittingMain).not.toHaveAttribute('aria-label');
    await page.getByRole('link', { name: 'Skip to main content' }).focus();
    await page.keyboard.press('Enter');
    await expect(fittingMain).toBeFocused();
  });
}
