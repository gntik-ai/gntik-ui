import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function checkAxe(page, section) {
  const violations = await page.evaluate(async (selector) => {
    const example = document.querySelector(selector);
    const input = example.querySelector('[role="combobox"][aria-expanded="true"]');
    const list = input && document.getElementById(input.getAttribute('aria-controls'));
    // Base UI aria-hides the background, including the catalog's unrelated listboxes.
    // Audit the full section when closed; when open, audit the input and its entire
    // portaled popup (including async status), rather than the hidden background.
    const context = input && list ? [input, list.parentElement] : example;
    // eslint-disable-next-line no-undef
    const result = await axe.run(context);
    return result.violations.flatMap((violation) =>
      violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
    );
  }, section);
  expect(violations).toEqual([]);
}

async function controlledList(page, input) {
  await expect(input).toHaveAttribute('aria-controls', /.+/);
  const id = await input.getAttribute('aria-controls');
  // The catalog also contains unrelated, persistent TransferList listboxes.
  const list = page.getByRole('listbox').and(page.locator(`[id="${id}"]`));
  await expect(list).toBeVisible();
  return list;
}

async function expectActiveVisible(input, list, name) {
  const option = list.getByRole('option', { name, exact: true });
  await expect(option).toHaveAttribute('data-highlighted', '');
  await expect(input).toHaveAttribute('aria-activedescendant', await option.getAttribute('id'));
  expect(
    await option.evaluate((element) => {
      const list = element.closest('[role="listbox"]');
      const row = element.getBoundingClientRect();
      const viewport = list.getBoundingClientRect();
      return row.top >= viewport.top - 1 && row.bottom <= viewport.bottom + 1;
    }),
  ).toBe(true);
}

for (const theme of ['dark', '', 'high_contrast']) {
  test(`virtualized options keyboard, layout and a11y --${theme || 'light'}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript((value) => {
      localStorage.setItem('gntik-theme', value);
      localStorage.setItem('gntik-section', 'ui-components');
    }, theme);
    await page.goto('/#ui-components');
    const section = page.locator('#ui-Combobox');
    const input = section.getByRole('combobox', { name: 'Nodes (10,000 options)' });
    await expect(input).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: AXE });
    for (const selector of ['#ui-Combobox', '#ui-MultiSelect', '#ui-TransferList']) {
      await checkAxe(page, selector);
    }
    await input.click();
    const list = await controlledList(page, input);
    expect(await list.getByRole('option').count()).toBeLessThanOrEqual(20);
    expect(await list.evaluate((element) => element.scrollHeight)).toBe(320000);
    await expect(list.getByRole('option').first()).toHaveAttribute('aria-setsize', '10000');
    await input.press('ArrowDown');
    for (let i = 0; i < 50; i++) await input.press('ArrowDown');
    await expectActiveVisible(input, list, 'node-51');
    const endStarted = performance.now();
    await input.press('End');
    await expectActiveVisible(input, list, 'node-10000');
    test.info().annotations.push({
      type: 'End navigation latency',
      description: `${Math.round(performance.now() - endStarted)}ms including browser assertions`,
    });
    await input.fill('node-4242');
    await expect(list.getByRole('option')).toHaveCount(1);
    expect(await list.evaluate((element) => element.scrollTop)).toBe(0);
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(list).toHaveCount(0);
    const trigger = input.locator('..').getByRole('button', { name: 'Show options' });
    await trigger.click();
    const reopenedList = await controlledList(page, input);
    await expect(reopenedList.getByRole('option', { name: 'node-4242', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const selectedVisible = await reopenedList
      .getByRole('option', { name: 'node-4242', exact: true })
      .evaluate((element) => {
        const row = element.getBoundingClientRect();
        const viewport = element.closest('[role="listbox"]').getBoundingClientRect();
        return row.top >= viewport.top - 1 && row.bottom <= viewport.bottom + 1;
      });
    expect(selectedVisible).toBe(true);
    await checkAxe(page, '#ui-Combobox');
    await input.press('Escape');
    await expect(section.getByRole('combobox', { name: 'Nodes (10,000 options)' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    const remote = section.getByRole('combobox', { name: 'Remote nodes (5,000 options)' });
    await remote.click();
    const remoteList = await controlledList(page, remote);
    await expect(remoteList.getByRole('option').first()).toHaveAttribute('aria-setsize', '5000');
    await checkAxe(page, '#ui-Combobox');
    await remote.press('Escape');
    await expect(remote).toHaveAttribute('aria-expanded', 'false');

    const multi = page.locator('#ui-MultiSelect').getByRole('combobox', { name: 'Nodes (5,000 options)' });
    await multi.click();
    const multiList = await controlledList(page, multi);
    expect(await multiList.getByRole('option').count()).toBeLessThanOrEqual(20);
    await checkAxe(page, '#ui-MultiSelect');
    await multi.press('Escape');
    await expect(multi).toHaveAttribute('aria-expanded', 'false');
    await checkAxe(page, '#ui-TransferList');
  });
}
