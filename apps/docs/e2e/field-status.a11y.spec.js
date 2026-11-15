import { test, expect } from '@playwright/test';
import { openComponent } from './catalog-items.js';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`Field status and async form feedback --${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/field');
    await openComponent(page, 'Field');
    await page.addScriptTag({ content: AXE });
    const check = async (example) => {
      const violations = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element);
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    const field = page.locator('[data-field-status-example]');
    for (const status of ['Warning', 'Validating', 'Success', 'Idle']) {
      await field.getByRole('button', { name: status, exact: true }).click();
      await check(field);
    }
    await openComponent(page, 'FormField');
    const form = page.locator('[data-async-validation-example]');
    await form.getByRole('textbox').fill('taken');
    await form.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(form.getByRole('textbox')).toHaveAccessibleDescription(/That slug is taken\./);
    await expect(form.getByRole('textbox')).toBeFocused();
    await check(form);
    await form.getByRole('textbox').fill('available');
    await expect(form.getByRole('textbox')).toHaveAccessibleDescription(/Slug is available\./);
    await check(form);
    await form.getByRole('textbox').fill('a-long-workspace-slug');
    await expect(form.getByRole('textbox')).toHaveAccessibleDescription(/Close to the plan limit\./);
    await check(form);
  });
}
