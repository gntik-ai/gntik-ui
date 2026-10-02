// One baseline per catalog entry in the default (dark) theme, plus light and
// high-contrast baselines for a representative subset. Regenerate with
// `pnpm visual:update` after an intended visual change.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('../../../registry.json', import.meta.url), 'utf8'));

const ids = registry.registry.map((item) => item.id);
const THEME_SAMPLE = ['overview', 'foundations', 'app-shell', 'buttons', 'tables', 'form-layouts', 'alerts', 'area-charts'];
// Monaco and the flow canvas draw asynchronously; give them extra time.
const SLOW = { monaco: 4000, reactflow: 1500 };
// Too tall for one full-page image (200+ live examples): snapshot the first viewport;
// the whole page is covered by the axe gate (library.a11y.spec.js).
const VIEWPORT_ONLY = new Set(['ui-components']);

const cases = [
  ...ids.map((id) => ({ id, theme: 'dark' })),
  ...THEME_SAMPLE.flatMap((id) => [{ id, theme: '' }, { id, theme: 'high_contrast' }]),
];

for (const { id, theme } of cases) {
  const name = `${id}--${theme || 'light'}`;
  test(name, async ({ page }) => {
    await page.addInitScript(([t, s]) => {
      localStorage.setItem('gntik-theme', t);
      localStorage.setItem('gntik-section', s);
    }, [theme, id]);
    await page.goto(`/#${id}`);
    await page.locator('main h1').first().waitFor();
    // Let the scroll container grow so the full section lands in one image.
    if (!VIEWPORT_ONLY.has(id)) {
      await page.addStyleTag({ content: '.h-screen{height:auto!important} main{overflow:visible!important}' });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SLOW[id] ?? 600);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: !VIEWPORT_ONLY.has(id) });
  });
}
