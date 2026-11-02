import { expect, test } from '@playwright/test';

const preview = '/preview.html?kind=template&id=code-editor--palette-typography&theme=dark';
const mono = '"Courier New", monospace';
const channels = (locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return ['--background', '--primary'].map((key) => style.getPropertyValue(key).trim());
  });

async function ready(page) {
  await page.goto(preview);
  await expect(page.locator('[data-slot="editor"][data-state="ready"]')).toHaveCount(6);
  // One code editor and both diff panes in each of the three groups.
  await expect(page.locator('[data-editors] .view-lines')).toHaveCount(9);
  await expect(page.locator('[data-editors] .view-lines .mtki')).toHaveCount(9);
  await page.evaluate(() => document.fonts.ready);
}

async function editorType(group, family, emphasis) {
  const lines = group.locator('.view-lines');
  await expect(lines).toHaveCount(3);
  for (const line of await lines.all()) await expect(line).toHaveCSS('font-family', family);
  const comments = group.locator('.view-lines .mtki');
  await expect(comments).toHaveCount(3);
  for (const comment of await comments.all()) await expect(comment).toHaveCSS('font-style', emphasis);
}

async function defaultEditors(page, label) {
  const group = page.locator(`[data-editors="${label}"]`);
  for (const line of await group.locator('.view-lines').all()) {
    await expect(line).toHaveCSS('font-family', /Geist Mono/);
  }
  await expect(group.locator('.view-lines .mtki')).toHaveCount(3);
  for (const comment of await group.locator('.view-lines .mtki').all()) {
    await expect(comment).toHaveCSS('font-style', 'italic');
  }
}

async function coloursFollowHtml(page) {
  const card = await page.locator('[data-html-card]').evaluate((element) => getComputedStyle(element).backgroundColor);
  for (const editor of await page.locator('[data-editors] .monaco-editor-background').all()) {
    await expect(editor).toHaveCSS('background-color', card);
  }
}

test('palette typography follows ThemeScope, its Select portal and every emphasis renderer', async ({ page }) => {
  await ready(page);
  const scope = page.locator('[data-typography-scope]');
  await expect(scope).toHaveCSS('font-family', /Inter/);
  await expect(scope.getByText('Scoped emphasis', { exact: true })).toHaveCSS('font-family', /Inter/);
  await expect(scope.getByText('Scoped emphasis', { exact: true })).toHaveCSS('font-style', 'normal');
  await expect(scope.getByText('scoped italic', { exact: true })).toHaveCSS('font-style', 'normal');

  const emphasis = ['// CodeBlock comment', 'null', 'Image: Preview', 'ANSI emphasis'];
  for (const text of emphasis) await expect(scope.getByText(text, { exact: true })).toHaveCSS('font-style', 'normal');
  await expect(scope.getByText('Scope label', { exact: true })).toHaveCSS('text-transform', 'none');

  await scope.getByRole('combobox', { name: 'Typography choice' }).click();
  const portal = page.locator('[data-theme-scope-portal][data-palette="navy"]');
  await expect(portal.getByRole('listbox')).toBeVisible();
  await expect(portal).toHaveCSS('font-family', /Inter/);
  await expect(portal.getByText('Portal emphasis', { exact: true })).toHaveCSS('font-family', /Inter/);
  await expect(portal.getByText('Portal emphasis', { exact: true })).toHaveCSS('font-style', 'normal');
  await expect(portal.getByText('Available choices', { exact: true })).toHaveCSS('text-transform', 'none');
  await page.keyboard.press('Escape');

  // The unavailable-model reason is in its own scoped overlay.
  await scope.getByRole('combobox', { name: 'Typography model' }).click();
  await expect(portal.getByText('Unavailable reason', { exact: true })).toHaveCSS('font-style', 'normal');
  await page.keyboard.press('Escape');

  await editorType(page.locator('[data-editors="scoped"]'), mono, 'normal');
  await defaultEditors(page, 'sibling');
  await defaultEditors(page, 'inner');
  await expect(page.getByText('Nested emphasis', { exact: true })).toHaveCSS('font-style', 'italic');
  await coloursFollowHtml(page);
});

test('html themes keep shared editor colours while nested typography and live palette changes remain local', async ({
  page,
}) => {
  await ready(page);
  const scope = page.locator('[data-typography-scope]');
  const editors = await page.locator('[data-editors="scoped"] .monaco-editor').elementHandles();
  expect(editors).toHaveLength(3);
  for (const theme of ['dark', 'light', 'high_contrast']) {
    await page.getByRole('button', { name: theme, exact: true }).click();
    await expect(page.locator('html')).toHaveClass(new RegExp(theme));
    await editorType(page.locator('[data-editors="scoped"]'), mono, 'normal');
    await defaultEditors(page, 'sibling');
    await defaultEditors(page, 'inner');
    await coloursFollowHtml(page);
    if (theme === 'high_contrast') {
      const shared = await channels(page.locator('html'));
      expect(await channels(scope)).toEqual(shared);
      for (const host of await scope.locator('[data-slot="editor"]').all())
        expect(await channels(host)).toEqual(shared);
      await scope.getByRole('combobox', { name: 'Typography choice' }).click();
      const portal = page.locator('[data-theme-scope-portal][data-palette="navy"]');
      expect(await channels(portal)).toEqual(shared);
      await expect(portal).toHaveCSS('font-family', /Inter/);
      await expect(portal.getByText('Portal emphasis', { exact: true })).toHaveCSS('font-style', 'normal');
      await page.keyboard.press('Escape');
    }
  }
  await page.getByRole('button', { name: 'Switch scope palette', exact: true }).click();
  await expect(scope).toHaveAttribute('data-palette', 'green');
  await defaultEditors(page, 'scoped');
  await defaultEditors(page, 'sibling');
  await defaultEditors(page, 'inner');
  await coloursFollowHtml(page);
  for (const editor of editors) expect(await editor.evaluate((element) => element.isConnected)).toBe(true);
});

for (const palette of ['green', 'navy']) {
  test(`${palette} retains italic emphasis and uppercase labels by default`, async ({ page }) => {
    await ready(page);
    // The preview's toggle removes its opt-in palette override, leaving shipped defaults.
    await page.getByRole('button', { name: 'Custom typography', exact: true }).click();
    const scope = page.locator('[data-typography-scope]');
    if (palette === 'navy') await page.getByRole('button', { name: 'Switch scope palette', exact: true }).click();
    await expect(scope).toHaveAttribute('data-palette', palette);
    for (const text of ['Scoped emphasis', '// CodeBlock comment', 'null', 'Image: Preview', 'ANSI emphasis']) {
      await expect(scope.getByText(text, { exact: true })).toHaveCSS('font-style', 'italic');
    }
    await expect(scope.getByText('Scope label', { exact: true })).toHaveCSS('text-transform', 'uppercase');
    await scope.getByRole('combobox', { name: 'Typography choice' }).click();
    const portal = page.locator(`[data-theme-scope-portal][data-palette="${palette}"]`);
    await expect(portal.getByText('Available choices', { exact: true })).toHaveCSS('text-transform', 'uppercase');
    await expect(portal.getByText('Portal emphasis', { exact: true })).toHaveCSS('font-style', 'italic');
    await page.keyboard.press('Escape');
    await scope.getByRole('combobox', { name: 'Typography model' }).click();
    await expect(portal.getByText('Unavailable reason', { exact: true })).toHaveCSS('font-style', 'italic');
    await page.keyboard.press('Escape');
    await defaultEditors(page, 'scoped');
  });
}
