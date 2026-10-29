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

for (const [palette, theme] of [
  ['green', 'dark'],
  ['green', ''],
  ['green', 'high_contrast'],
  ['navy', 'dark'],
  ['navy', ''],
]) {
  const name = theme || 'light';
  test(`ui-components a11y --${palette}-${name}`, async ({ page }) => {
    await page.addInitScript(
      ([t, p]) => {
        localStorage.setItem('gntik-theme', t);
        localStorage.setItem('gntik-palette', p);
        localStorage.setItem('gntik-section', 'ui-components');
      },
      [theme, palette],
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
    const known = new Set(baseline[palette === 'green' ? name : `${palette}-${name}`] ?? []);
    const fresh = violations.filter((v) => !known.has(v));
    if (process.env.A11Y_UPDATE) {
      baseline[palette === 'green' ? name : `${palette}-${name}`] = [...new Set(violations)].sort();
      fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
    }
    expect(fresh, `new axe violations in ${name}`).toEqual([]);
  });
}

// Every chat component with a *.doc.ts is on the @gntik-ai/chat page, and the page passes axe with no
// baseline (it is new, so nothing is allowed to fail). Same gate for the forms entry inside the Library.
const chatDocFolders = fs
  .readdirSync(new URL('../../../packages/chat/src/', import.meta.url), { withFileTypes: true })
  .filter(
    (d) =>
      d.isDirectory() &&
      fs
        .readdirSync(new URL(`../../../packages/chat/src/${d.name}/`, import.meta.url))
        .some((f) => f.endsWith('.doc.ts')),
  )
  .map((d) => d.name);
const formsDocs = fs
  .readdirSync(new URL('../../../packages/ui/src/forms/', import.meta.url))
  .filter((f) => f.endsWith('.doc.ts'))
  .map((f) => f.replace('.doc.ts', ''));

for (const theme of ['dark', '', 'high_contrast']) {
  const name = theme || 'light';
  test(`chat-components a11y --${name}`, async ({ page }) => {
    await page.addInitScript(
      ([t]) => {
        localStorage.setItem('gntik-theme', t);
        localStorage.setItem('gntik-section', 'chat-components');
      },
      [theme],
    );
    await page.goto('/#chat-components');
    await page.locator('main h1').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await expect(page.locator('main section[id^="chat-"]')).toHaveCount(chatDocFolders.length);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document.querySelector('main'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
    });
    expect(violations, `axe violations in ${name}`).toEqual([]);
  });
}

test('the forms entry is on the Library page', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gntik-section', 'ui-components'));
  await page.goto('/#ui-components');
  await page.locator('main h1').first().waitFor();
  for (const doc of formsDocs) await expect(page.locator(`#ui-${doc}`)).toBeVisible();
});

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
