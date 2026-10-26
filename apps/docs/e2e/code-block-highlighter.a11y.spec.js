import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`CodeBlock lazy highlighter / ${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const section = page.locator('#ui-CodeBlock');
    const yaml = section.getByRole('region', { name: 'service.yaml', exact: true });
    await expect(yaml.getByText('name', { exact: true })).toHaveClass('text-primary-text');
    await expect(yaml.getByText('api', { exact: true })).toHaveClass('text-warning-text');
    const python = section.getByRole('region', { name: 'greeting.py', exact: true });
    await expect(python.getByText('greet', { exact: true })).toHaveClass('font-medium text-foreground');
    await expect(python.locator('[data-line]')).toHaveCount(5);
    const sql = section.getByRole('region', { name: 'services.sql', exact: true });
    await expect(sql.getByText('SELECT', { exact: true })).toHaveClass('text-primary-text');
    const go = section.getByRole('region', { name: 'main.go', exact: true });
    await expect(go.getByText('func', { exact: true })).toHaveClass('text-primary-text');
    for (const region of [yaml, python, go, sql]) {
      await expect(region.locator('code span[style]:not([aria-hidden="true"])')).toHaveCount(0);
    }
    // The copyable example must use the optional public entry, not a repository-relative path.
    await expect(section).toContainText("from '@gntik-ai/ui/code-highlight-shiki'");
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const violations = await section.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
