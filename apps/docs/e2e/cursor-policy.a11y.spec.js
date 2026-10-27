import { test, expect } from '@playwright/test';
import { openComponent } from './component-route.helpers.js';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`cursor tokens, disabled hover and arrow override / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    await openComponent(page, 'Button');
    const states = page.locator('#ui-Button [data-cursor-policy="tokens"]');
    const enabled = states.getByRole('button', { name: 'Small', exact: true });
    const disabled = states.getByRole('button', { name: 'Disabled', exact: true });
    const loading = states.getByRole('button', { name: 'Saving', exact: true });
    const checkboxes = page.locator('#ui-Checkbox');
    const checkbox = checkboxes.getByRole('checkbox', { name: 'I agree to the terms of service', exact: true });
    const locked = checkboxes.getByRole('checkbox', { name: 'Archived projects (locked)', exact: true });
    const tab = page.locator('#ui-Tabs').getByRole('tab', { name: 'Overview', exact: true }).first();
    const menuTrigger = page.locator('#ui-Menu').getByRole('button', { name: 'Deployment actions', exact: true });

    for (const policy of ['pointer', 'default']) {
      if (policy === 'default') {
        await page.evaluate(() => document.documentElement.style.setProperty('--cursor-interactive', 'default'));
      }
      for (const [folder, control] of [
        ['Button', enabled],
        ['Checkbox', checkbox],
        ['Tabs', tab],
      ]) {
        await openComponent(page, folder);
        await control.hover();
        await expect(control).toHaveCSS('cursor', policy);
      }
      for (const [folder, control] of [
        ['Button', disabled],
        ['Button', loading],
        ['Checkbox', locked],
      ]) {
        await openComponent(page, folder);
        await expect(control).toHaveCSS('cursor', 'not-allowed');
      }
      await openComponent(page, 'Button');
      for (const control of [disabled, loading]) {
        await page.mouse.move(0, 0);
        const background = await control.evaluate((element) => getComputedStyle(element).backgroundColor);
        const color = await control.evaluate((element) => getComputedStyle(element).color);
        await control.hover();
        await expect(control).toHaveCSS('background-color', background);
        await expect(control).toHaveCSS('color', color);
        await expect(control).toHaveCSS('pointer-events', 'auto');
      }
      await loading.focus();
      await expect(loading).toBeFocused();
      await openComponent(page, 'Menu');
      await menuTrigger.click();
      const menuItem = page.getByRole('menuitem', { name: 'View logs', exact: true });
      await menuItem.hover();
      await expect(menuItem).toHaveCSS('cursor', policy);
      await page.keyboard.press('Escape');
    }

    await openComponent(page, 'Button');
    const arrow = page.locator('#ui-Button [data-cursor-policy="arrow"]');
    await expect(arrow.getByRole('button', { name: 'Small', exact: true })).toHaveCSS('cursor', 'default');
    await expect(arrow.getByRole('button', { name: 'Disabled', exact: true })).toHaveCSS('cursor', 'not-allowed');
    await page.addScriptTag({ content: AXE });
    for (const folder of ['Button', 'Checkbox']) {
      await openComponent(page, folder);
      const section = page.locator(`#ui-${folder}`);
      const violations = await section.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element)).violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    }
  });
}
