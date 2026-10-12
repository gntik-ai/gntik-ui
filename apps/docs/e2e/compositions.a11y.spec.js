// Accessibility gate for the compositions: axe (WCAG 2.2 A/AA incl. contrast) on every page
// template in dark, light and high contrast, and on every block and layout example in dark,
// each rendered alone through /preview.html. New violations fail; the baseline only shrinks.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const kit = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url), 'utf8'));
const baselineFile = new URL('./a11y-baseline.json', import.meta.url);
const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

const layoutExamples = kit.items
  .filter((i) => i.kind === 'layout')
  .flatMap((i) => {
    const dir = new URL(`../../../${i.docs.slice(0, i.docs.lastIndexOf('/'))}/examples/`, import.meta.url);
    const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => `${i.id}--${kebab(f.slice(0, -4))}`);
  });

const cases = [
  ...['connecting', 'live-empty', 'live-with-events', 'error', 'stopped'].flatMap((state) =>
    ['dark', 'light', 'high_contrast'].map((theme) => ({ kind: 'template', id: `live-event-stream--${state}`, theme })),
  ),
  ...['dark', 'light', 'high_contrast'].map((theme) => ({
    kind: 'template',
    id: 'settings-profile--read-only',
    theme,
  })),
  ...kit.items
    .filter((i) => i.kind === 'template')
    .flatMap((i) => ['dark', 'light', 'high_contrast'].map((theme) => ({ kind: 'template', id: i.id, theme }))),
  ...['full', 'minimal', 'loading', 'minimal-loading'].flatMap((fixture) =>
    ['dark', 'light', 'high_contrast'].map((theme) => ({ kind: 'template', id: `public-hub--${fixture}`, theme })),
  ),
  ...[
    'runtime-with-transition',
    'runtime-without-transition',
    'realtime-configuration',
    'postgres-table-detail',
  ].flatMap((fixture) =>
    ['dark', 'light', 'high_contrast'].map((theme) => ({
      kind: 'template',
      id: `resource-detail--${fixture}`,
      theme,
    })),
  ),
  ...['dark', 'light', 'high_contrast'].map((theme) => ({ kind: 'block', id: 'status-timeline--empty', theme })),
  ...kit.items.filter((i) => i.kind === 'block').map((i) => ({ kind: 'block', id: i.id, theme: 'dark' })),
  ...['subordinate-list', 'subordinate-list--loading', 'subordinate-list--empty', 'subordinate-list--error'].flatMap(
    (id) =>
      ['dark', 'light', 'high_contrast']
        .filter((theme) => id !== 'subordinate-list' || theme !== 'dark')
        .map((theme) => ({ kind: 'block', id, theme })),
  ),
  ...layoutExamples.map((id) => ({ kind: 'layout', id, theme: 'dark' })),
  ...['truncated-collection-footer', 'truncated-collection-footer--has-more'].flatMap((id) =>
    ['dark', 'light', 'high_contrast']
      .filter((theme) => id !== 'truncated-collection-footer' || theme !== 'dark')
      .map((theme) => ({ kind: 'block', id, theme })),
  ),
  ...['light', 'high_contrast'].map((theme) => ({ kind: 'layout', id: 'status-layout--status-layout-heading', theme })),
  ...['dark', 'light', 'high_contrast'].map((theme) => ({ kind: 'template', id: 'status-404--page-header', theme })),
  ...['stored', 'fresh'].flatMap((variant) =>
    ['dark', 'light', 'high_contrast'].map((theme) => ({
      kind: 'block',
      id: `credential-disclosure-dialog--${variant}`,
      theme,
    })),
  ),
];

for (const { kind, id, theme } of cases) {
  const name = `${kind}:${id}--${theme}`;
  test(name, async ({ page }) => {
    await page.goto(`/preview.html?kind=${kind}&id=${encodeURIComponent(id)}&theme=${theme}`);
    await page.locator('#root > *').first().waitFor();
    if (id.startsWith('truncated-collection-footer')) {
      const hasMore = id.endsWith('--has-more');
      const count = page.getByText(hasMore ? '100+' : '37', { exact: true });
      await expect(count).toBeVisible();
      const footer = count.locator('..').locator('..');
      await expect(page.locator('#records-truncation-note')).toHaveCount(hasMore ? 1 : 0);
      if (hasMore) {
        await expect(page.locator('#records-truncation-note')).toHaveText(
          'Only the first 100 records are shown; more exist.',
        );
      }
      await expect(footer.locator('[aria-hidden], [aria-live], [tabindex]')).toHaveCount(0);
      await expect(footer.locator('button, a, input, select, textarea')).toHaveCount(0);
      await expect(footer.getByRole('navigation')).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
    }
    if (id.startsWith('live-event-stream')) {
      await expect(page.getByRole('heading', { level: 1, name: 'Live event stream' })).toHaveCount(1);
      await expect(page.getByRole('timer')).toHaveCount(0);
      await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
      if (id === 'live-event-stream--connecting') {
        await expect(page.getByRole('region', { name: 'Events' })).toHaveAttribute('aria-busy', 'true');
        await expect(page.getByRole('button', { name: 'Subscribe', exact: true })).toBeDisabled();
      } else {
        await expect(page.getByRole('log', { name: 'Events' })).toHaveAttribute('aria-live', 'off');
      }
      if (id === 'live-event-stream--live-with-events') {
        const rows = page.getByRole('button', { name: /^Inspect event/ });
        await rows.first().focus();
        await page.keyboard.press('Enter');
        const panel = page.getByRole('complementary', { name: 'Event inspector' });
        await expect(panel.getByRole('tree', { name: 'Event payload' })).toContainText('Sample record');
        await expect(panel).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Toggle event inspector' })).toBeFocused();
        await rows.first().click();
        await panel.getByRole('button', { name: 'Pin panel' }).click();
        await rows.nth(1).click();
        await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true');
        await expect(panel.getByRole('tree', { name: 'Event payload' })).toContainText('Updated record');
        await panel.focus();
        await page.keyboard.press('Escape');
        await expect(panel).toBeVisible();
      }
    }
    if (id === 'settings-profile--read-only') {
      const content = page.locator('#settings-content');
      await expect(content.getByRole('textbox')).toHaveCount(0);
      await expect(content.getByRole('combobox')).toHaveCount(0);
      await expect(content.locator('input')).toHaveCount(0);
      await expect(content.getByRole('button')).toHaveCount(0);
      await expect(content.locator('.sticky')).toHaveCount(0);
      await expect(content.locator('dl')).toHaveCount(2);
      await expect(content.getByText('Nothing selected', { exact: true })).toBeVisible();
      await expect(content.getByRole('region', { name: 'Roles' }).getByRole('listitem')).toHaveText([
        'Viewer',
        'Auditor',
      ]);
      const nav = page.getByRole('navigation', { name: 'Settings', exact: true });
      await nav.getByRole('button', { name: /^Profile/ }).focus();
      for (const label of [
        'Security',
        'Notifications',
        'Appearance',
        'Workspace',
        'Members',
        'Billing',
        'API keys',
        'Integrations',
      ]) {
        await page.keyboard.press('Tab');
        await expect(nav.getByRole('button', { name: new RegExp(`^${label}`) })).toBeFocused();
      }
      await page.keyboard.press('Tab');
      await expect(content.getByRole('link', { name: 'Contact support' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect.poll(() => content.evaluate((element) => element.contains(document.activeElement))).toBe(false);
    }
    if (id.startsWith('resource-detail--')) {
      await expect(page.getByRole('tablist', { name: 'Resource sections' }).getByRole('tab')).toHaveCount(1);
      await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tab', { name: 'Activity' })).toHaveCount(0);
      await expect(page.getByRole('tab', { name: 'Settings' })).toHaveCount(0);
      await page.getByRole('heading', { level: 1 }).click();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('tab', { name: 'Overview' })).toBeFocused();
      if (id === 'resource-detail--runtime-with-transition') {
        const history = page.getByRole('list', { name: 'Status history' });
        await expect(history.getByRole('listitem')).toHaveCount(1);
        await expect(history.getByText('Ready', { exact: true })).toBeVisible();
        await expect(history.locator('time')).toHaveCount(1);
        await expect(history).not.toContainText('by ');
      } else if (id === 'resource-detail--runtime-without-transition') {
        await expect(page.getByRole('region', { name: 'Status history' })).toContainText('No status history');
        await expect(page.getByRole('listitem')).toHaveCount(0);
        await expect(page.locator('time')).toHaveCount(0);
      } else {
        await expect(page.getByRole('heading', { name: 'Status history' })).toHaveCount(0);
        await expect(page.getByRole('list', { name: 'Status history' })).toHaveCount(0);
        await expect(page.getByRole('region', { name: 'Status history' })).toHaveCount(0);
      }
    }
    if (id === 'status-timeline--empty') {
      await expect(page.getByRole('region', { name: 'Status history' })).toContainText('No status changes yet');
      await expect(page.getByRole('listitem')).toHaveCount(0);
      await expect(page.locator('time')).toHaveCount(0);
    }
    if (id === 'status-layout--status-layout-heading' || id === 'status-404--page-header') {
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Go to dashboard' })).toBeFocused();
    }
    if (id === 'credential-disclosure-dialog--fresh') {
      await page.getByRole('button', { name: 'Disclose fresh secret' }).click();
    }
    if (id.startsWith('credential-disclosure-dialog')) {
      await expect(page.getByRole('dialog')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect
        .poll(() => page.getByRole('dialog').evaluate((dialog) => dialog.contains(document.activeElement)))
        .toBe(true);
    }
    await page.waitForTimeout(kind === 'template' ? 900 : 500);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id} :: ${n.target.join(' ')}`));
    });
    const known = new Set(baseline[name] ?? []);
    const fresh = violations.filter((v) => !known.has(v));
    if (process.env.A11Y_UPDATE) {
      if (violations.length) baseline[name] = [...new Set(violations)].sort();
      else delete baseline[name];
      fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
    }
    expect(fresh, `new axe violations in ${name}`).toEqual([]);
  });
}
