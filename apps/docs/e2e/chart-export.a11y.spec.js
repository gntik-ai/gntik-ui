import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const CSP = "script-src 'self'; img-src 'self' blob: data:";
const example = (page) => page.locator('[data-chart-export-example]');

async function openMenu(page) {
  await example(page).getByRole('button', { name: 'Export chart', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menu')).toBeVisible();
}

async function download(page, name) {
  await openMenu(page);
  const pending = page.waitForEvent('download');
  await page.getByRole('menuitem', { name, exact: true }).click();
  const result = await pending;
  expect(await result.failure()).toBeNull();
  return { name: result.suggestedFilename(), data: readFileSync(await result.path()) };
}

test('PNG, SVG, CSV and script-free print work under strict CSP and a local theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gntik-theme', 'dark');
    window.chartViolations = [];
    window.chartPrints = [];
    document.addEventListener('securitypolicyviolation', (event) =>
      window.chartViolations.push(event.violatedDirective),
    );
    new MutationObserver(() => {
      for (const frame of document.querySelectorAll('iframe')) {
        if (frame.dataset.printObserved) continue;
        frame.dataset.printObserved = 'true';
        frame.contentDocument.addEventListener('securitypolicyviolation', (event) =>
          window.chartViolations.push(event.violatedDirective),
        );
        // The OS print dialog is the system boundary; inspect what the real helper sends to it.
        frame.contentWindow.print = () => {
          window.chartPrints.push({
            loaded: frame.contentDocument.querySelector('img')?.naturalWidth > 0,
            scripts: frame.contentDocument.querySelectorAll('script, [onload], [onclick]').length,
          });
          frame.contentWindow.dispatchEvent(new Event('afterprint'));
        };
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.route('**/', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': CSP } });
  });
  await page.goto('/#bar-charts');
  const preview = example(page);
  await expect(preview.locator('svg.recharts-surface')).toBeVisible();
  // A real ThemeScope is rendered by the example. Change only its local class, keeping html dark.
  await preview.evaluate((element) => {
    element.classList.remove('dark', 'high_contrast');
    element.classList.add('light');
    element.setAttribute('data-theme-scope', 'light');
  });
  const plot = await preview.locator('svg.recharts-surface').boundingBox();
  const colours = await preview.getByRole('figure').evaluate((figure) => ({
    primary: getComputedStyle(figure).getPropertyValue('--primary').trim(),
    card: getComputedStyle(figure).getPropertyValue('--card').trim(),
    rootCard: getComputedStyle(document.documentElement).getPropertyValue('--card').trim(),
  }));
  expect(colours.card).not.toBe(colours.rootCard);
  const png = await download(page, 'Download PNG');
  expect(png.name).toMatch(/^[a-z0-9-]+\.png$/);
  expect(png.data.readUInt32BE(16)).toBe(Math.round(plot.width * 2));
  expect(png.data.readUInt32BE(20)).toBe(Math.round(plot.height * 2));
  const svg = await download(page, 'Download SVG');
  const xml = svg.data.toString('utf8');
  expect(svg.name).toMatch(/^[a-z0-9-]+\.svg$/);
  expect(xml).not.toContain('var(');
  expect(xml).toContain(`fill="hsl(${colours.primary})"`);
  expect(xml).toMatch(new RegExp(`<rect[^>]*fill="hsl\\(${colours.card.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)"`));
  const csv = await download(page, 'Download CSV');
  expect(csv.name).toMatch(/^[a-z0-9-]+\.csv$/);
  expect(csv.data.toString('utf8')).toContain('month,Value\nJan,120');
  await openMenu(page);
  await page.getByRole('menuitem', { name: 'Print chart', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.chartPrints)).toEqual([{ loaded: true, scripts: 0 }]);
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(await page.evaluate(() => window.chartViolations)).toEqual([]);
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`export Menu is keyboard operable and axe-clean in ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('gntik-theme', value === 'light' ? '' : value), theme);
    await page.goto('/#bar-charts');
    await expect(example(page).getByRole('figure')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(AXE);
    const scan = async () => {
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run([...document.querySelectorAll('[data-chart-export-example], [role="menu"]')], {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => `${v.id}: ${v.help}`);
      });
      expect(violations).toEqual([]);
    };
    await scan();
    await openMenu(page);
    await expect(page.getByRole('menuitem', { name: 'Download PNG', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Download SVG', exact: true })).toBeFocused();
    await scan();
    const pending = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    expect((await pending).suggestedFilename()).toMatch(/\.svg$/);
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(example(page).getByRole('button', { name: 'Export chart', exact: true })).toBeFocused();
  });
}
