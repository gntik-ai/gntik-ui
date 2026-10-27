// Accessibility gate for the @gntik-ai/ui package: axe (WCAG 2.2 A/AA, colour
// contrast included) on the live Library section in all three themes. Any
// violation not listed in a11y-baseline.json fails; the baseline only shrinks.
import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import { componentItems, openComponent } from './component-route.helpers.js';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const baselineFile = new URL('./a11y-baseline.json', import.meta.url);
const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

// Reuse the asset cache for each theme on a worker, while keeping a fresh page per item.
const test = base.extend({
  componentContext: [
    async ({ browser }, use, workerInfo) => {
      const { baseURL, viewport, reducedMotion, deviceScaleFactor, isMobile, hasTouch, userAgent } =
        workerInfo.project.use;
      const contexts = new Map();
      const forTheme = async (theme) => {
        if (!contexts.has(theme))
          contexts.set(
            theme,
            browser
              .newContext({ baseURL, viewport, reducedMotion, deviceScaleFactor, isMobile, hasTouch, userAgent })
              .then(async (context) => {
                await context.addInitScript((value) => localStorage.setItem('gntik-theme', value), theme);
                return context;
              }),
          );
        return contexts.get(theme);
      };
      try {
        await use(forTheme);
      } finally {
        await Promise.all([...contexts.values()].map(async (context) => (await context).close()));
      }
    },
    { scope: 'worker' },
  ],
});

test.describe('UI component pages', () => {
  test.describe.configure({ mode: 'parallel' });
  for (const theme of ['dark', '', 'high_contrast']) {
    const name = theme || 'light';
    test.describe(name, () => {
      for (const item of [{ id: null, name: 'index' }, ...componentItems]) {
        test(`${item.name} a11y --${name}`, async ({ componentContext }) => {
          const context = await componentContext(theme);
          const page = await context.newPage();
          try {
            await page.goto('/#ui-components' + (item.id ? '/' + item.id : ''));
            await page.locator('main h1').first().waitFor();
            await page.evaluate(() => document.fonts.ready);
            await page.addScriptTag({ content: AXE });
            const violations = await page.evaluate(async () => {
              // eslint-disable-next-line no-undef
              const result = await axe.run(document.querySelector('main'), {
                runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
              });
              return result.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
            });
            const known = new Set(baseline[name] ?? []);
            expect(
              violations.filter((v) => !known.has(v)),
              `new axe violations for ${item.name} in ${name}`,
            ).toEqual([]);
          } finally {
            await page.close();
          }
        });
      }
    });
  }
});

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
  for (const doc of formsDocs) {
    await openComponent(page, doc);
    await expect(page.locator(`#ui-${doc}`)).toBeVisible();
  }
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`cursor-pagination examples --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/cursor-pagination');
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
