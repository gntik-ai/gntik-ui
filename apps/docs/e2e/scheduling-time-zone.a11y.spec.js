import { openComponent } from './catalog-items.js';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const block of ['month-calendar', 'week-calendar', 'agenda-list']) {
    test(`${block} display zones --${theme}`, async ({ page }) => {
      await page.goto(`/preview.html?kind=block&id=${block}--time-zone&theme=${theme}`);
      await expect(page.getByText('Times in UTC', { exact: true })).toBeVisible();
      const caption = page.getByText('Times in America/New_York (EDT)', { exact: true });
      await expect(caption).toBeVisible();
      await expect(
        page
          .getByText('Horas en Europe/Madrid (GMT+2)', { exact: true })
          .or(page.getByText('Horas en Europe/Madrid (CEST)', { exact: true })),
      ).toBeVisible();
      await page.setViewportSize({ width: 360, height: 800 });
      expect(await caption.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      await page.addScriptTag({ content: AXE });
      const violations = await page.locator('#root').evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
      });
      expect(violations).toEqual([]);
    });
  }
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`Timestamp and ScheduleInput provider-zone examples --${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('gntik-theme', value === 'light' ? '' : value), theme);
    await page.goto('/#ui-components');
    for (const [component, title] of [
      ['Timestamp', 'Timestamp Time Zone'],
      ['ScheduleInput', 'Schedule Input Time Zone'],
    ]) {
      await openComponent(page, component);
      const section = page.locator(`#ui-${component}`);
      const example = section.getByText(title, { exact: true }).locator('..');
      await example.scrollIntoViewIfNeeded();
      await expect(example).toBeVisible();
      if (component === 'Timestamp') {
        await expect(example.getByText('09:30', { exact: true })).toBeVisible();
        await expect(example.locator('time').first()).toContainText('09:30');
      } else await expect(example.getByRole('list', { name: 'Next runs (UTC)' })).toBeVisible();
      await page.addScriptTag({ content: AXE });
      const violations = await example.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        return (await axe.run(element, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
      });
      expect(violations).toEqual([]);
    }
  });
}
