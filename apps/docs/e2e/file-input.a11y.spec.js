import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const json = { name: 'sa-prod.json', mimeType: 'application/json', buffer: Buffer.alloc(2345, 'x') };

async function pick(page, trigger, files) {
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), trigger.click()]);
  await chooser.setFiles(files);
}

async function submitted(form, key) {
  return form.evaluate((element, key) => {
    const file = new FormData(element).get(key);
    return file instanceof File ? { name: file.name, size: file.size } : null;
  }, key);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`file inputs, native forms and modal triggers --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/file-input');
    const component = page.locator('#ui-FileInput');
    await expect(component).toBeVisible();
    const control = component.getByRole('button', { name: /Service account key/ });
    const form = control.locator('xpath=ancestor::form');
    await pick(page, control, json);
    await expect(control).toHaveAccessibleName(/Service account key.*sa-prod.json/);
    await expect(control).toContainText('2.3 kB');
    expect(await submitted(form, 'credentials')).toEqual({ name: 'sa-prod.json', size: 2345 });

    // Reopening resets only the picker. Both cancel event shapes preserve submitted files.
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), control.click()]);
    expect(await submitted(form, 'credentials')).toEqual({ name: 'sa-prod.json', size: 2345 });
    await chooser.setFiles([]);
    await chooser.element().dispatchEvent('cancel');
    expect(await submitted(form, 'credentials')).toEqual({ name: 'sa-prod.json', size: 2345 });
    await form.getByRole('button', { name: 'Clear file' }).click();
    await expect(control).toBeFocused();
    expect(await submitted(form, 'credentials')).toEqual({ name: '', size: 0 });

    await pick(page, control, json);
    await form.getByRole('button', { name: 'Reset files' }).click();
    await expect(control).toContainText('No file chosen');
    expect(await submitted(form, 'credentials')).toEqual({ name: '', size: 0 });

    // Controlled form reset reassigns the parent's value after the browser clears input.files.
    const certificate = component.getByRole('button', { name: /^Certificate / });
    const certificateForm = certificate.locator('xpath=ancestor::form');
    await pick(page, certificate, { name: 'new.pem', mimeType: '', buffer: Buffer.from('certificate') });
    await certificateForm.getByRole('button', { name: 'Reset files' }).click();
    await expect(certificate).toContainText('new.pem');
    await expect.poll(() => submitted(certificateForm, 'certificate')).toEqual({ name: 'new.pem', size: 11 });

    const defaultCertificate = component.getByRole('button', { name: /^Default certificate / });
    const defaultForm = defaultCertificate.locator('xpath=ancestor::form');
    const resetDefault = defaultForm.getByRole('button', { name: 'Reset files' });
    // Reset must reassign files even when defaultValue (and therefore React state) is unchanged.
    await resetDefault.click();
    await expect(defaultCertificate).toContainText('default.pem');
    await expect.poll(() => submitted(defaultForm, 'defaultCertificate')).toEqual({ name: 'default.pem', size: 11 });
    const replacement = { name: 'replacement.pem', mimeType: '', buffer: Buffer.from('new certificate') };
    await pick(page, defaultCertificate, replacement);
    await resetDefault.click();
    await expect(defaultCertificate).toContainText('default.pem');
    await expect.poll(() => submitted(defaultForm, 'defaultCertificate')).toEqual({ name: 'default.pem', size: 11 });

    // The React onReset handler runs after the control's native listener. Its veto must win.
    await pick(page, defaultCertificate, replacement);
    await component.getByRole('checkbox', { name: 'Keep selection on reset' }).check();
    await resetDefault.click();
    await expect(defaultCertificate).toContainText('replacement.pem');
    expect(await submitted(defaultForm, 'defaultCertificate')).toEqual({ name: 'replacement.pem', size: 15 });

    const workflow = { name: 'flow.yaml', mimeType: '', buffer: Buffer.from('steps: []') };
    await pick(page, component.getByRole('button', { name: 'Import workflow', exact: true }), workflow);
    await expect(component.getByRole('status').filter({ hasText: 'flow.yaml' })).toBeVisible();
    await component.getByRole('button', { name: 'Import in a dialog' }).click();
    const dialog = page.getByRole('dialog');
    await pick(page, dialog.getByRole('button', { name: 'Import workflow', exact: true }), workflow);
    await expect(dialog).toBeVisible();
    await page.addScriptTag({ content: AXE });
    const scan = async (element) => {
      // eslint-disable-next-line no-undef
      const result = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => violation.id);
    };
    expect(await dialog.evaluate(scan)).toEqual([]);
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await component.getByRole('button', { name: 'Import in a popover' }).click();
    const popover = page.getByRole('dialog', { name: 'Import workflow' });
    await pick(page, popover.getByRole('button', { name: 'Import workflow', exact: true }), {
      ...workflow,
      name: 'popover-flow.yaml',
    });
    await expect(popover).toBeVisible();
    await expect(component.getByRole('status').filter({ hasText: 'popover-flow.yaml' })).toBeVisible();
    expect(await popover.evaluate(scan)).toEqual([]);
    await page.keyboard.press('Escape');
    expect(await component.evaluate(scan)).toEqual([]);
  });
}
