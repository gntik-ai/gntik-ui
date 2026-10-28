import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const examples = [
  ['block', 'site-footer'],
  ['block', 'site-footer--centered'],
  ['block', 'site-footer--simple'],
  ['block', 'site-footer--custom'],
  ['block', 'site-footer--empty'],
  ['template', 'landing'],
  ['template', 'pricing'],
  ['template', 'contact'],
];

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const [kind, id] of examples) {
    test(`${id} footer is accessible in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: id === 'site-footer--centered' ? 320 : 375, height: 900 });
      await page.goto(`/preview.html?kind=${kind}&id=${id}&theme=${theme}`);
      const footer = page.getByRole('contentinfo');
      await expect(footer).toHaveCount(1);
      await expect(footer).toBeVisible();
      await expect(footer.locator('footer')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await footer.evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
      expect(await footer.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      if (kind === 'block' && id !== 'site-footer--empty') {
        const group = footer.getByRole('group', { name: id === 'site-footer--custom' ? 'Tema' : 'Theme', exact: true });
        await expect(group).toBeVisible();
        await expect(group.getByRole('button')).toHaveCount(4);
      }
      if (id === 'site-footer--centered') {
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        ).toBe(true);
        const centered = await footer.boundingBox();
        for (const list of await footer.getByRole('list').all()) {
          const box = await list.boundingBox();
          expect(box.x + box.width / 2).toBeCloseTo(centered.x + centered.width / 2, 0);
        }
      }
    });
  }
}

test('simple RTL copyright remains at the start edge above sm', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/preview.html?kind=block&id=site-footer--simple&theme=dark');
  const footer = page.getByRole('contentinfo');
  const copyright = footer.getByText('© Example, Inc.', { exact: true });
  await expect(copyright).toBeVisible();
  const copyrightBox = await copyright.boundingBox();
  const navBox = await footer.getByRole('navigation', { name: 'Footer', exact: true }).boundingBox();
  expect(copyrightBox.x).toBeGreaterThan(navBox.x);
  expect(copyrightBox.y).toBeCloseTo(navBox.y, 0);
});
