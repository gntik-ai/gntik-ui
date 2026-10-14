import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { labelFixture } from './fixtures/block-labels';
import { selectListbox79 } from './fixtures/select79-allowlist.mjs';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const themes = ['dark', 'light', 'high_contrast'];
const url = (block, theme, locale, version = 'current') =>
  `/e2e/fixtures/block-labels.html?block=${block}&theme=${theme}&locale=${locale}&version=${version}`;
const prefix = (locale) => (locale === 'es' ? 'ES' : 'EN');

/** A per-element contract: absent attributes are asserted too, never a labels-value membership test. */
async function surface(
  locator,
  {
    text = '',
    name = '',
    label = null,
    description = '',
    ariaDescription = null,
    title = null,
    placeholder = null,
    live = null,
    valueText = null,
  } = {},
) {
  await expect(locator).toHaveCount(1);
  // Container text composes caller/numeric descendants; those are checked at their own elements.
  if (text !== null) await expect(locator).toHaveText(text);
  await expect(locator).toHaveAccessibleName(name);
  await expect(locator).toHaveAccessibleDescription(description);
  for (const [key, value] of Object.entries({
    'aria-label': label,
    'aria-description': ariaDescription,
    title,
    placeholder,
    'aria-live': live,
    'aria-valuetext': valueText,
  })) {
    expect(
      await locator.getAttribute(key),
      `${key} on ${await locator.evaluate((el) => el.outerHTML.slice(0, 140))}`,
    ).toBe(value);
  }
}
const named = (page, role, name) => page.getByRole(role, { name, exact: true });
const labelled = (page, role, name, extra = {}) => surface(named(page, role, name), { name, label: name, ...extra });
const button = (page, text) => surface(named(page, 'button', text), { name: text, text });

async function settled(page, ...roles) {
  for (const role of roles) await expect(page.getByRole(role)).toHaveCount(0);
  // Closing portals MUST unmount, including any aria-hidden popup and its focus guards.
  for (const role of roles) await expect(page.locator(`[role="${role}"]`)).toHaveCount(0);
}

async function axeCheckpoint(page) {
  const { violations, exactSelectTarget } = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    const trigger = document.querySelector('[role="combobox"][aria-expanded="true"]');
    const controlled = trigger && document.getElementById(trigger.getAttribute('aria-controls'));
    const selectList = controlled?.matches('[role="listbox"]')
      ? controlled
      : controlled?.querySelector('[role="listbox"]');
    const violation = result.violations.find((v) => v.id === 'aria-input-field-name');
    const exactSelectTarget =
      violation?.nodes.find(
        (node) => typeof node.target[0] === 'string' && document.querySelector(node.target[0]) === selectList,
      )?.target ?? null;
    return {
      violations: result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => ({ target })) })),
      exactSelectTarget,
    };
  });
  expect(selectListbox79(violations, exactSelectTarget)).toEqual([]);
}

async function collect(page) {
  const strings = await page.locator('body').evaluate((body) =>
    [...body.querySelectorAll('*')]
      .filter((el) => !['SCRIPT', 'STYLE', 'SVG', 'PATH'].includes(el.tagName))
      .map((el) => ({
        tag: el.tagName,
        callerText:
          Boolean(el.closest('#fixture-controls')) ||
          (el.matches('caption') && el.textContent === 'Caller records') ||
          (Boolean(el.closest('[data-column-id]')) && ['Name', 'Region', 'Enabled'].includes(el.textContent)) ||
          (Boolean(el.closest('[data-row-id]')) &&
            ['Alpha', 'Beta', 'Gamma', 'East', 'Inspect'].includes(el.textContent)) ||
          (Boolean(el.closest('[data-group-header]')) && el.textContent === 'East') ||
          (Boolean(el.closest('li')) && ['State:', 'Ready'].includes(el.textContent)) ||
          (Boolean(el.closest('[role="menuitemcheckbox"], [role="option"]')) &&
            ['Ready', 'Busy', 'First'].includes(el.textContent)) ||
          (Boolean(el.closest('[role="menuitemradio"], button')) &&
            ['First', 'Second', 'Renamed'].includes(el.textContent)) ||
          (Boolean(el.closest('[role="menu"]')) && el.textContent === 'State') ||
          (/^\d+$/.test(el.textContent) &&
            Boolean(el.closest('button, [role="option"], [role="combobox"], [data-group-header]'))),
        // Leaf text includes screen-reader-only chrome; caller content stays element-specific.
        text: el.children.length === 0 ? el.textContent : null,
        ariaLabel: el.getAttribute('aria-label'),
        ariaDescription: el.getAttribute('aria-description'),
        title: el.getAttribute('title'),
        placeholder: el.getAttribute('placeholder'),
        live: el.hasAttribute('aria-live') ? el.textContent : null,
        valueText: el.getAttribute('aria-valuetext'),
      }))
      .filter((entry) =>
        Object.values(entry)
          .slice(1)
          .some((value) => value !== null && value !== ''),
      ),
  );
  return {
    strings,
    roles: await page.locator('body').ariaSnapshot(),
    focus: await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.textContent,
      label: document.activeElement?.getAttribute('aria-label'),
    })),
    callbacks: await page.evaluate(() => window.callbackCalls),
  };
}

async function paginationState(page, labels, range, locale) {
  if (!labels) return;
  await surface(page.getByText(labels.rowsPerPage, { exact: true }), { text: labels.rowsPerPage });
  await labelled(page, 'combobox', labels.rowsPerPageLabel, { text: String(range[3] ?? 10) });
  await labelled(page, 'navigation', labels.nav, { text: null });
  await labelled(page, 'button', labels.previous);
  await labelled(page, 'button', labels.next);
  await surface(page.locator('p[aria-live]'), {
    text: `${prefix(locale)}[range:${range.slice(0, 3).join('|')}]`,
    live: 'polite',
  });
  // Worked fixture values: 97 rows show 1–5 and 10; selecting 25 shows 1–4.
  for (const n of range[3] === 25 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 10]) {
    await labelled(page, 'button', `${prefix(locale)}[page:${n}]`, { text: String(n) });
  }
}

async function paginationMatrix(page, check, labels, locale) {
  const l = labels?.pagination;
  const next = l?.next ?? 'Next page';
  const previous = l?.previous ?? 'Previous page';
  const select = l?.rowsPerPageLabel ?? 'Rows per page';
  const state = async (name, range) => {
    await paginationState(page, l, range, locale);
    await check(name);
  };
  await state('initial', [1, 10, 97]);
  await named(page, 'button', next).focus();
  await page.keyboard.press('Enter');
  await state('next', [11, 20, 97]);
  await named(page, 'button', previous).click();
  await state('previous', [1, 10, 97]);
  await named(page, 'button', l ? `${prefix(locale)}[page:3]` : 'Page 3').click();
  await state('page-button', [21, 30, 97]);
  await named(page, 'combobox', select).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  for (const n of [10, 25, 50, 100])
    await surface(named(page, 'option', String(n)), { name: String(n), text: String(n) });
  await check('rows-per-page-open');
  await named(page, 'option', '25').click();
  await settled(page, 'listbox');
  await state('resized', [1, 25, 97, 25]);
}

async function filterState(page, labels, hasFilter, locale, viewSelected) {
  if (!labels) return;
  const l = labels.filters;
  const search = named(page, 'search', l.searchRegion);
  await surface(search, { text: null, name: l.searchRegion, label: l.searchRegion });
  await labelled(page, 'searchbox', l.searchLabel, { placeholder: l.placeholder });
  await labelled(page, 'combobox', l.savedViewLabel, {
    text: viewSelected ? 'First' : l.savedViewPlaceholder,
  });
  await button(page, l.addFilter);
  await surface(page.locator('p[aria-live]'), { text: `${prefix(locale)}[results:1234]`, live: 'polite' });
  if (hasFilter) {
    await surface(page.getByText(l.filtersHeading, { exact: true }), { text: l.filtersHeading });
    const list = named(page, 'list', l.activeFilters);
    await surface(list, { text: null, name: l.activeFilters, label: l.activeFilters });
    await labelled(page, 'button', `${prefix(locale)}[remove:State|Ready]`);
    await button(page, l.clearAll);
  }
}

async function filterMatrix(page, check, labels, locale) {
  const l = labels?.filters;
  const saved = l?.savedViewLabel ?? 'Saved view';
  const add = l?.addFilter ?? 'Add filter';
  const remove = l ? `${prefix(locale)}[remove:State|Ready]` : 'Remove filter State: Ready';
  const state = async (name, active) => {
    await filterState(page, labels, active, locale, name === 'saved-view-selected');
    await check(name);
  };
  await state('initial', false);
  await named(page, 'combobox', saved).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await surface(named(page, 'option', 'First'), { name: 'First', text: 'First' }); // caller view name
  await check('saved-view-open');
  await page.keyboard.press('Escape');
  await settled(page, 'listbox');
  await named(page, 'button', add).click();
  await expect(page.getByRole('menu')).toBeVisible();
  for (const value of ['Ready', 'Busy'])
    await surface(named(page, 'menuitemcheckbox', value), { name: value, text: value }); // caller options
  await check('add-filter-open');
  await named(page, 'menuitemcheckbox', 'Ready').click();
  await page.keyboard.press('Escape');
  await settled(page, 'menu');
  await state('selected', true);
  await named(page, 'button', remove).focus();
  await state('remove-focused', true);
  await page.keyboard.press('Enter');
  await state('removed', false);
  await named(page, 'combobox', saved).click();
  await named(page, 'option', 'First').click();
  await settled(page, 'listbox');
  await state('saved-view-selected', true);
  await named(page, 'button', l?.clearAll ?? 'Clear all').click();
  await state('clear-all', false);
}

async function tableState(page, labels, locale, selected = false) {
  if (!labels) return;
  const l = labels.table;
  await button(page, l.columnMenu.trigger);
  await labelled(page, 'button', l.density.comfortable);
  await labelled(page, 'button', l.density.compact);
  await labelled(page, 'group', l.density.label, { text: null });
  await surface(page.getByText(l.selection.actionsHeading, { exact: true }), { text: l.selection.actionsHeading });
  await surface(page.getByText(l.status.editHint, { exact: true }), { text: l.status.editHint });
  await labelled(page, 'checkbox', l.selection.selectAll);
  for (const row of ['Alpha', 'Beta', 'Gamma']) {
    await labelled(page, 'checkbox', `${prefix(locale)}[row:${row}]`);
    await labelled(page, 'button', `${prefix(locale)}[rowActions:${row}]`);
  }
  for (const [id, text] of [
    ['a', l.status.yes],
    ['b', l.status.no],
    ['c', l.status.yes],
  ]) {
    await surface(page.locator(`[data-row-id="${id}"]`).getByRole('cell', { name: text, exact: true }), {
      name: text,
      text,
    });
  }
  for (const [name, count] of [
    ['East', 2],
    [l.status.noGroup, 1],
  ]) {
    await labelled(page, 'checkbox', `${prefix(locale)}[group:${name}]`);
    await surface(
      named(page, 'button', `${name} ${prefix(locale)}[groupCount:${count}] ${prefix(locale)}[groupRows:${count}]`),
      {
        name: `${name} ${prefix(locale)}[groupCount:${count}] ${prefix(locale)}[groupRows:${count}]`,
        text: `${name} ${prefix(locale)}[groupCount:${count}] ${prefix(locale)}[groupRows:${count}]`,
      },
    );
  }
  const edit = named(page, 'button', 'Alpha'); // caller cell text, with built-in edit description
  await surface(edit, { name: 'Alpha', text: 'Alpha', description: l.status.editHint });
  for (const column of ['Name', 'Region', 'Enabled']) {
    const resizer = named(page, 'separator', `${prefix(locale)}[resize:${column}]`);
    if (await resizer.count())
      await labelled(page, 'separator', `${prefix(locale)}[resize:${column}]`, {
        valueText: `${prefix(locale)}[resizeValue:160]`,
      });
  }
  await labelled(page, 'navigation', l.pagination.nav, { text: '1' });
  await labelled(page, 'combobox', l.pagination.rowsPerPageLabel, { text: '10' });
  await labelled(page, 'button', l.pagination.previous);
  await labelled(page, 'button', l.pagination.next);
  await labelled(page, 'button', `${prefix(locale)}[page:1]`, { text: '1' });
  await surface(page.getByText(l.pagination.rowsPerPage, { exact: true }), { text: l.pagination.rowsPerPage });
  await surface(page.locator('p[aria-live]'), { text: `${prefix(locale)}[range:1|3|3]`, live: 'polite' });
  if (selected)
    await surface(page.locator('span[aria-live]'), { text: `${prefix(locale)}[selected:1]`, live: 'polite' });
}

async function tableMatrix(page, check, labels, locale) {
  const l = labels?.table;
  const columns = l?.columnMenu.trigger ?? 'Columns';
  const defaultView = l?.views.defaultView ?? 'Default view';
  const modified = l?.views.modified ?? '(modified)';
  const views = {
    saveAs: l?.views.saveAs ?? 'Save as new view…',
    rename: l?.views.rename ?? 'Rename view…',
    delete: l?.views.delete ?? 'Delete view',
    reset: l?.views.reset ?? 'Reset changes',
  };
  const state = async (name, selected = false) => {
    await tableState(page, labels, locale, selected);
    if (l) {
      const expectedView =
        name === 'saved'
          ? 'Second'
          : name === 'renamed'
            ? 'Renamed'
            : ['initial', 'reset'].includes(name)
              ? defaultView
              : `${defaultView} ${modified}`;
      await surface(named(page, 'button', expectedView), { name: expectedView, text: expectedView });
    }
    await check(name);
  };
  await state('initial');
  await named(page, 'button', columns).click();
  await expect(page.getByRole('menu')).toBeVisible();
  if (l) {
    await surface(page.getByText(l.columnMenu.visibleColumns, { exact: true }), { text: l.columnMenu.visibleColumns });
    await surface(page.getByText(l.columnMenu.pinColumns, { exact: true }), { text: l.columnMenu.pinColumns });
  }
  await check('columns-open');
  await named(page, 'menuitemcheckbox', 'Region').click();
  await expect(named(page, 'menuitemcheckbox', 'Region')).toHaveAttribute('aria-checked', 'false');
  await check('column-toggled');
  await named(page, 'menuitem', 'Name').focus();
  await page.keyboard.press('ArrowRight');
  await expect(named(page, 'menuitemradio', l?.columnMenu.pinLeft ?? 'Pin left')).toBeVisible();
  if (l)
    for (const name of [l.columnMenu.pinLeft, l.columnMenu.pinRight, l.columnMenu.unpinned])
      await surface(named(page, 'menuitemradio', name), { name, text: name });
  await check('pin-submenu');
  await named(page, 'menuitemradio', l?.columnMenu.pinLeft ?? 'Pin left').click();
  await settled(page, 'menu');
  await state('pinned-left');
  await named(page, 'button', columns).click();
  const leftName = `Name ${l?.columnMenu.left ?? 'Left'}`;
  await surface(named(page, 'menuitem', leftName), { name: leftName, text: leftName });
  await named(page, 'menuitem', leftName).focus();
  await page.keyboard.press('ArrowRight');
  await named(page, 'menuitemradio', l?.columnMenu.pinRight ?? 'Pin right').click();
  await settled(page, 'menu');
  await named(page, 'button', columns).click();
  const rightName = `Name ${l?.columnMenu.right ?? 'Right'}`;
  await surface(named(page, 'menuitem', rightName), { name: rightName, text: rightName });
  await check('pinned-right');
  await page.keyboard.press('Escape');
  await settled(page, 'menu');
  await named(page, 'button', l?.density.compact ?? 'Compact rows').click();
  await expect(named(page, 'button', l?.density.compact ?? 'Compact rows')).toHaveAttribute('aria-pressed', 'true');
  await state('compact');
  await named(page, 'button', l?.density.comfortable ?? 'Comfortable rows').click();
  await state('comfortable');
  const rowSelect = l ? `${prefix(locale)}[row:Alpha]` : 'Select Alpha';
  await named(page, 'checkbox', rowSelect).click();
  await state('rows-selected', true);
  await named(page, 'checkbox', rowSelect).click();
  await named(page, 'button', `${defaultView} ${modified}`).click();
  await expect(page.getByRole('menu')).toBeVisible();
  if (l) {
    await surface(page.getByText(l.views.heading, { exact: true }), { text: l.views.heading });
    for (const text of [l.views.saveChanges, l.views.saveAs, l.views.rename, l.views.delete, l.views.reset])
      await surface(named(page, 'menuitem', text), { name: text, text });
    await surface(named(page, 'menuitemradio', l.views.defaultView), {
      name: l.views.defaultView,
      text: l.views.defaultView,
    });
  }
  await check('views-open');
  await named(page, 'menuitem', views.saveAs).click();
  await settled(page, 'menu');
  const dialog = async (rename) => {
    const title = rename ? (l?.views.renameTitle ?? 'Rename view') : (l?.views.saveTitle ?? 'Save view');
    await expect(named(page, 'dialog', title)).toBeVisible();
    if (l) {
      await surface(named(page, 'heading', title), { name: title, text: title });
      await surface(named(page, 'textbox', l.views.nameLabel), { name: l.views.nameLabel });
      await labelled(page, 'button', l.views.close);
      await button(page, l.views.cancel);
      await button(page, rename ? l.views.renameButton : l.views.saveButton);
    }
  };
  await dialog(false);
  await check('save-as-dialog');
  await named(page, 'textbox', l?.views.nameLabel ?? 'View name').fill('Second');
  await named(page, 'button', l?.views.saveButton ?? 'Save view').click();
  await settled(page, 'dialog');
  await state('saved');
  await named(page, 'button', 'Second').click();
  await named(page, 'menuitem', views.rename).click();
  await settled(page, 'menu');
  await dialog(true);
  await check('rename-dialog');
  await named(page, 'textbox', l?.views.nameLabel ?? 'View name').fill('Renamed');
  await named(page, 'button', l?.views.renameButton ?? 'Rename').click();
  await settled(page, 'dialog');
  await state('renamed');
  await named(page, 'button', 'Renamed').click();
  await named(page, 'menuitem', views.delete).click();
  await settled(page, 'menu'); // #30 amendment: never axe/screenshot while deletion portal is closing
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await state('deleted');
  await named(page, 'button', `${defaultView} ${modified}`).click();
  await named(page, 'menuitem', views.reset).click();
  await settled(page, 'menu');
  await state('reset');
  await named(page, 'button', 'Toggle loading').click();
  if (l) await surface(page.getByRole('status'), { name: '', text: `${prefix(locale)}[loading:Caller records]` });
  await check('loading');
  await named(page, 'button', 'Toggle loading').click();
  await named(page, 'button', 'Toggle empty').click();
  if (l) {
    await surface(named(page, 'heading', l.status.emptyTitle), {
      name: l.status.emptyTitle,
      text: l.status.emptyTitle,
    });
    await surface(page.getByText(l.status.emptyDescription, { exact: true }), { text: l.status.emptyDescription });
  }
  await check('empty');
}

const matrices = { pagination: paginationMatrix, filters: filterMatrix, table: tableMatrix };
// Literal defaults on built-in surfaces; caller headers, fields, options, view names and numeric controls are explicitly excluded.
const englishDefaults = [
  'Rows per page',
  'Rows pagination',
  'Previous page',
  'Next page',
  'Search by name…',
  'Filters',
  'Search',
  'Saved view',
  'Saved views',
  'Add filter',
  'Active filters',
  'Clear all',
  'Default view',
  '(modified)',
  'Views',
  'Save changes',
  'Save as new view…',
  'Rename view…',
  'Delete view',
  'Reset changes',
  'Save view',
  'Rename view',
  'View name',
  'Cancel',
  'Close',
  'Columns',
  'Visible columns',
  'Pin columns',
  'Left',
  'Right',
  'Pin left',
  'Pin right',
  'Unpinned',
  'Row density',
  'Comfortable rows',
  'Compact rows',
  'Select all rows on this page',
  'Actions',
  'Press Enter or F2 to edit.',
  'No group',
  'Yes',
  'No',
  'row',
  'rows',
  'No results',
  'Nothing matches the current filters.',
];

for (const theme of themes)
  for (const [block, matrix] of Object.entries(matrices)) {
    for (const locale of ['en', 'es'])
      test(`${block} full ${locale} labels in ${theme}`, async ({ page }) => {
        await page.goto(url(block, theme, locale));
        await page.addScriptTag({ content: AXE });
        const labels = labelFixture(locale);
        await matrix(
          page,
          async () => {
            await axeCheckpoint(page);
            if (locale === 'es') {
              const { strings } = await collect(page);
              for (const entry of strings)
                for (const [key, value] of Object.entries(entry).slice(1))
                  if (typeof value === 'string' && !(key === 'text' && entry.callerText)) {
                    expect(englishDefaults, `English fallback on ${JSON.stringify(entry)}`).not.toContain(value.trim());
                    expect(value).not.toMatch(
                      /^(?:Page \d+|Resize .+ column|\d+ pixels|Select .+|Actions for .+|Remove filter .+|Loading caller records…|\d+ selected|1,234 results)$/,
                    );
                  }
            }
          },
          labels,
          locale,
        );
        const calls = await page.evaluate(() => window.labelCalls);
        if (block === 'pagination')
          expect(calls).toEqual(
            expect.arrayContaining([
              { key: 'range', args: [1, 10, 97] },
              { key: 'range', args: [21, 30, 97] },
              { key: 'range', args: [1, 25, 97] },
              { key: 'page', args: [3] },
            ]),
          );
        if (block === 'filters')
          expect(calls).toEqual(
            expect.arrayContaining([
              { key: 'results', args: [1234] },
              { key: 'remove', args: ['State', 'Ready'] },
            ]),
          );
        if (block === 'table')
          expect(calls).toEqual(
            expect.arrayContaining([
              { key: 'selected', args: [1] },
              { key: 'resize', args: ['Name'] },
              { key: 'resizeValue', args: [160] },
              { key: 'group', args: [labels.table.status.noGroup] },
              { key: 'loading', args: ['Caller records'] },
            ]),
          );
      });

    test(`${block} defaults match blocks/ui 0.5.0 in ${theme}`, async ({ page }, testInfo) => {
      const expected = new Map();
      for (const version of ['baseline', 'current']) {
        await page.goto(url(block, theme, 'defaults', version));
        await page.addScriptTag({ content: AXE });
        await matrix(
          page,
          async (state) => {
            await axeCheckpoint(page);
            const observed = await collect(page);
            const name = `${block}-${theme}-${state}.png`;
            if (version === 'baseline') {
              expected.set(state, observed);
              const file = testInfo.snapshotPath(name);
              fs.mkdirSync(path.dirname(file), { recursive: true });
              await page.screenshot({ path: file, animations: 'disabled' });
            } else {
              expect(observed, state).toEqual(expected.get(state));
              await expect(page).toHaveScreenshot(name, { maxDiffPixelRatio: 0.01, animations: 'disabled' });
            }
          },
          undefined,
          'defaults',
        );
      }
    });
  }
