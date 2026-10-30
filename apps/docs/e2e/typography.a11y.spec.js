import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Known values from f31e4d9's Text/Heading variants (16px root), not the new token exports.
const text = {
  display: [46, 47.84, -1.15, 700],
  body: [15, 24.375, 0, 400],
  label: [13, 16.25, 0, 500],
  supporting: [13, 17.875, 0, 400],
  caption: [12, 16.5, 0, 400],
  code: [14.72, 22.08, 0, 400],
};
const heading = {
  display: [46, 47.84, -1.15, 700],
  xl: [30, 37.5, -0.75, 700],
  lg: [24, 33, -0.6, 700],
  md: [20, 27.5, -0.5, 600],
  sm: [17, 23.375, -0.425, 600],
  xs: [15, 20.625, -0.375, 600],
  '2xs': [13, 17.875, 0, 600],
};
async function expectType(locator, expected) {
  await expect(locator).toBeVisible();
  const actual = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      parseFloat(style.fontSize),
      parseFloat(style.lineHeight),
      style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing),
      Number(style.fontWeight),
    ];
  });
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index], 2));
}

for (const theme of ['dark', '', 'high_contrast']) {
  test(`type roles preserve computed output and accessibility --${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/text');
    const example = page.locator('#ui-Text [data-typography-preview]');
    for (const [variant, expected] of Object.entries(text)) {
      await expectType(example.locator(`[data-text-variant="${variant}"]`), expected);
    }
    for (const [size, expected] of Object.entries(heading)) {
      await expectType(example.locator(`[data-heading-size="${size}"]`), expected);
    }
    await expectType(example.locator('[data-typography-case="inherit"]'), [12, 16.5, 0, 700]);
    await expectType(example.locator('[data-typography-case="bold"]'), [17, 23.375, -0.425, 700]);
    await expectType(example.locator('[data-typography-case="tight"]'), [15, 18.75, 0, 400]);
    await expectType(example.locator('[data-typography-case="custom-display"]'), [32, 48, -0.8, 700]);
    await expectType(example.locator('[data-typography-case="custom-label"]'), [12, 15, 0, 500]);
    await expectType(example.locator('[data-typography-case="custom-heading"]'), [16, 22, -0.4, 600]);
    await page.addScriptTag({ content: AXE });
    const violations = await example.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      return (await axe.run(element)).violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });

  test(`sign-in headline preserves computed typography --${theme || 'light'}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=template&id=sign-in&theme=${theme || 'light'}`);
    await expectType(page.getByText('Ship with confidence, not guesswork.', { exact: true }), [32, 48, -0.8, 700]);
  });
}
