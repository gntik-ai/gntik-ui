import { openComponent } from './component-route.helpers.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`form bindings and invite, before and after validation --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'FormField');
    const component = page.locator('#ui-FormField');
    await expect(component).toBeVisible();
    const invite = component.getByRole('form', { name: 'Invite a member' });
    const bindings = component.getByRole('form', { name: 'Control bindings' });
    await expect(invite).toBeVisible();
    await expect(bindings).toBeVisible();
    await page.addScriptTag({ content: AXE });
    const check = async () => {
      const violations = await component.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    await check();
    await invite.getByRole('button', { name: 'Send invitation' }).click();
    await expect(invite.getByText('Choose a role.')).toBeVisible();
    await check();
    await invite.getByRole('combobox', { name: 'Role' }).click();
    await page.getByRole('option', { name: 'Editor', exact: true }).click();
    await expect(invite.getByText('Choose a role.')).toHaveCount(0);
  });
}
