// Opens each DialogsProvider example in the live catalog and runs axe over every open dialog, because the dialogs are
// portaled out of <main>: row menu, typed confirm, async failure, alert, prompt validation, stacking and update/close.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`dialogs-provider opened examples --${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/dialogs-provider');
    const component = page.locator('#ui-DialogsProvider');
    await expect(component).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    const check = async (label) => {
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      });
      expect(violations, `axe violations: ${label}`).toEqual([]);
    };

    // Row menu: Cancel returns focus to the menu trigger.
    const trigger = component.getByRole('button', { name: 'Key actions', exact: true });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Revoke key', exact: true }).click();
    const revoke = page.getByRole('alertdialog', { name: 'Revoke API key', exact: true });
    await expect(revoke).toBeVisible();
    await check('row menu confirm');
    await revoke.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(revoke).toHaveCount(0);
    await expect(trigger).toBeFocused();

    // Typed confirmation: disabled for the wrong case, enabled for the exact text.
    await component.getByRole('button', { name: 'Delete database', exact: true }).click();
    const typed = page.getByRole('alertdialog', { name: 'Delete prod-db?', exact: true });
    await expect(typed).toBeVisible();
    await typed.getByRole('textbox', { name: 'Type prod-db to confirm' }).fill('Prod-db');
    await expect(typed.getByRole('button', { name: 'Delete database', exact: true })).toBeDisabled();
    await check('typed confirm, wrong case');
    await typed.getByRole('textbox', { name: 'Type prod-db to confirm' }).fill('prod-db');
    await expect(typed.getByRole('button', { name: 'Delete database', exact: true })).toBeEnabled();
    await typed.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(typed).toHaveCount(0);

    // Async confirm: the first attempt fails and shows the error inline.
    await component.getByRole('button', { name: 'Rotate key', exact: true }).click();
    const rotate = page.getByRole('alertdialog', { name: 'Rotate API key?', exact: true });
    await expect(rotate).toBeVisible();
    await rotate.getByRole('button', { name: 'Rotate', exact: true }).click();
    await expect(rotate.getByRole('button', { name: 'Rotate', exact: true })).toHaveAttribute('aria-busy', 'true');
    await check('async confirm pending');
    await expect(rotate.getByRole('alert')).toContainText('Key in use', { timeout: 5000 });
    await check('async confirm failure');
    await rotate.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(rotate).toHaveCount(0);

    // Alert.
    await component.getByRole('button', { name: 'Save settings', exact: true }).click();
    const notice = page.getByRole('alertdialog', { name: 'Settings saved', exact: true });
    await expect(notice).toBeVisible();
    await check('alert');
    await notice.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(notice).toHaveCount(0);

    // Prompt: an empty value shows the validation message and disables OK.
    await component.getByRole('button', { name: 'Rename environment', exact: true }).click();
    const field = page.getByRole('textbox', { name: 'Name', exact: true });
    await expect(field).toBeVisible();
    await field.fill('');
    await expect(page.getByText('Enter a name.')).toBeVisible();
    await check('prompt validation');
    await field.fill('staging-2');
    await field.press('Enter');
    await expect(field).toHaveCount(0);

    // Custom dialog with a confirm stacked above it.
    await component.getByRole('button', { name: 'Rename project', exact: true }).click();
    const rename = page.getByRole('dialog', { name: 'Rename project', exact: true });
    await expect(rename).toBeVisible();
    await rename.getByRole('textbox', { name: 'Project name' }).fill('support-triage-2');
    await rename.getByRole('button', { name: 'Cancel', exact: true }).click();
    const discard = page.getByRole('alertdialog', { name: 'Discard changes?', exact: true });
    await expect(discard).toBeVisible();
    await check('stacked confirm');
    await page.keyboard.press('Escape');
    await expect(discard).toHaveCount(0);
    await expect(rename).toBeVisible();
    await rename.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(rename).toHaveCount(0);

    // update() / close() / returnFocus.
    await component.getByRole('button', { name: 'Start deployment', exact: true }).click();
    const deploy = page.getByRole('dialog', { name: 'Deploying', exact: true });
    await expect(deploy).toBeVisible();
    await check('programmatic dialog');
    await expect(deploy).toContainText('Step 2 of 3', { timeout: 5000 });
    await expect(deploy).toHaveCount(0, { timeout: 5000 });
    await expect(component.getByRole('button', { name: 'Deployment log', exact: true })).toBeFocused();
  });
}
