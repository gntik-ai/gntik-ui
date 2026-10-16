import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const firstPage = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const secondPage = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
const serverIds = [
  '40',
  '39',
  '38',
  '37',
  '36',
  '35',
  '34',
  '33',
  '32',
  '31',
  '30',
  '29',
  '28',
  '27',
  '26',
  '25',
  '24',
  '23',
  '22',
  '21',
];

async function open(page, block, options = {}) {
  const params = new URLSearchParams({ block, ...options });
  await page.goto(`/block-labels.html?${params}`);
  await expect(page.getByRole('table', { name: 'Items', exact: true })).toBeVisible();
}

async function state(page) {
  return {
    ids: await page
      .getByRole('table')
      .locator('tbody tr')
      .evaluateAll((rows) => rows.map((row) => row.cells[0].textContent)),
    range: await page.locator('p[aria-live="polite"]').innerText(),
    current: await page.locator('[aria-current="page"]').innerText(),
    last: await page
      .getByRole('navigation', { name: 'Items pagination' })
      .getByRole('button', { name: /^Page \d+$/ })
      .last()
      .innerText(),
  };
}

test('client pagination and full-result sorting match the published 0.5.0 baseline', async ({ page }) => {
  const traces = [];
  for (const mode of ['baseline', 'default']) {
    await open(page, 'table-client-pagination', { mode });
    const initial = await state(page);
    expect(initial).toEqual({ ids: firstPage, range: '1–10 of 45', current: '1', last: '5' });
    await page.getByRole('button', { name: 'Next page' }).click();
    const next = await state(page);
    expect(next).toEqual({ ids: secondPage, range: '11–20 of 45', current: '2', last: '5' });
    await page.getByRole('columnheader', { name: 'Id' }).getByRole('button').click();
    const sorted = await state(page);
    expect(sorted).toEqual({ ids: firstPage, range: '1–10 of 45', current: '1', last: '5' });
    traces.push([initial, next, sorted]);
  }
  expect(traces[1]).toEqual(traces[0]);
});

test('server rows, callbacks, size changes and inert headers stay controlled', async ({ page }) => {
  await open(page, 'table-server-pagination');
  const expected = { ids: serverIds, range: '21–40 of 95', current: '2', last: '5' };
  expect(await state(page)).toEqual(expected);
  expect(await page.evaluate(() => window.callbackCalls)).toEqual([]);
  await page.getByRole('button', { name: 'Next page' }).click();
  expect(await page.evaluate(() => window.callbackCalls)).toEqual([['page', [3]]]);
  await page.getByRole('button', { name: 'Previous page' }).click();
  expect(await page.evaluate(() => window.callbackCalls)).toEqual([
    ['page', [3]],
    ['page', [1]],
  ]);
  expect(await state(page)).toEqual(expected);
  for (const header of await page.getByRole('columnheader').all()) {
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(header.getByRole('button')).toHaveCount(0);
    await expect(header.locator('svg')).toHaveCount(0);
    await header.click();
    await header.press('Enter');
  }
  expect(await state(page)).toEqual(expected);
  await page.getByRole('combobox', { name: 'Rows per page' }).click();
  await page.getByRole('option', { name: '50', exact: true }).click();
  expect(await page.evaluate(() => window.callbackCalls)).toEqual([
    ['page', [3]],
    ['page', [1]],
    ['pageSize', [50]],
    ['page', [1]],
  ]);
  expect(await state(page)).toEqual(expected);
  await page.getByRole('button', { name: 'Consumer page 3' }).click();
  expect(await state(page)).toEqual({
    ids: [
      '60',
      '59',
      '58',
      '57',
      '56',
      '55',
      '54',
      '53',
      '52',
      '51',
      '50',
      '49',
      '48',
      '47',
      '46',
      '45',
      '44',
      '43',
      '42',
      '41',
    ],
    range: '41–60 of 95',
    current: '3',
    last: '5',
  });
});

for (const suppliedPage of [1, 3]) {
  test(`empty server results clamp supplied page ${suppliedPage} without callbacks`, async ({ page }) => {
    await open(page, 'table-server-pagination', {
      variant: 'empty',
      page: String(suppliedPage),
      rowCount: '0',
      pageSize: '20',
    });
    await expect(page.getByText('No results', { exact: true })).toBeVisible();
    await expect(page.locator('p[aria-live="polite"]')).toHaveText('0–0 of 0');
    await expect(page.locator('[aria-current="page"]')).toHaveText('1');
    await expect(page.getByRole('button', { name: /^Page \d+$/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(await page.evaluate(() => window.callbackCalls)).toEqual([]);
  });
}

async function scan(page) {
  const violations = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    return result.violations;
  });
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`server pagination has zero tagged axe violations in ${theme}`, async ({ page }) => {
    await open(page, 'table-server-pagination', { theme, page: '2', pageSize: '20', rowCount: '95' });
    await page.addScriptTag({ content: AXE });
    await scan(page);
    await page.getByRole('button', { name: 'Next page' }).focus();
    await expect(page.getByRole('button', { name: 'Next page' })).toBeFocused();
    await scan(page);
    await page.getByRole('button', { name: 'Consumer page 3' }).click();
    await expect(page.locator('[aria-current="page"]')).toHaveText('3');
    await scan(page);
    for (const boundary of [1, 5]) {
      await page.getByRole('button', { name: `Consumer page ${boundary}` }).click();
      await expect(page.locator('[aria-current="page"]')).toHaveText(String(boundary));
      await expect(page.getByRole('button', { name: boundary === 1 ? 'Previous page' : 'Next page' })).toBeDisabled();
      await expect(page.locator('p[aria-live="polite"]')).toHaveText(boundary === 1 ? '1–20 of 95' : '81–95 of 95');
      expect((await state(page)).ids).toHaveLength(boundary === 1 ? 20 : 15);
      await scan(page);
    }
    expect(await page.evaluate(() => window.callbackCalls)).toEqual([]);
  });
}
