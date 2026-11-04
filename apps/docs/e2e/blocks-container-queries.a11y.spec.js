import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BLOCKS = ['kpi-row', 'resource-card-grid', 'page-header', 'form-section', 'chart-card'];

async function openExample(page, id, theme = 'dark') {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`/preview.html?kind=block&id=${id}--container-panel&theme=${theme}&pad=0`);
  await expect(page.locator('[data-container-example]')).toBeVisible();
}

async function resize(slot, width) {
  await slot.evaluate((element, size) => {
    element.style.width = `${size}px`;
  }, width);
}

async function columns(list, count) {
  await expect
    .poll(() => list.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))
    .toBe(count);
}

// Border measurements include every edge, catching doubled and outer-edge dividers.
async function borders(list) {
  return list.locator(':scope > div').evaluateAll((items) =>
    items.map((item) => {
      const style = getComputedStyle(item);
      return ['Top', 'Right', 'Bottom', 'Left'].map((edge) => parseFloat(style[`border${edge}Width`]));
    }),
  );
}

test('KpiRow measures its own width and strip dividers follow its columns', async ({ page }) => {
  await openExample(page, 'kpi-row');
  const cards = page.locator('[data-container-slot="cards"]');
  const strip = page.locator('[data-container-slot="strip"]');
  for (const [width, count, edges] of [
    [
      320,
      1,
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      640,
      2,
      [
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      960,
      4,
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  ]) {
    await resize(cards, width);
    await resize(strip, width);
    await columns(cards.locator('dl[aria-label="Key metrics"]'), count);
    await columns(strip.locator('dl'), count);
    await expect.poll(() => borders(strip.locator('dl'))).toEqual(edges);
  }
  await columns(page.getByRole('complementary', { name: 'Properties' }).locator('dl'), 1);
});

test('ResourceCardGrid measures its slot and respects the column cap', async ({ page }) => {
  await openExample(page, 'resource-card-grid');
  for (const [cap, counts] of [
    [3, [1, 2, 3]],
    [2, [1, 2, 2]],
    [4, [1, 2, 4]],
  ]) {
    const slot = page.locator(`[data-container-slot="${cap}"]`);
    for (const [index, width] of [320, 640, 960].entries()) {
      await resize(slot, width);
      await columns(slot.getByRole('list', { name: 'Resources' }), counts[index]);
    }
  }
});

async function headerActions(header, folded) {
  await expect(header.getByRole('button', { name: 'New deployment', exact: true })).toBeVisible();
  const more = header.getByRole('button', { name: 'More actions', exact: true });
  if (folded) {
    await expect(more).toBeVisible();
    await expect(header.getByRole('button', { name: 'View logs', exact: true })).toBeHidden();
    await expect(header.getByRole('button', { name: 'Pause', exact: true })).toBeHidden();
    await more.click();
    await expect(header.page().getByRole('menuitem', { name: 'View logs', exact: true })).toBeVisible();
    await expect(header.page().getByRole('menuitem', { name: 'Pause', exact: true })).toBeVisible();
    await header.page().keyboard.press('Escape');
  } else {
    await expect(more).toBeHidden();
    await expect(header.getByRole('button', { name: 'View logs', exact: true })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  }
}

test('PageHeader folds only when its own slot is narrow', async ({ page }) => {
  await openExample(page, 'page-header');
  const slot = page.locator('[data-container-slot]');
  await resize(slot, 360);
  await headerActions(slot, true);
  await resize(slot, 900);
  await headerActions(slot, false);
});

async function formLayout(section, stacked) {
  const title = await section.getByRole('heading', { name: 'General', exact: true }).boundingBox();
  const field = await section.getByLabel('Project name', { exact: true }).boundingBox();
  const description = await section.getByLabel('Description', { exact: true }).boundingBox();
  const root = await section.boundingBox();
  expect(title).not.toBeNull();
  expect(field).not.toBeNull();
  expect(description).not.toBeNull();
  if (stacked) {
    expect(field.y).toBeGreaterThan(title.y + title.height);
    expect(Math.abs(field.x - root.x)).toBeLessThan(1);
    expect(Math.abs(field.width - root.width)).toBeLessThan(1);
    expect(Math.abs(description.width - root.width)).toBeLessThan(1);
  } else {
    expect(field.x).toBeGreaterThan(title.x + title.width);
    expect(description.width).toBeGreaterThan(field.width);
  }
}

test('FormSection stacks its default full-width fields in a narrow slot', async ({ page }) => {
  await openExample(page, 'form-section');
  const slot = page.locator('[data-container-slot]');
  await resize(slot, 400);
  await formLayout(slot.getByRole('region', { name: 'General' }), true);
  await resize(slot, 900);
  await formLayout(slot.getByRole('region', { name: 'General' }), false);
});

async function chartPadding(slot, pixels) {
  const chart = slot.getByRole('figure', { name: 'Infrastructure cost, 7d', exact: true });
  await expect(chart).toBeVisible();
  await expect
    .poll(() =>
      chart.evaluate((element) => {
        // The chart component renders the labelled figure directly inside the block's padding area.
        return parseFloat(getComputedStyle(element.parentElement).paddingLeft);
      }),
    )
    .toBe(pixels);
}

test('ChartCard padding follows its own width', async ({ page }) => {
  await openExample(page, 'chart-card');
  const slot = page.locator('[data-container-slot]');
  await resize(slot, 320);
  await chartPadding(slot, 12);
  await resize(slot, 480);
  await chartPadding(slot, 16);
});

test('default SidebarLayout and Page preserve the standard 1280px frame', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/preview.html?kind=block&id=kpi-row--standard-frame&pad=0');
  const frame = page.locator('[data-standard-frame]');
  await expect(frame).toBeVisible();
  expect((await frame.boundingBox()).width).toBe(980);
  await columns(frame.locator('dl[aria-label="Key metrics"]'), 4);
  const resources = frame.getByRole('list', { name: 'Resources' });
  await columns(resources.nth(0), 3);
  await columns(resources.nth(1), 4);
  await headerActions(frame, false);
  await formLayout(frame.getByRole('region', { name: 'General' }), false);
  await chartPadding(frame, 16);
});

for (const id of BLOCKS) {
  test(`${id} keeps its width as a flex-row item with no basis`, async ({ page }) => {
    await openExample(page, id);
    const slot = page.locator('[data-container-slot]').first();
    await resize(slot, 320);
    const block = slot.locator(':scope > *');
    await expect(block).toBeVisible();
    expect(await slot.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    expect(await block.evaluate((element) => getComputedStyle(element).flexBasis)).toBe('auto');
    const box = await block.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.width).toBeLessThanOrEqual(320);
  });
  for (const theme of ['dark', 'light', 'high_contrast']) {
    test(`${id} container panel accessibility / ${theme}`, async ({ page }) => {
      await openExample(page, id, theme);
      // Also exercise docs iframe widths, where the panel must remain docked.
      await page.setViewportSize({ width: 900, height: 1000 });
      await expect(page.getByRole('complementary', { name: 'Properties' })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await page.locator('[data-container-example]').evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    });
  }
}
