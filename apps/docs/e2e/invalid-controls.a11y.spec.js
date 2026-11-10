import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function openExample(page, theme, component) {
  await page.addInitScript(
    (value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    },
    theme === 'light' ? '' : theme,
  );
  await page.goto(`/#ui-components/${component}`);
  const example = page.locator(`[data-${component}-invalid]`);
  await expect(example).toBeVisible();
  return example;
}

async function axe(page, example) {
  await page.addScriptTag({ content: AXE });
  const violations = await example.evaluate(async (element) => {
    const result = await window.axe.run(element, { rules: { region: { enabled: false } } });
    return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }));
  });
  expect(violations).toEqual([]);
}

async function expectInvalidTrigger(page, trigger, borderColor) {
  await expect(trigger).toHaveAttribute('data-invalid');
  await expect(trigger).toHaveCSS('border-color', borderColor);
  await trigger.hover();
  await expect(trigger).toHaveCSS('border-color', borderColor);
  // Move from pointer to keyboard focus and open the popup with the keyboard.
  await trigger.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
  await expect(trigger).toHaveCSS('outline-width', '2px');
  await expect(trigger).toHaveCSS('border-color', borderColor);
  await page.keyboard.press('ArrowDown');
  await expect(trigger).toHaveAttribute('data-popup-open');
  await expect(trigger).toHaveCSS('border-color', borderColor);
  await page.keyboard.press('Escape');
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`invalid Select border and focus survive interaction — ${theme}`, async ({ page }) => {
    const example = await openExample(page, theme, 'select');
    for (const variant of ['outline', 'filled', 'ghost']) {
      const row = example.locator(`[data-invalid-variant="${variant}"]`);
      const trigger = row.getByRole('combobox');
      const inputBorder = await row
        .getByRole('textbox')
        .locator('..')
        .evaluate((el) => getComputedStyle(el).borderColor);
      await expectInvalidTrigger(page, trigger, inputBorder);
    }
    const outlineBorder = await example
      .locator('[data-invalid-variant="outline"]')
      .getByRole('textbox')
      .locator('..')
      .evaluate((el) => getComputedStyle(el).borderColor);
    // Both standalone APIs must retain the same styling as Field-inherited invalidity.
    for (const standalone of [
      example.getByRole('combobox', { name: 'Role', exact: true }).last(),
      example.getByRole('combobox', { name: 'Required region', exact: true }),
    ]) {
      await expect(standalone).toHaveAttribute('aria-invalid', 'true');
      await expectInvalidTrigger(page, standalone, outlineBorder);
    }
    await axe(page, example);
  });

  test(`invite role invalid border clears after a choice — ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/form-field');
    const invite = page.getByRole('form', { name: 'Invite a member' });
    const role = invite.getByRole('combobox', { name: 'Role' });
    const validBorder = await role.evaluate((el) => getComputedStyle(el).borderColor);
    await invite.getByRole('button', { name: 'Send invitation' }).click();
    await expect(invite.getByText('Choose a role.')).toBeVisible();
    await expect(role).toHaveAttribute('aria-invalid', 'true');
    await expect(role).toHaveAttribute('data-invalid');
    const inputBorder = await invite
      .getByRole('textbox', { name: /Full name/ })
      .locator('..')
      .evaluate((el) => getComputedStyle(el).borderColor);
    await expect(role).toHaveCSS('border-color', inputBorder);
    await role.click();
    await page.getByRole('option', { name: 'Editor', exact: true }).click();
    await expect(invite.getByText('Choose a role.')).toHaveCount(0);
    await expect(role).not.toHaveAttribute('aria-invalid');
    await expect(role).not.toHaveAttribute('data-invalid');
    await role.blur();
    await page.mouse.move(0, 0);
    await expect(role).toHaveCSS('border-color', validBorder);
  });

  for (const component of ['combobox', 'switch', 'slider']) {
    test(`invalid ${component} attributes, styles and axe — ${theme}`, async ({ page }) => {
      const example = await openExample(page, theme, component);
      const role = component === 'combobox' ? 'combobox' : component;
      for (const control of await example.getByRole(role).all()) {
        await expect(control).toHaveAttribute('aria-invalid', 'true');
      }
      if (component === 'combobox' || component === 'slider') {
        // Compare against a rendered token border instead of asserting CSS serialization.
        const color = await example.evaluate((el) => {
          const probe = document.createElement('div');
          probe.className = 'border border-destructive/70';
          el.append(probe);
          const result = getComputedStyle(probe).borderColor;
          probe.remove();
          return result;
        });
        const borders =
          component === 'slider' ? example.locator('[data-index]') : example.locator('[data-invalid][class~="border"]');
        expect(await borders.count()).toBeGreaterThan(0);
        for (const border of await borders.all()) await expect(border).toHaveCSS('border-color', color);
      }
      if (component === 'switch') {
        for (const control of await example.getByRole('switch').all()) {
          const contrast = await control.evaluate((el) => {
            // Canvas resolves modern color()/oklab()/color-mix() values to sRGB bytes.
            const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
            const pixels = (color) => {
              context.clearRect(0, 0, 1, 1);
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
              return [...context.getImageData(0, 0, 1, 1).data];
            };
            let background = el.parentElement;
            let bg;
            while (background) {
              bg = pixels(getComputedStyle(background).backgroundColor);
              if (bg[3] === 255) break;
              background = background.parentElement;
            }
            const style = getComputedStyle(el);
            const ringColor = style.getPropertyValue('--tw-ring-color');
            const foreground = pixels(ringColor);
            const alpha = foreground[3] / 255;
            const composite = foreground.slice(0, 3).map((value, i) => value * alpha + bg[i] * (1 - alpha));
            const luminance = (channels) =>
              channels.slice(0, 3).reduce((sum, channel, i) => {
                const value = channel / 255;
                return (
                  sum +
                  [0.2126, 0.7152, 0.0722][i] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
                );
              }, 0);
            const [light, dark] = [luminance(composite), luminance(bg)].sort((a, b) => b - a);
            return { ratio: (light + 0.05) / (dark + 0.05), shadow: style.boxShadow };
          });
          expect(contrast.shadow).not.toBe('none');
          if (theme === 'high_contrast') expect(contrast.ratio).toBeGreaterThanOrEqual(3);
        }
      }
      await axe(page, example);
    });
  }
}
