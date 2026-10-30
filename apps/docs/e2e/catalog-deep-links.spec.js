import { test, expect } from '@playwright/test';

test('direct component links set title, breadcrumb and heading focus', async ({ page }) => {
  await page.goto('/#ui-components/select');
  await expect(page.getByRole('heading', { level: 1, name: 'Select', exact: true })).toBeFocused();
  await expect(page).toHaveTitle('Select · Gntik UI');
  await expect(page.locator('header').first()).toContainText('Library');
  await expect(page.locator('header').first()).toContainText('Select');
  await expect(page.locator('main #ui-Button')).toHaveCount(0);
  for (const name of ['Anatomy', 'Examples', 'Props', 'Keyboard', 'Accessibility', 'Styling hooks']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
  }
});

test('the filtered index navigates with Back and Forward and names missing ids', async ({ page }) => {
  await page.goto('/#ui-components');
  await expect(page.locator('[data-component-preview]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Forms', exact: true }).click();
  await expect(page.locator('main a[href="#ui-components/button"]')).toHaveCount(0);
  await page.locator('main a[href="#ui-components/select"]').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Select', exact: true })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#ui-components$/);
  await expect(page.locator('main a[href="#ui-components/select"]')).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'Select', exact: true })).toBeFocused();
  await page.goto('/#ui-components/unknown');
  await expect(page.getByRole('status')).toHaveText('No component named unknown');
  await expect(page.locator('main a[href="#ui-components/select"]')).toBeVisible();
});

for (const [section, id, name] of [
  ['blocks', 'flow-builder', 'Flow builder'],
  ['layouts', 'canvas-layout', 'CanvasLayout'],
  ['templates', 'workflow-builder', 'Flow builder'],
]) {
  test(`${section} item routes retain every frame and return to the gallery`, async ({ page }) => {
    await page.goto(`/#${section}/${id}`);
    await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeFocused();
    await expect(page).toHaveTitle(`${name} · Gntik UI`);
    const frames = page.locator('main iframe');
    await expect(frames.first()).toBeVisible();
    for (const src of await frames.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('src')))) {
      expect(src).toContain(`id=${id}`);
    }
    if (section === 'layouts') {
      expect(await frames.count()).toBeGreaterThan(1);
      await expect(page.getByRole('heading', { name: 'API reference', exact: true })).toBeVisible();
    }
    await page.locator(`main a[href="#${section}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${section}$`));
    await page.goto(`/#${section}/missing-item`);
    await expect(page.getByRole('status')).toContainText('missing-item');
  });
}
