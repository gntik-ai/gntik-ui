import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const SIDEBAR = '/preview.html?kind=block&id=data-table--sticky-header';
const STACKED = '/preview.html?kind=block&id=data-table--sticky-header-stacked';

const box = async (locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('element has no box');
  return rect;
};

/** Shift+Tab from the first fully visible row to the checkbox above it, which must land below the header. */
async function expectFocusBelowHeader(page, table) {
  const head = table.locator('thead');
  const rows = table.locator('tbody tr');
  const first = await rows.evaluateAll(
    (all, bottom) => {
      return all.findIndex((row) => row.getBoundingClientRect().top >= bottom - 0.5);
    },
    (await box(head)).y + (await box(head)).height,
  );
  expect(first).toBeGreaterThan(0);
  await rows.nth(first).getByRole('checkbox').focus();
  await page.keyboard.press('Shift+Tab');
  const above = rows.nth(first - 1);
  await expect(above.getByRole('checkbox')).toBeFocused();
  await expect
    .poll(async () => {
      const headBox = await box(head);
      return (await box(above)).y - (headBox.y + headBox.height);
    })
    .toBeGreaterThanOrEqual(-1);
}

test('page mode pins the header under the topbar and keeps focus below it', async ({ page }) => {
  await page.goto(`${SIDEBAR}&theme=dark`);
  const main = page.getByRole('main', { name: 'Run history' });
  const table = page.getByRole('table', { name: 'Runs' });
  await expect(table.locator('xpath=ancestor::*[@data-sticky-header][1]')).toHaveAttribute(
    'data-sticky-header',
    'page',
  );
  await main.evaluate((el) => {
    el.scrollTop = 800;
  });
  await expect
    .poll(async () => Math.abs((await box(table.locator('thead tr'))).y - (await box(main)).y))
    .toBeLessThan(1);
  const cell = table.getByRole('columnheader').first();
  expect(await cell.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toMatch(/rgba|transparent/);
  await expectFocusBelowHeader(page, table);
});

test('maxHeight bounds the body, pins the header and keeps focus below it', async ({ page }) => {
  await page.goto(`${SIDEBAR}&theme=dark`);
  const region = page.getByRole('region', { name: 'Recent deployments' });
  await expect(region).toHaveAttribute('tabindex', '0');
  const table = region.getByRole('table');
  expect(Math.round((await box(region)).height)).toBeLessThanOrEqual(320);
  await expect(table.locator('tbody tr')).toHaveCount(40);
  await region.evaluate((el) => {
    el.scrollTop = 400;
  });
  await expect
    .poll(async () => Math.abs((await box(table.locator('thead tr'))).y - (await box(region)).y))
    .toBeLessThan(1);
  await expectFocusBelowHeader(page, table);
});

test('stacked layout: header pins 60px down and a wide table scrolls in a bounded region', async ({ page }) => {
  await page.goto(`${STACKED}&theme=dark`);
  const root = page.locator('div.overflow-y-auto').first();
  const table = page.getByRole('table', { name: 'Runs' });
  await root.evaluate((el) => {
    el.scrollTop = 400;
  });
  await expect
    .poll(async () => Math.abs((await box(table.locator('thead tr'))).y - ((await box(root)).y + 60)))
    .toBeLessThan(1);
  expect((await box(page.getByRole('banner'))).y + 60).toBeLessThanOrEqual(
    (await box(table.locator('thead tr'))).y + 1,
  );

  const wide = page.getByRole('region', { name: 'Audit events' });
  await expect(wide.locator('xpath=ancestor::*[@data-sticky-header][1]')).toHaveAttribute(
    'data-sticky-header',
    'bounded',
  );
  await expect(wide).toHaveAttribute('tabindex', '0');
  await root.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect
    .poll(async () => {
      const region = await box(wide);
      const frame = await box(root);
      return frame.y + frame.height - (region.y + region.height);
    })
    .toBeGreaterThanOrEqual(-1);
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const [name, url] of [
    ['sidebar layout and maxHeight', SIDEBAR],
    ['stacked layout', STACKED],
  ]) {
    test(`sticky header examples (${name}) are accessible in ${theme}`, async ({ page }) => {
      await page.goto(`${url}&theme=${theme}`);
      await expect(page.getByRole('table').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.body, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    });
  }
}
