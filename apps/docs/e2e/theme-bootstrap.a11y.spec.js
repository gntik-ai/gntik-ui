import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { themeScript } from '../../../packages/ui/src/theme/theme-script.ts';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
// The docs-only a11y job has no UI dist; UI unit tests verify the published file matches this source.
const bootstrap = themeScript();
const fixture = readFileSync(new URL('./fixtures/theme-bootstrap.html', import.meta.url), 'utf8');
const probe = readFileSync(new URL('./fixtures/theme-probe.js', import.meta.url), 'utf8');
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function serve(page, { stored = null, variant = 'external' } = {}) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy|script-src/i.test(message.text())) errors.push(message.text());
  });
  await page.addInitScript((value) => {
    localStorage.clear();
    if (value !== null) localStorage.setItem('gntik-theme', value);
  }, stored);
  await page.route('**/theme-fixture/**', async (route) => {
    const file = new URL(route.request().url()).pathname.split('/').pop();
    if (file === 'index.html') {
      const body = variant === 'external' ? fixture : fixture.replace(
        '<script src="/theme-fixture/theme-bootstrap.js"></script>',
        `<script>${themeScript()}</script>`,
      );
      await route.fulfill({
        contentType: 'text/html',
        headers: variant === 'inline-baseline' ? {} : { 'Content-Security-Policy': "script-src 'self'" },
        body,
      });
    } else if (file === 'styles.css') {
      const assets = new URL('../dist/assets/', import.meta.url);
      const body = readdirSync(assets).filter((name) => name.endsWith('.css'))
        .map((name) => readFileSync(new URL(name, assets), 'utf8')).join('\n');
      await route.fulfill({ contentType: 'text/css', body });
    } else {
      const scripts = { 'theme-bootstrap.js': bootstrap, 'theme-probe.js': probe, 'axe.js': axe };
      if (!(file in scripts)) throw new Error(`Unexpected fixture asset: ${file}`);
      await route.fulfill({ contentType: 'application/javascript', body: scripts[file] });
    }
  });
  await page.goto('/theme-fixture/index.html');
  return errors;
}

async function themeState(page) {
  return page.evaluate(() => ({
    head: window.themeProbe.head,
    body: window.themeProbe.body,
    final: { classes: document.documentElement.className, colorScheme: document.documentElement.style.colorScheme },
    violations: window.themeProbe.violations,
  }));
}

async function scan(page) {
  await page.addScriptTag({ url: '/theme-fixture/axe.js' });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`)).sort();
  });
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`external theme bootstrap before body and paint, CSP and axe --${theme}`, async ({ page, context }) => {
    const errors = await serve(page, { stored: theme });
    const expected = { classes: theme === 'light' ? '' : theme, colorScheme: theme === 'light' ? 'light' : 'dark' };
    expect(await themeState(page)).toEqual({ head: { ...expected, bodyPresent: false, painted: false }, body: expected, final: expected, violations: [] });
    expect(errors).toEqual([]);
    const placement = await page.evaluate(() => {
      const script = document.querySelector('script[src="/theme-fixture/theme-bootstrap.js"]');
      const stylesheet = document.querySelector('link[rel="stylesheet"]');
      return {
        head: script.parentElement === document.head,
        async: script.hasAttribute('async'),
        defer: script.hasAttribute('defer'),
        type: script.getAttribute('type'),
        beforeStyles: Boolean(script.compareDocumentPosition(stylesheet) & Node.DOCUMENT_POSITION_FOLLOWING),
        probeNext: script.nextElementSibling?.getAttribute('data-phase'),
      };
    });
    expect(placement).toEqual({ head: true, async: false, defer: false, type: null, beforeStyles: true, probeNext: 'head' });
    const externalViolations = await scan(page);
    expect(errors).toEqual([]);
    expect((await themeState(page)).violations).toEqual([]);
    const baselinePage = await context.newPage();
    try {
      await serve(baselinePage, { stored: theme, variant: 'inline-baseline' });
      expect(await themeState(baselinePage)).toEqual({ head: { ...expected, bodyPresent: false, painted: false }, body: expected, final: expected, violations: [] });
      const baselineViolations = await scan(baselinePage);
      expect(externalViolations).toEqual(baselineViolations);
      expect(externalViolations).toEqual([]);
    } finally {
      await baselinePage.close();
    }
  });
}

for (const scenario of [
  { name: 'missing preference keeps the dark default', stored: null, contrast: 'more', colorScheme: 'light', classes: 'dark', scheme: 'dark' },
  { name: 'system contrast takes precedence over light', stored: 'system', contrast: 'more', colorScheme: 'light', classes: 'high_contrast', scheme: 'dark' },
  { name: 'system light', stored: 'system', contrast: 'no-preference', colorScheme: 'light', classes: '', scheme: 'light' },
  { name: 'system dark', stored: 'system', contrast: 'no-preference', colorScheme: 'dark', classes: 'dark', scheme: 'dark' },
]) {
  test(`external theme bootstrap ${scenario.name}`, async ({ page }) => {
    await page.emulateMedia({ contrast: scenario.contrast, colorScheme: scenario.colorScheme });
    const errors = await serve(page, { stored: scenario.stored });
    const expected = { classes: scenario.classes, colorScheme: scenario.scheme };
    expect(await themeState(page)).toEqual({ head: { ...expected, bodyPresent: false, painted: false }, body: expected, final: expected, violations: [] });
    expect(errors).toEqual([]);
  });
}

test('strict CSP blocks the inline negative control and leaves html unthemed', async ({ page }) => {
  const errors = await serve(page, { stored: 'high_contrast', variant: 'inline-blocked' });
  const unthemed = { classes: '', colorScheme: '' };
  const state = await themeState(page);
  expect(state.head).toEqual({ ...unthemed, bodyPresent: false, painted: false });
  expect(state.body).toEqual(unthemed);
  expect(state.final).toEqual(unthemed);
  await expect.poll(async () => (await themeState(page)).violations).toContain('script-src-elem:inline');
  expect(errors.length).toBeGreaterThan(0);
});
