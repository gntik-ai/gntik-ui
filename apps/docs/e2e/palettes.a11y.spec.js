// Browser-only cascade and first-paint contracts. Run in PR CI.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { themeScript } from '../../../packages/ui/src/theme/theme-script.ts';

const source = new URL('../../../packages/tokens/src/', import.meta.url);
const css = ['brand.css', 'status.css', 'pairing.css', 'scope.css', 'palettes/navy.css']
  .map((file) => readFileSync(new URL(file, source), 'utf8'))
  .join('\n');
const channels = (locator, token = '--primary') =>
  locator.evaluate((el, token) => getComputedStyle(el).getPropertyValue(token).trim(), token);

async function fixture(page, theme = 'dark', palette = 'green') {
  await page.route('**/palette-fixture', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en" class="${theme}" data-palette="${palette}"><head><title>Palette scope</title><style>${css}</style></head><body><main>
      <div id="sibling">Shared page</div><div id="navy" data-palette="navy">
        <div id="light" class="light">Light scope</div><div id="dark" class="dark">Dark scope</div>
        <div id="green" data-palette="green">Green island<div id="navy-again" data-palette="navy">Navy again</div></div>
      </div></main></body></html>`,
    }),
  );
  await page.goto('/palette-fixture');
}

test('stored palette is applied by the synchronous head script before body or first paint', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('palette-choice', 'navy'));
  await page.route('**/palette-first-paint', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><head><title>First palette paint</title>
      <script>${themeScript('theme-choice', 'light', { paletteStorageKey: 'palette-choice' })}</script>
      <script>window.firstPalette={palette:document.documentElement.dataset.palette,body:!!document.body,painted:performance.getEntriesByType('paint').length>0}</script>
      <style>${css}</style></head><body><main>Saved palette</main></body></html>`,
    }),
  );
  await page.goto('/palette-first-paint');
  expect(await page.evaluate(() => window.firstPalette)).toEqual({ palette: 'navy', body: false, painted: false });
  expect(await channels(page.locator('html'))).toBe('223 54% 23%');
});

test('palette subtrees and alternating theme scopes compose without leaking into siblings', async ({ page }) => {
  await fixture(page);
  expect(await channels(page.locator('#sibling'))).toBe('145 61% 50%');
  expect(await channels(page.locator('#navy'))).toBe('221 90% 78%');
  expect(await channels(page.locator('#light'))).toBe('223 54% 23%');
  expect(await channels(page.locator('#dark'))).toBe('221 90% 78%');
  expect(await channels(page.locator('#green'))).toBe('145 61% 50%');
  expect(await channels(page.locator('#navy-again'))).toBe('221 90% 78%');
  expect(await channels(page.locator('#light'), '--success-text')).toBe('150 60% 24%');
  for (const theme of ['light', 'dark']) {
    await fixture(page, theme, 'navy');
    expect(await channels(page.locator('html'))).toBe(theme === 'light' ? '223 54% 23%' : '221 90% 78%');
  }
});

test('high contrast ignores palette boundaries and green stays identical with or without a palette', async ({
  page,
}) => {
  for (const theme of ['light', 'dark', 'high_contrast']) {
    await fixture(page, theme);
    const snapshot = () =>
      page.locator('html').evaluate((el) => {
        const style = getComputedStyle(el);
        return Object.fromEntries(
          [...style].filter((name) => name.startsWith('--')).map((name) => [name, style.getPropertyValue(name).trim()]),
        );
      });
    const green = await snapshot();
    await page.locator('html').evaluate((el) => el.removeAttribute('data-palette'));
    expect(await snapshot()).toEqual(green);
    if (theme === 'high_contrast') {
      await page.locator('html').evaluate((el) => (el.dataset.palette = 'navy'));
      expect(await snapshot()).toEqual(green);
      const keys = Object.keys(green);
      const nested = await page.locator('#navy').evaluate((el, keys) => {
        const style = getComputedStyle(el);
        return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key).trim()]));
      }, keys);
      expect(nested).toEqual(green);
    }
  }
});

test('ThemeScope copies navy into a light overlay', async ({ page }) => {
  await page.goto('/preview.html?kind=block&id=theme-scope&theme=dark&palette=navy');
  const card = page.locator('[data-scope-example]');
  await expect(card).toBeVisible();
  expect(await channels(card)).toBe('223 54% 23%');
  await card.getByRole('combobox', { name: 'Preview choice' }).click();
  const listbox = page.locator('[data-theme-scope-portal][data-palette="navy"]').getByRole('listbox');
  await expect(listbox).toBeVisible();
  expect(await channels(listbox)).toBe('223 54% 23%');
});
