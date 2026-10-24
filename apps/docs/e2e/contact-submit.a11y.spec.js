import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const example of ['failed-send', 'custom-failure']) {
    test(`contact failed submit / ${example} / ${theme}`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      await page.goto(`/preview.html?kind=template&id=contact--${example}&theme=${theme}`);
      const form = page.getByRole('form', { name: 'Contact form' });
      const send = form.getByRole('button', { name: 'Send message' });
      await send.click();

      const alert = form.getByRole('alert');
      await expect(alert).toHaveText(
        example === 'failed-send' ? "We couldn't send your message. Please try again." : 'Contact support',
      );
      await expect(form.getByRole('textbox', { name: /^Name/ })).toHaveValue('Ada Example');
      await expect(form.getByRole('textbox', { name: /Work email/ })).toHaveValue('ada@example.com');
      await expect(form.getByRole('textbox', { name: /Company/ })).toHaveValue('Example Ltd');
      await expect(form.getByRole('combobox', { name: /Topic/ })).toHaveText('Sales and plans');
      await expect(form.getByRole('textbox', { name: /Message/ })).toHaveValue('We would like a demo for 40 seats.');
      await expect(page.getByRole('heading', { name: 'Message sent' })).toHaveCount(0);
      await expect(send).toBeEnabled();
      await expect(send).not.toHaveAttribute('aria-busy', 'true');
      await expect(send).toBeFocused();

      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await form.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element);
        return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
      });
      expect(violations).toEqual([]);

      if (example === 'custom-failure') {
        await send.click();
        await expect(alert).toHaveCount(0);
        await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible();
        await expect(page.getByRole('status')).toBeFocused();
      }
      expect(pageErrors).toEqual([]);
    });
  }
}
