import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`composer slots and submit mode / ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value === 'light' ? '' : value);
      localStorage.setItem('gntik-section', 'chat-components');
    }, theme);
    await page.goto('/#chat-components');
    const composer = page.locator('#chat-ChatComposer');
    await expect(composer.getByRole('button', { name: 'Close Replying to Ana' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    for (const title of ['Chat Composer Quote Reply', 'Chat Composer Mod Enter']) {
      const preview = composer.getByText(title, { exact: true }).locator('..').locator('.rounded-lg').first();
      const violations = await preview.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element)).violations.map((v) => `${v.id}: ${v.help}`);
      });
      expect(violations).toEqual([]);
    }
    const quote = composer.getByRole('button', { name: 'Close Replying to Ana' }).locator('xpath=ancestor::form');
    for (const dir of ['ltr', 'rtl']) {
      await quote.evaluate((element, direction) => {
        element.dir = direction;
      }, dir);
      const chip = await quote.getByText('Assistant', { exact: true }).boundingBox();
      const textbox = await quote.getByRole('textbox').boundingBox();
      expect(chip).not.toBeNull();
      expect(textbox).not.toBeNull();
      if (dir === 'ltr') expect(chip.x + chip.width).toBeLessThanOrEqual(textbox.x);
      else expect(chip.x).toBeGreaterThanOrEqual(textbox.x + textbox.width);
    }
  });
}
