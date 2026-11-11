import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { openComponent } from './catalog-items.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function open(page, theme) {
  await page.addInitScript((theme) => {
    localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
    localStorage.setItem('gntik-section', 'ui-components');
  }, theme);
  await page.goto('/#ui-components/toggle-group');
  await openComponent(page, 'ToggleGroup');
  await page.evaluate(() => document.fonts.ready);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`chip filters wrap, retain keyboard navigation and meet AA --${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await open(page, theme);
    const section = page.locator('#ui-ToggleGroup');
    const group = section.getByRole('group', { name: 'Status filters', exact: true });
    await group.evaluate((element) => {
      element.parentElement.style.width = '200px';
    });
    const buttons = group.getByRole('button');
    const layout = await group.evaluate((element) => ({
      rows: new Set([...element.children].map((button) => Math.round(button.getBoundingClientRect().top))).size,
      gap: getComputedStyle(element).gap,
      overflow: element.scrollWidth > element.clientWidth,
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    expect(layout).toEqual({ rows: 2, gap: '6px', overflow: false, pageOverflow: false });
    for (const button of await buttons.all()) {
      const style = await button.evaluate((element) => {
        const css = getComputedStyle(element);
        return { radius: parseFloat(css.borderRadius), border: parseFloat(css.borderTopWidth) };
      });
      expect(style.radius).toBeGreaterThanOrEqual(14);
      expect(style.border).toBe(1);
    }

    await buttons.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(buttons.nth(1)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('End');
    await expect(buttons.nth(2)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(buttons.nth(0)).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Home');
    await expect(buttons.nth(0)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');

    const failed = group.getByRole('button', { name: 'Failed 3' });
    const contrast = await failed.evaluate((element) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const css = getComputedStyle(element);
      // Composite the rendered tint over the preview's real card surface.
      ctx.fillStyle = getComputedStyle(element.closest('[data-component-preview]')).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = css.backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const background = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      ctx.fillStyle = css.color;
      ctx.fillRect(0, 0, 1, 1);
      const foreground = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      const luminance = (rgb) => {
        const linear = rgb.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };
      const a = luminance(foreground);
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);

    await page.addScriptTag({ content: AXE });
    const violations = await section.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}

test('pressed chip checks remain visible in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page, 'dark');
  const failed = page.getByRole('group', { name: 'Status', exact: true }).getByRole('button', { name: 'Failed 3' });
  await expect(failed.locator('svg[aria-hidden="true"]')).toBeVisible();
  const colors = await failed.evaluate((element) => ({
    text: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
    stroke: getComputedStyle(element.querySelector('svg')).stroke,
  }));
  expect(colors.stroke).toBe(colors.text);
  expect(colors.text).not.toBe(colors.background);
});
