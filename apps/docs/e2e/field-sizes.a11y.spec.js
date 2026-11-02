import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function openExample(page, theme = 'dark') {
  await page.addInitScript(
    (value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    },
    theme === 'light' ? '' : theme,
  );
  await page.goto('/#ui-components/input');
  const example = page.locator('[data-field-sizes]');
  await expect(example).toBeVisible();
  return example;
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`FieldSizes density metrics, wrapping, keyboard and axe — ${theme}`, async ({ page }) => {
    const example = await openExample(page, theme);
    for (const density of ['comfortable', 'compact']) {
      const scope = example.getByRole('group', {
        name: density === 'comfortable' ? 'Comfortable' : 'Compact',
        exact: true,
      });
      for (const size of ['sm', 'auto', 'md', 'lg']) {
        const row = scope.locator(`[data-field-size="${size}"] [data-field-row]`);
        const expected = size === 'lg' ? 44 : size === 'sm' || (size === 'auto' && density === 'compact') ? 32 : 36;
        const heights = await row.evaluate((element) => {
          const fields = [...element.children].slice(0, 8).map((wrapper, index) => {
            const root = wrapper.firstElementChild;
            if (index === 4) return root.querySelector('[role="group"]');
            if (index === 5 || index === 6) return root.querySelector('input');
            return root;
          });
          fields.push(element.lastElementChild);
          return fields.map((field) => field.getBoundingClientRect().height);
        });
        // Explicit TokenInput sizes retain the legacy 24px input plus padding and borders.
        heights.forEach((height, index) =>
          expect(height).toBe(index === 3 && size === 'md' ? 38 : index === 3 && size === 'sm' ? 34 : expected),
        );
        if (size === 'auto' || size === 'lg') {
          const tokens = row.getByRole('listitem');
          const token = await tokens.boundingBox();
          const field = await tokens.locator('..').locator('..').boundingBox();
          expect(token.y).toBeGreaterThanOrEqual(field.y + 1);
          expect(token.y + token.height).toBeLessThanOrEqual(field.y + field.height - 1);
          expect(token.height).toBe(size === 'lg' ? 28 : density === 'compact' ? 20 : 22);
        }
        if (size === 'lg') {
          const icons = row.locator(
            'svg.lucide-search, svg.lucide-chevron-down, svg.lucide-minus, svg.lucide-plus, svg.lucide-calendar-days, svg.lucide-clock',
          );
          // ComboboxInput remains a separate input-height example with its original icon metrics.
          const widths = await icons.evaluateAll((elements) =>
            elements
              .filter((element) => !element.closest('[data-field-row] > div:nth-child(9)'))
              .map((element) => element.getBoundingClientRect().width),
          );
          expect(widths.length).toBeGreaterThan(8);
          for (const width of widths) expect(width).toBe(17);
        }
        if (size === 'auto') {
          const padding = await row
            .getByRole('textbox', { name: 'Name', exact: true })
            .locator('..')
            .evaluate((element) => getComputedStyle(element).paddingInlineStart);
          expect(padding).toBe(density === 'compact' ? '10px' : '12px');
        }
      }
    }
    const wrapping = example.locator('[data-field-wrapping]');
    const input = wrapping.getByRole('combobox');
    const group = input.locator('..').locator('..');
    const field = await group.boundingBox();
    expect(field.height).toBeGreaterThan(44);
    const removeButtons = wrapping.getByRole('button', { name: /^Remove / });
    const topPositions = [];
    for (let index = 0; index < (await removeButtons.count()); index++) {
      const chip = await removeButtons.nth(index).locator('..').boundingBox();
      expect(chip.height).toBe(28);
      expect(chip.y).toBeGreaterThanOrEqual(field.y + 1);
      expect(chip.y + chip.height).toBeLessThanOrEqual(field.y + field.height - 1);
      topPositions.push(chip.y);
    }
    expect(new Set(topPositions).size).toBe(2);
    await removeButtons.first().focus();
    for (let index = 1; index < (await removeButtons.count()); index++) {
      await page.keyboard.press('Tab');
      await expect(removeButtons.nth(index)).toBeFocused();
    }
    await page.addScriptTag({ content: AXE });
    const violations = await example.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      return (await axe.run(element)).violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}

test('field size leaves listbox rows and calendar days unchanged', async ({ page }) => {
  const example = await openExample(page);
  const scope = example.getByRole('group', { name: 'Comfortable', exact: true });
  const metrics = [];
  for (const size of ['sm', 'md', 'auto', 'lg']) {
    const row = scope.locator(`[data-field-size="${size}"]`);
    await row.getByRole('combobox', { name: 'Member', exact: true }).click();
    const option = page.getByRole('option', { name: 'Owner', exact: true });
    await expect(option).toBeVisible();
    const listbox = await option.evaluate((element) => {
      const style = getComputedStyle(element);
      return [element.getBoundingClientRect().height, style.fontSize, style.padding];
    });
    await page.keyboard.press('Escape');
    await row.getByRole('combobox', { name: 'Date', exact: true }).click();
    const day = page.getByRole('grid').locator('button[data-day]').first();
    await expect(day).toBeVisible();
    const calendar = await day.evaluate((element) => {
      const style = getComputedStyle(element);
      return [element.getBoundingClientRect().height, element.getBoundingClientRect().width, style.fontSize];
    });
    metrics.push({ listbox, calendar });
    await page.keyboard.press('Escape');
  }
  for (const metric of metrics) expect(metric).toEqual(metrics[0]);
});
