import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// The full catalog mounts before the adapter fetches its core, engine and grammar chunks.
// Cold production loads can exceed Playwright's default five-second assertion window.
const expectTokens = expect.configure({ timeout: 15_000 });

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`CodeBlock lazy highlighter / ${theme}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const section = page.locator('#ui-CodeBlock');
    const yaml = section.getByRole('region', { name: 'service.yaml', exact: true });
    await expectTokens(yaml.getByText('name', { exact: true })).toHaveClass('text-primary-text');
    await expectTokens(yaml.getByText('"api"', { exact: true })).toHaveClass('text-warning-text');
    const python = section.getByRole('region', { name: 'greeting.py', exact: true });
    await expectTokens(python.getByText('greet', { exact: true })).toHaveClass('font-medium text-foreground');
    await expect(python.locator('[data-line]')).toHaveCount(5);
    const sql = section.getByRole('region', { name: 'services.sql', exact: true });
    await expectTokens(sql.getByText('SELECT', { exact: true })).toHaveClass('text-primary-text');
    const go = section.getByRole('region', { name: 'main.go', exact: true });
    await expectTokens(go.getByText('func', { exact: true })).toHaveClass('text-primary-text');
    const toml = section.getByRole('region', { name: 'config.toml', exact: true });
    await expectTokens(toml.getByText('"api"', { exact: true })).toHaveClass('text-warning-text');
    for (const region of [yaml, python, go, sql, toml]) {
      await expect(region.locator('code span[style]:not([aria-hidden="true"])')).toHaveCount(0);
    }
    // Source panels start collapsed; open this example before checking its copyable public import.
    const example = section.getByText('Code Block Highlighter', { exact: true }).locator('..');
    await example.getByRole('button', { name: 'tsx', exact: true }).click();
    await expect(example).toContainText("from '@gntik-ai/ui/code-highlight-shiki'");
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
