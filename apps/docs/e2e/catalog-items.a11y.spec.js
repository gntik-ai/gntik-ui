import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const kit = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url))).items;
const docs = fs
  .readdirSync(new URL('../../../packages/ui/src/', import.meta.url), { recursive: true })
  .filter((p) => p.endsWith('.doc.ts') && !p.startsWith('layouts/'));
for (const theme of ['dark', '', 'high_contrast']) {
  test(`component deep links, history and focus: ${theme || 'light'}`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem('gntik-theme', theme), theme);
    await page.goto('/#ui-components/select');
    await expect(page.getByRole('heading', { name: 'Select', exact: true, level: 1 })).toBeFocused();
    await expect(page).toHaveTitle('Select · Gntik UI');
    await expect(page.locator('header')).toContainText('Library');
    await expect(page.locator('header')).toContainText('Select');
    await expect(page.locator('main section[id^="ui-"]')).toHaveCount(1);
    for (const name of ['Anatomy', 'Props', 'Keyboard', 'Accessibility', 'Styling hooks'])
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    const hooks = page.getByRole('table', { name: 'Select styling hooks' });
    for (const [attribute, part] of [
      ['data-popup-open', 'trigger'],
      ['data-highlighted', 'item'],
      ['data-selected', 'item'],
      ['data-disabled', 'item'],
    ])
      await expect(
        hooks
          .getByRole('row')
          .filter({ hasText: attribute })
          .filter({ has: page.getByRole('cell', { name: part, exact: true }) }),
      ).toHaveCount(1);
    await page.getByRole('link', { name: 'Back to Library' }).click();
    const links = page.locator('main a[href^="#ui-components/"]');
    await expect(links).toHaveCount(docs.length);
    await expect(page.locator('main section[id^="ui-"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Forms', exact: true }).click();
    const filtered = await links.count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(docs.length);
    await page.locator('a[href="#ui-components/select"]').click();
    await expect(page.locator('main h1')).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(/#ui-components$/);
    await page.goForward();
    await expect(page).toHaveURL(/#ui-components\/select$/);
    await page.getByRole('button', { name: 'Compact', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Compact', exact: true })).toBeFocused();
    await page.goto('/#ui-components/unknown');
    await expect(page.getByRole('status')).toHaveText('No component named unknown');
    await expect(links).toHaveCount(docs.length);
    await page.goto('/#ui-components/separator');
    await expect(page.locator('main h1')).toHaveText('Separator');
    await expect(page.getByRole('heading', { name: 'Styling hooks', exact: true })).toHaveCount(0);
  });
}
for (const [section, id] of [
  ['blocks', 'flow-builder'],
  ['templates', 'workflow-builder'],
  ['layouts', 'canvas-layout'],
]) {
  test(`gallery item ${section}/${id}`, async ({ page }) => {
    await page.goto(`/#${section}/${id}`);
    await expect(page.locator('main h1')).toHaveText(kit.find((i) => i.id === id).name);
    await expect(page.locator('main h1')).toBeFocused();
    if (section === 'layouts') {
      await expect(page.getByRole('heading', { name: 'API reference', exact: true })).toBeVisible();
      await expect(page.locator('main iframe')).toHaveCount(1);
      await expect(page.locator('main iframe')).toHaveAttribute('src', /canvas-layout--canvas-layout-flow-editor/);
    } else await expect(page.locator('main article')).toHaveCount(1);
    await page.getByRole('link', { name: 'Back to full gallery' }).click();
    await expect(page).toHaveURL(new RegExp(`#${section}$`));
  });
}
