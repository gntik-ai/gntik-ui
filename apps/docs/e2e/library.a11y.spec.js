// Accessibility gate for the @gntik-ai/ui package: axe (WCAG 2.2 A/AA, colour
// contrast included) on the live Library section in all three themes. Any
// violation not listed in a11y-baseline.json fails; the baseline only shrinks.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const baselineFile = new URL('./a11y-baseline.json', import.meta.url);
const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

for (const theme of ['dark', '', 'high_contrast']) {
  const name = theme || 'light';
  test(`ui-components a11y --${name}`, async ({ page }) => {
    await page.addInitScript(
      ([t]) => {
        localStorage.setItem('gntik-theme', t);
        localStorage.setItem('gntik-section', 'ui-components');
      },
      [theme],
    );
    await page.goto('/#ui-components');
    await page.locator('main h1').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document.querySelector('main'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
    });
    const known = new Set(baseline[name] ?? []);
    const fresh = violations.filter((v) => !known.has(v));
    if (process.env.A11Y_UPDATE) {
      baseline[name] = [...new Set(violations)].sort();
      fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
    }
    expect(fresh, `new axe violations in ${name}`).toEqual([]);
  });
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`cursor-pagination examples --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const component = page.locator('#ui-CursorPagination');
    await expect(component).toBeVisible();
    await expect(component.getByRole('navigation')).toHaveCount(5);
    await expect(component.getByRole('status')).toHaveCount(5);
    await page.addScriptTag({ content: AXE });
    const violations = await component.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
