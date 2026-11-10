import { openComponent } from './catalog-items.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function open(page, theme) {
  await page.addInitScript((theme) => {
    localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
    localStorage.setItem('gntik-section', 'ui-components');
  }, theme);
  await page.goto('/#ui-components/radio-group');
  await page.locator('#ui-RadioGroup').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await openComponent(page, 'RadioGroup');
}

/** Clones the live example group into a sandbox of the given width so the real classes lay it out. */
async function sandbox(page, name, { width, count, dir }) {
  await page.evaluate(
    ({ name, width, count, dir }) => {
      const source = document.querySelector(`#ui-RadioGroup [role="radiogroup"][aria-label="${name}"]`);
      const host = document.createElement('div');
      host.id = 'orientation-sandbox';
      host.style.width = `${width}px`;
      if (dir) host.dir = dir;
      const clone = source.cloneNode(true);
      const items = [...clone.children];
      for (let i = 0; clone.children.length < count; i++) clone.append(items[i % items.length].cloneNode(true));
      for (const [i, radio] of clone.querySelectorAll('[role="radio"]').entries()) radio.id = `sandbox-radio-${i}`;
      host.append(clone);
      document.querySelector('#ui-RadioGroup').prepend(host);
    },
    { name, width, count, dir },
  );
  return page.locator('#orientation-sandbox [role="radiogroup"]');
}

const box = async (locator) => (await locator.boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`radio group inline examples have no axe violations --${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await open(page, theme);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(document.querySelector('#ui-RadioGroup'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}

test('a horizontal plain group puts Monthly and Annual on one row at 600px', async ({ page }) => {
  await open(page, 'dark');
  const group = await sandbox(page, 'Billing cycle', { width: 600, count: 2 });
  await expect(group).toHaveAttribute('data-orientation', 'horizontal');
  const [monthly, annual] = await Promise.all(
    ['Monthly', 'Annual'].map((name) => box(group.getByRole('radio', { name, exact: true }))),
  );
  expect(annual.y).toBe(monthly.y);
  expect(annual.x).toBeGreaterThan(monthly.x + monthly.width - 1);
});

test('five plain options wrap at 240px without horizontal scroll', async ({ page }) => {
  await open(page, 'dark');
  const group = await sandbox(page, 'Billing cycle', { width: 240, count: 5 });
  await page.evaluate(() => {
    for (const label of document.querySelectorAll('#orientation-sandbox label span:last-child')) {
      label.textContent = 'Twelve chars';
    }
  });
  const tops = new Set();
  for (const radio of await group.getByRole('radio').all()) tops.add(Math.round((await box(radio)).y));
  expect(tops.size).toBeGreaterThanOrEqual(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('horizontal cards share equal columns at 720px and stack at 320px', async ({ page }) => {
  await open(page, 'dark');
  const wide = await sandbox(page, 'Log retention', { width: 720, count: 3 });
  const widths = await wide
    .locator(':scope > div')
    .evaluateAll((items) => items.map((i) => i.getBoundingClientRect().width));
  expect(widths).toHaveLength(3);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  const lefts = await wide
    .locator(':scope > div')
    .evaluateAll((items) => items.map((i) => Math.round(i.getBoundingClientRect().x)));
  expect(new Set(lefts).size).toBe(3);
  await page.evaluate(() => document.querySelector('#orientation-sandbox').remove());
  const narrow = await sandbox(page, 'Log retention', { width: 320, count: 3 });
  const narrowLefts = await narrow
    .locator(':scope > div')
    .evaluateAll((items) => items.map((i) => Math.round(i.getBoundingClientRect().x)));
  expect(new Set(narrowLefts).size).toBe(1);
});

test('under rtl the first radio of a horizontal group is the rightmost', async ({ page }) => {
  await open(page, 'dark');
  const group = await sandbox(page, 'Billing cycle', { width: 600, count: 2, dir: 'rtl' });
  const [monthly, annual] = await Promise.all(
    ['Monthly', 'Annual'].map((name) => box(group.getByRole('radio', { name, exact: true }))),
  );
  expect(monthly.x).toBeGreaterThan(annual.x);
});
