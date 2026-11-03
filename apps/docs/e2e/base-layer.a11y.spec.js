import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const preview = (id, theme = 'dark') => `/preview.html?kind=block&id=${id}&theme=${theme}`;

async function expectAccessible(page) {
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  });
  expect(violations).toEqual([]);
}

// Model omitting only base.css in the already compiled docs entry. The compiler
// test separately verifies that importing ui/styles.css never includes these rules.
async function omitBase(page) {
  await page.evaluate(() => {
    const selectors = new Set([
      'body',
      '::selection',
      'html',
      'html[data-scroll-gutter="stable"]',
      ':where(#root, #__next, [data-app-root])',
    ]);
    const remove = (rules) => {
      for (let i = rules.cssRules.length - 1; i >= 0; i--) {
        const rule = rules.cssRules[i];
        if (selectors.has(rule.selectorText)) rules.deleteRule(i);
        else if (rule.cssRules) remove(rule);
      }
    };
    for (const sheet of document.styleSheets) remove(sheet);
  });
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`base colours, typography, selection and scrollbars / ${theme}`, async ({ page }) => {
    await page.goto(preview('motion-dialog', theme));
    await expect(page.getByRole('button', { name: 'New project' })).toBeVisible();
    const values = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.cssText =
        'background-color:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-sans);border-color:hsl(var(--border));';
      document.body.append(probe);
      const expected = getComputedStyle(probe);
      const body = getComputedStyle(document.body);
      const selection = document.createElement('div');
      selection.style.backgroundColor = 'hsl(var(--primary) / 0.28)';
      document.body.append(selection);
      const result = {
        body: [body.backgroundColor, body.color, body.fontFamily],
        expected: [expected.backgroundColor, expected.color, expected.fontFamily],
        selection: getComputedStyle(document.body, '::selection').backgroundColor,
        expectedSelection: getComputedStyle(selection).backgroundColor,
        scrollbar: getComputedStyle(document.documentElement).scrollbarColor,
        expectedScrollbar: `${expected.borderColor} rgba(0, 0, 0, 0)`,
      };
      probe.remove();
      selection.remove();
      return result;
    });
    expect(values.body).toEqual(values.expected);
    expect(values.body[2]).toContain('Geist');
    expect(values.selection).toBe(values.expectedSelection);
    expect(values.scrollbar).toBe(values.expectedScrollbar);
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'auto');
    await page.locator('html').evaluate((html) => html.setAttribute('data-scroll-gutter', 'stable'));
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'stable');
    await page.locator('html').evaluate((html) => html.removeAttribute('data-scroll-gutter'));
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'auto');
    await expectAccessible(page);
  });
}

test('theme changes apply live and a body utility overrides the base layer', async ({ page }) => {
  await page.goto(preview('motion-dialog'));
  await expect(page.getByRole('button', { name: 'New project' })).toBeVisible();
  const before = await page
    .locator('body')
    .evaluate((body) => [getComputedStyle(body).backgroundColor, getComputedStyle(body).color]);
  await page.locator('html').evaluate((html) => {
    html.className = 'high_contrast';
  });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect(before).not.toEqual(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']);
  await page.locator('body').evaluate((body) => body.classList.add('bg-card'));
  const card = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.className = 'bg-card';
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  await expect(page.locator('body')).toHaveCSS('background-color', card);
  expect(card).not.toBe('rgb(0, 0, 0)');
});

test('root isolation keeps a z-index 9999 child beneath a portalled Popover', async ({ page }) => {
  await page.goto(preview('base-popover'));
  await expect(page.locator('#root')).toHaveCSS('isolation', 'isolate');
  await page.getByRole('button', { name: 'About usage limits' }).click();
  const popup = page.getByRole('dialog');
  await expect(popup).toBeVisible();
  const above = await popup.evaluate((element) => {
    const intruder = document.createElement('div');
    intruder.style.cssText = 'position:fixed;inset:0;z-index:9999';
    document.getElementById('root').append(intruder);
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const result = element.contains(top);
    intruder.remove();
    return result;
  });
  expect(above).toBe(true);
});

const overlays = [
  ['motion-dialog', 'New project', 'dialog'],
  ['base-alert-dialog', 'Delete project', 'alertdialog'],
  ['base-drawer', 'Edit project', 'dialog'],
  ['base-bottom-sheet', 'Invoice details', 'dialog'],
  ['base-command-palette', /^Search or run a command/, 'dialog'],
  ['base-lightbox', 'Open Dashboard overview with sidebar and two panels', 'dialog'],
];

for (const [base, theme] of [
  [true, 'dark'],
  [true, 'light'],
  [true, 'high_contrast'],
  [false, 'dark'],
]) {
  for (const [id, trigger, role] of overlays) {
    test(`${id} backdrop covers the viewport / base=${base} / ${theme}`, async ({ page }) => {
      await page.goto(preview(id, theme));
      const opener = page.getByRole('button', { name: trigger, exact: true });
      await expect(opener).toBeVisible();
      if (!base) {
        await omitBase(page);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(page.locator('body')).toHaveCSS('isolation', 'auto');
        const selection = await page
          .locator('body')
          .evaluate((body) => getComputedStyle(body, '::selection').backgroundColor);
        expect(selection).toBe('rgba(0, 0, 0, 0)');
      }
      await opener.click();
      await expect(page.getByRole(role)).toBeVisible();
      const backdrop = page.locator('[class~="[position:var(--backdrop-position,fixed)]"]');
      await expect(backdrop).toHaveCount(1);
      await expect(backdrop).toHaveCSS('position', 'fixed');
      const box = await backdrop.boundingBox();
      const viewport = page.viewportSize();
      expect(box.x).toBe(0);
      expect(box.y).toBe(0);
      expect(box.width).toBe(viewport.width);
      expect(box.height).toBeGreaterThanOrEqual(viewport.height);
      if (base) await expectAccessible(page);
    });
  }
}
