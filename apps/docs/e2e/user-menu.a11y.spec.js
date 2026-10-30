import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`sidebar account trigger layout and axe, closed and open --${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components/user-menu');
    const component = page.locator('#ui-UserMenu');
    const trigger = component.getByRole('button', { name: 'Account menu for Ana López' });
    await expect(trigger).toBeVisible();
    await trigger.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const layout = await trigger.evaluate((button) => {
      const footer = button.parentElement;
      const sidebar = button.closest('aside');
      const email = button.querySelector('.font-mono');
      const padding = getComputedStyle(footer);
      return {
        sidebarWidth: sidebar.getBoundingClientRect().width,
        buttonWidth: button.getBoundingClientRect().width,
        footerContentWidth: footer.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight),
        sidebarOverflows: sidebar.scrollWidth > sidebar.clientWidth,
        buttonOverflowsVertically: button.scrollHeight > button.clientHeight,
        emailOverflows: email.scrollWidth > email.clientWidth,
        textOverflow: getComputedStyle(email).textOverflow,
      };
    });
    expect(layout.sidebarWidth).toBe(248);
    expect(layout.buttonWidth).toBeCloseTo(layout.footerContentWidth, 0);
    expect(layout.sidebarOverflows).toBe(false);
    expect(layout.buttonOverflowsVertically).toBe(false);
    expect(layout.emailOverflows).toBe(true);
    expect(layout.textOverflow).toBe('ellipsis');

    await page.addScriptTag({ content: AXE });
    const check = async (locator) => {
      const violations = await locator.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
    };
    await check(component);
    // Move the footer to the viewport's bottom edge to exercise collision flipping.
    await trigger.evaluate((button) => button.scrollIntoView({ block: 'end' }));
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('data-side', 'top');
    await check(component);
    await check(menu);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await component.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(trigger).not.toHaveClass(/w-full/);
    await expect(trigger.locator('svg')).toHaveCount(0);
    await expect(trigger).not.toContainText('Ana López');
  });
}
