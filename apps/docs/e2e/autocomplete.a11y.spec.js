import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function openExample(page, theme) {
  await page.addInitScript(
    (value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    },
    theme === 'light' ? '' : theme,
  );
  await page.goto('/#ui-components/autocomplete');
  await page.locator('#ui-Autocomplete').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // The AutocompleteStates example: found by the invalid field it holds, so the lookup does not depend on its title.
  const example = page
    .locator('#ui-Autocomplete [data-component-preview]')
    .filter({ has: page.getByRole('combobox', { name: 'Invalid', exact: true }) });
  await expect(example).toBeVisible();
  return example;
}

/** The painted border colour of the input group that holds the combobox. */
const borderOf = (box) =>
  box.locator('xpath=ancestor::*[@role="group"][1]').evaluate((group) => getComputedStyle(group).borderTopColor);

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`Autocomplete invalid border differs from the valid one and axe is clean — ${theme}`, async ({ page }) => {
    const example = await openExample(page, theme);
    const valid = await borderOf(example.getByRole('combobox', { name: 'Medium', exact: true }));
    const invalid = await borderOf(example.getByRole('combobox', { name: 'Invalid', exact: true }));
    const invalidField = await borderOf(example.getByRole('combobox', { name: 'Model id', exact: true }));
    expect(invalid).not.toBe(valid);
    expect(invalidField).not.toBe(valid);
    await page.addScriptTag({ content: AXE });
    const violations = await example.evaluate(async (element) => {
      // eslint-disable-next-line no-undef
      return (await axe.run(element)).violations.map((violation) => violation.id);
    });
    expect(violations).toEqual([]);
  });
}
