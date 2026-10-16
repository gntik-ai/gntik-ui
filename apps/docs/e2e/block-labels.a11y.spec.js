import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { copy } from '../src/block-labels-copy.js';
import { expectedTable, ranges, results, numericArgs } from './block-labels.expected.js';
import {
  axeViolations,
  closed,
  openedDialog,
  openedPopup,
  settledFocus,
  keyboardAtState,
  surfaces,
  checkCopy,
  formatterCalled,
} from './block-labels.helpers.js';

const themes = ['dark', 'light', 'high_contrast'];
const defaults = {
  rowsPerPage: 'Rows per page',
  rowsPerPageLabel: 'Rows per page',
  previous: 'Previous page',
  next: 'Next page',
  searchLandmark: 'Filters',
  searchLabel: 'Search',
  searchPlaceholder: 'Search by name…',
  savedViewLabel: 'Saved view',
  savedViewPlaceholder: 'Saved views',
  addFilter: 'Add filter',
  activeFilters: 'Active filters',
  filters: 'Filters',
  clearAll: 'Clear all',
  columns: 'Columns',
  visibleColumns: 'Visible columns',
  pinColumns: 'Pin columns',
  pinnedLeft: 'Left',
  pinnedRight: 'Right',
  pinLeft: 'Pin left',
  pinRight: 'Pin right',
  unpinned: 'Unpinned',
  density: 'Row density',
  comfortable: 'Comfortable rows',
  compact: 'Compact rows',
  defaultView: 'Default view',
  defaultViewOption: 'Default view',
  modified: '(modified)',
  views: 'Views',
  saveChanges: 'Save changes',
  saveAs: 'Save as new view…',
  renameView: 'Rename view…',
  deleteView: 'Delete view',
  resetChanges: 'Reset changes',
  saveViewTitle: 'Save view',
  renameViewTitle: 'Rename view',
  viewName: 'View name',
  cancel: 'Cancel',
  saveView: 'Save view',
  rename: 'Rename',
  closeDialog: 'Close',
};

async function load(page, block, mode, theme, variant = 'normal') {
  await page.goto(`/block-labels.html?block=${block}&mode=${mode}&theme=${theme}&variant=${variant}`);
  await expect(page.locator('#root > div')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function translatedCheckpoint(page, block, language, state) {
  await checkCopy(page, expectedTable(block, language, state), language);
  expect(await axeViolations(page)).toEqual([]);
}

// Closed-popup checkpoints use closed() in both phases; menu-to-dialog actions use openedDialog().
async function paginationMatrix(page, l, checkpoint, language) {
  const pageName = (n) => (language ? `${language === 'es' ? 'Ir a' : 'Go to'} ${n}` : `Page ${n}`);
  await checkpoint('initial');
  await page.getByRole('button', { name: l.next, exact: true }).click();
  await checkpoint('next');
  await page.getByRole('button', { name: l.previous, exact: true }).click();
  await checkpoint('previous');
  await page.getByRole('button', { name: pageName(3), exact: true }).click();
  await checkpoint('numbered');
  await page.getByRole('combobox', { name: l.rowsPerPageLabel, exact: true }).click();
  await openedPopup(page, 'listbox');
  await checkpoint('open');
  await page.getByRole('option', { name: '25', exact: true }).click();
  await closed(page, 'listbox');
  await checkpoint('resized');
}

async function filterMatrix(page, l, checkpoint, language) {
  const remove = language ? `${language === 'es' ? 'Quitar' : 'Drop'} Status|Ready` : 'Remove filter Status: Ready';
  await checkpoint('initial');
  await page.getByRole('button', { name: l.addFilter, exact: true }).click();
  await openedPopup(page, 'menu');
  await checkpoint('menu');
  await page.getByRole('menuitemcheckbox', { name: 'Ready', exact: true }).click();
  await page.keyboard.press('Escape');
  await closed(page, 'menu');
  await checkpoint('selected');
  await page.getByRole('button', { name: remove, exact: true }).focus();
  await checkpoint('focused');
  await page.keyboard.press('Delete');
  await checkpoint('removed');
  await page.getByRole('searchbox', { name: l.searchLabel, exact: true }).fill('Alpha');
  await page.getByRole('button', { name: l.clearAll, exact: true }).click();
  await checkpoint('clear');
  await page.getByRole('combobox', { name: l.savedViewLabel, exact: true }).click();
  await openedPopup(page, 'listbox');
  await checkpoint('views');
  await page.getByRole('option', { name: 'Saved', exact: true }).click();
  await closed(page, 'listbox');
  await checkpoint('applied');
}

async function tableMatrix(page, l, checkpoint, language) {
  const select = language ? `${language === 'es' ? 'Elegir' : 'Choose'} Alpha` : 'Select Alpha';
  const resize = language ? `${language === 'es' ? 'Ancho de' : 'Width for'} Name` : 'Resize Name column';
  const views = () =>
    page
      .locator('button[aria-haspopup="menu"]')
      .filter({ hasText: /^(Default view|Original view|Vista original|Saved|Snapshot|Renamed)/ });
  const menu = async () => {
    await views().click();
    await openedPopup(page, 'menu');
  };
  await checkpoint('initial');
  // Constrain the consumer layout while retaining the 1280x900 screenshot viewport.
  // This reaches real overflow detection in both the published and current phases.
  await page.locator('#root > div').evaluate((node) => (node.style.maxWidth = '320px'));
  const region = page.getByRole('region');
  await expect(region).toHaveCount(1);
  expect(await region.evaluate((node) => node.scrollWidth > node.clientWidth + 1)).toBe(true);
  await region.focus();
  await expect(region).toBeFocused();
  await checkpoint('overflow');
  await page.locator('#root > div').evaluate((node) => (node.style.maxWidth = ''));
  await expect(region).toHaveCount(0);
  await page.getByRole('button', { name: l.columns, exact: true }).click();
  await openedPopup(page, 'menu');
  await checkpoint('columns');
  await page.getByRole('menuitemcheckbox', { name: 'Region', exact: true }).click();
  await checkpoint('toggled');
  await page.getByRole('menuitem', { name: 'Name', exact: true }).hover();
  await expect(page.getByRole('menuitemradio', { name: l.pinLeft, exact: true })).toBeVisible();
  await openedPopup(page, 'menu');
  await checkpoint('pin-options');
  await page.getByRole('menuitemradio', { name: l.pinLeft, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('pinned');
  // Open again to collect the pinned suffix and both other pin options.
  await page.getByRole('button', { name: l.columns, exact: true }).click();
  await openedPopup(page, 'menu');
  await page.getByRole('menuitem', { name: `Name${l.pinnedLeft}`, exact: true }).hover();
  await expect(page.getByRole('menuitemradio', { name: l.pinRight, exact: true })).toBeVisible();
  await openedPopup(page, 'menu');
  await checkpoint('left-suffix');
  await page.getByRole('menuitemradio', { name: l.pinRight, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('pinned-right');
  await page.getByRole('button', { name: l.columns, exact: true }).click();
  await openedPopup(page, 'menu');
  await page.getByRole('menuitem', { name: `Name${l.pinnedRight}`, exact: true }).hover();
  await expect(page.getByRole('menuitemradio', { name: l.unpinned, exact: true })).toBeVisible();
  await openedPopup(page, 'menu');
  await checkpoint('right-suffix');
  await page.getByRole('menuitemradio', { name: l.unpinned, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('unpinned');
  await page.getByRole('separator', { name: resize, exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await checkpoint('resized');
  await page.getByRole('button', { name: l.compact, exact: true }).click();
  await checkpoint('compact');
  await page.getByRole('button', { name: l.comfortable, exact: true }).click();
  await checkpoint('comfortable');
  await page.getByRole('checkbox', { name: select, exact: true }).click();
  await checkpoint('selected');
  await menu();
  await checkpoint('views');
  await page.getByRole('menuitemradio', { name: 'Saved', exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('view-selected');
  await menu();
  await page.getByRole('menuitem', { name: l.saveAs, exact: true }).click();
  await openedDialog(page);
  await checkpoint('save-dialog');
  await page.getByRole('button', { name: l.cancel, exact: true }).click();
  await closed(page, 'dialog');
  await checkpoint('save-cancelled');
  await menu();
  await page.getByRole('menuitem', { name: l.saveAs, exact: true }).click();
  await openedDialog(page);
  await page.getByRole('textbox', { name: l.viewName, exact: true }).fill('Snapshot');
  await page.getByRole('button', { name: l.saveView, exact: true }).click();
  await closed(page, 'dialog');
  await checkpoint('saved');
  await menu();
  await page.getByRole('menuitem', { name: l.renameView, exact: true }).click();
  await openedDialog(page);
  await checkpoint('rename-dialog');
  await page.getByRole('button', { name: l.cancel, exact: true }).click();
  await closed(page, 'dialog');
  await checkpoint('rename-cancelled');
  await menu();
  await page.getByRole('menuitem', { name: l.renameView, exact: true }).click();
  await openedDialog(page);
  await page.getByRole('textbox', { name: l.viewName, exact: true }).fill('Renamed');
  await page.getByRole('button', { name: l.rename, exact: true }).click();
  await closed(page, 'dialog');
  await checkpoint('renamed');
  await page.getByRole('button', { name: 'Name', exact: true }).click();
  await menu();
  await checkpoint('dirty-view');
  await page.getByRole('menuitem', { name: l.saveChanges, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('changes-saved');
  await page.getByRole('button', { name: 'Name', exact: true }).click();
  await menu();
  await page.getByRole('menuitem', { name: l.resetChanges, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('reset');
  await menu();
  await page.getByRole('menuitem', { name: l.deleteView, exact: true }).click();
  await closed(page, 'menu');
  await checkpoint('deleted');
}

const matrices = { pagination: paginationMatrix, filter: filterMatrix, table: tableMatrix };

async function assertElements(page, block, language, state) {
  const l = copy[language];
  if (block === 'pagination') {
    await expect(page.getByRole('combobox')).toHaveAccessibleName(l.rowsPerPageLabel);
    await expect(page.getByText(l.rowsPerPage, { exact: true })).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveAccessibleName(
      language === 'es' ? 'Páginas de Items' : 'Pages for Items',
    );
    await expect(page.locator('[aria-live]')).toHaveText(ranges[language][state]);
    await formatterCalled(page, 'rangeSummary', numericArgs[state]);
    await formatterCalled(page, 'paginationNav', ['Items']);
    await formatterCalled(page, 'page', [1]);
  } else if (block === 'filter') {
    await expect(page.getByRole('search')).toHaveAccessibleName(l.searchLandmark);
    await expect(page.getByRole('searchbox')).toHaveAccessibleName(l.searchLabel);
    await expect(page.getByRole('searchbox')).toHaveAttribute('placeholder', l.searchPlaceholder);
    await expect(page.getByRole('combobox')).toHaveAccessibleName(l.savedViewLabel);
    if (state !== 'applied') await expect(page.getByRole('combobox')).toHaveText(l.savedViewPlaceholder);
    await expect(page.getByRole('button', { name: l.addFilter, exact: true })).toBeVisible();
    await expect(page.locator('[aria-live]')).toHaveText(results[language][state]);
    await formatterCalled(page, 'resultCount', ['selected', 'focused', 'applied'].includes(state) ? [11] : [12]);
    if (['selected', 'focused', 'applied'].includes(state)) {
      await expect(page.getByRole('list')).toHaveAccessibleName(l.activeFilters);
      await expect(page.getByText(l.filters, { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: l.clearAll, exact: true })).toBeVisible();
      await formatterCalled(page, 'removeFilter', ['Status', 'Ready']);
    }
  } else {
    if (state !== 'save-dialog' && state !== 'rename-dialog') {
      await expect(page.getByRole('group', { name: l.density, exact: true })).toBeVisible();
      for (const key of ['comfortable', 'compact', 'columns'])
        await expect(page.getByRole('button', { name: l[key], exact: true })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: l.selectAll, exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: l.actions, exact: true })).toBeVisible();
      for (const [key, args] of [
        ['selectRow', ['Alpha']],
        ['rowActions', ['Alpha']],
        ['resizeColumn', ['Name']],
        ['columnWidth', [200]],
      ])
        await formatterCalled(page, key, args);
    }
    if (state === 'columns' || state === 'toggled') {
      for (const key of ['visibleColumns', 'pinColumns'])
        await expect(page.getByText(l[key], { exact: true })).toBeVisible();
    }
    if (state === 'pin-options' || state === 'right-suffix')
      for (const key of ['pinLeft', 'pinRight', 'unpinned'])
        await expect(page.getByRole('menuitemradio', { name: l[key], exact: true })).toBeVisible();
    if (state === 'views' || state === 'dirty-view') {
      await expect(page.getByText(l.views, { exact: true })).toBeVisible();
      await expect(page.getByRole('menuitemradio', { name: l.defaultViewOption, exact: true })).toBeVisible();
      for (const key of ['saveChanges', 'saveAs', 'renameView', 'deleteView', 'resetChanges'])
        await expect(page.getByRole('menuitem', { name: l[key], exact: true })).toBeVisible();
    }
    if (state === 'save-dialog' || state === 'rename-dialog') {
      const rename = state === 'rename-dialog';
      await expect(page.getByRole('dialog')).toHaveAccessibleName(l[rename ? 'renameViewTitle' : 'saveViewTitle']);
      await expect(page.getByRole('textbox')).toHaveAccessibleName(l.viewName);
      for (const key of ['cancel', 'closeDialog', rename ? 'rename' : 'saveView'])
        await expect(page.getByRole('button', { name: l[key], exact: true })).toBeVisible();
    }
    if (state === 'selected') {
      await expect(page.locator('[aria-live]').first()).toHaveText(language === 'es' ? 'Elegidos 1' : 'Chosen 1');
      await formatterCalled(page, 'selectionCount', [1]);
    }
  }
}

for (const theme of themes)
  for (const block of Object.keys(matrices)) {
    for (const language of ['en', 'es'])
      test(`${block} labels matrix ${language} ${theme}`, async ({ page }) => {
        test.setTimeout(300_000);
        await load(page, block, language, theme);
        await matrices[block](
          page,
          copy[language],
          async (state) => {
            await assertElements(page, block, language, state);
            await translatedCheckpoint(page, block, language, state);
          },
          language,
        );
      });

    test(`${block} published 0.5.0 default regression ${theme}`, async ({ page }, testInfo) => {
      test.setTimeout(300_000);
      const baseline = new Map();
      const keyboardStates = new Map();
      const snapshots = [];
      // Parallel repeats must not overwrite or clean up another repeat's baseline.
      const screenshotName = (state) => `issue30-${block}-${theme}-${state}-${testInfo.repeatEachIndex}.png`;
      const keyboard = async () => {
        await page.locator('button, input').first().focus();
        await settledFocus(page, false);
        const trace = [];
        for (let n = 0; n < 12; n++) {
          await page.keyboard.press('Tab');
          trace.push(await settledFocus(page, false));
        }
        return trace;
      };
      try {
        await load(page, block, 'baseline', theme);
        const baselineKeyboard = await keyboard();
        await matrices[block](page, defaults, async (state) => {
          keyboardStates.set(state, await keyboardAtState(page));
          expect(await axeViolations(page)).toEqual([]);
          baseline.set(state, await surfaces(page));
          const name = screenshotName(state);
          const file = testInfo.snapshotPath(name);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          snapshots.push(file);
          await page.screenshot({ path: file, animations: 'disabled' });
        });
        await load(page, block, 'default', theme);
        expect(await keyboard()).toEqual(baselineKeyboard);
        await matrices[block](page, defaults, async (state) => {
          expect(await keyboardAtState(page)).toEqual(keyboardStates.get(state));
          expect(await surfaces(page)).toEqual(baseline.get(state));
          expect(await axeViolations(page)).toEqual([]);
          await expect(page).toHaveScreenshot(screenshotName(state), {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
          });
        });
      } finally {
        // Baselines are generated from the immutable packages for this run; never committed.
        for (const file of snapshots) fs.rmSync(file, { force: true });
      }
    });
  }

for (const theme of themes)
  for (const mode of ['default', 'en', 'es'])
    for (const variant of ['empty', 'loading', 'grouped', 'editing']) {
      test(`table ${variant} ${mode} ${theme}`, async ({ page }) => {
        test.setTimeout(300_000);
        await load(page, 'table', mode, theme, variant);
        const checkpoint = async (state = variant) => {
          if (mode !== 'default') await checkCopy(page, expectedTable('table', mode, state), mode);
          expect(await axeViolations(page)).toEqual([]);
        };
        await checkpoint();
        if (mode !== 'default') {
          if (variant === 'empty')
            for (const key of ['emptyTitle', 'emptyDescription'])
              await expect(page.getByText(copy[mode][key], { exact: true })).toBeVisible();
          if (variant === 'loading') {
            await expect(page.getByRole('status')).toHaveText(mode === 'es' ? 'Cargando Items' : 'Fetching Items');
            await formatterCalled(page, 'loading', ['Items']);
          }
          if (variant === 'grouped') {
            await formatterCalled(page, 'selectGroup', [copy[mode].noGroup]);
            await formatterCalled(page, 'groupRows', [2]);
          }
        }
        if (variant === 'editing') {
          await page.getByRole('button', { name: 'Alpha', exact: true }).click();
          await checkpoint('edit-input');
          const input = page.getByRole('textbox');
          if (mode !== 'default') {
            await expect(input).toHaveAccessibleName(mode === 'es' ? 'Name de Alpha' : 'Name on Alpha');
            await formatterCalled(page, 'editLabel', ['Name', 'Alpha']);
          }
          await input.fill('Edited');
          await page.keyboard.press('Enter');
          if (mode !== 'default') await expect(page.getByRole('alert')).toHaveText(copy[mode].editError);
          await checkpoint('edit-error');
          await page.keyboard.press('Escape');
          await page.locator('[data-row-id="a"] [data-cell-edit-trigger]').last().click();
          const number = page.getByRole('spinbutton');
          for (const [value, key, args, en, es] of [
            ['0', 'minimumValue', [1], 'Minimum 1', 'Mínimo 1'],
            ['11', 'maximumValue', [10], 'Maximum 10', 'Máximo 10'],
          ]) {
            await number.fill(value);
            await page.keyboard.press('Enter');
            if (mode !== 'default') {
              await expect(page.getByRole('alert')).toHaveText(mode === 'es' ? es : en);
              await formatterCalled(page, key, args);
            }
            await checkpoint(key === 'minimumValue' ? 'edit-minimum' : 'edit-maximum');
          }
        }
      });
    }

test('a just-disabled focused button settles on BODY after a later task moves focus', async ({ page }) => {
  await page.setContent('<body tabindex="-1"><main><button>Previous page</button></main></body>');
  await page.getByRole('button').focus();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const button = document.activeElement;
        setTimeout(() => {
          button.disabled = true;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setTimeout(() => document.body.focus(), 0));
          });
          resolve();
        }, 0);
      }),
  );
  expect(await settledFocus(page)).toEqual(['BODY', null, null, 'Previous page', -1]);
});

test('opened popups wait for settled focus outside the popup', async ({ page }) => {
  await page.setContent(
    '<main><button>Saved view</button><div role="listbox" aria-label="Views"><div role="option">Saved</div></div></main>',
  );
  await page.getByRole('button').focus();
  await page.evaluate(() => {
    const trigger = document.activeElement;
    requestAnimationFrame(() => trigger.setAttribute('aria-label', 'Ready'));
  });
  await openedPopup(page, 'listbox');
  expect(await page.evaluate(() => document.activeElement.getAttribute('aria-label'))).toBe('Ready');
  expect(await page.getByRole('listbox').evaluate((node) => node.contains(document.activeElement))).toBe(false);
});

test('keyboard checkpoints wait for frame-delayed focus updates, including restoration', async ({ page }) => {
  await page.setContent('<main id="root"><button aria-label="Before">Probe</button><button>Restore</button></main>');
  await page.getByRole('button', { name: 'Restore' }).focus();
  await page.evaluate(() => {
    const [probe, restore] = document.querySelectorAll('button');
    probe.addEventListener('focus', () => requestAnimationFrame(() => probe.setAttribute('aria-label', 'After')));
    let restores = 0;
    restore.addEventListener('focus', () => {
      if (++restores === 2) requestAnimationFrame(() => restore.setAttribute('aria-label', 'Restored'));
    });
  });
  const trace = await keyboardAtState(page);
  expect(trace[1]).toEqual(['BUTTON', null, 'After', 'Probe', 0]);
  expect(trace.at(-1)).toEqual(['BUTTON', null, 'Restored', 'Restore', 0]);
});

for (const theme of themes)
  for (const selected of [false, true])
    test(`editor error contrast ${selected ? 'selected' : 'plain'} and hovered ${theme}`, async ({ page }) => {
      await load(page, 'table', 'default', theme, 'editing');
      const row = page.locator('[data-row-id="b"]');
      if (selected) {
        await row.getByRole('checkbox').focus();
        await page.keyboard.press('Space');
        await expect(row).toHaveAttribute('data-selected');
      }
      // Keyboard entry starts on an unhovered last row; clicking the input then adds hover.
      await row.locator('[data-cell-edit-trigger]').last().focus();
      await page.keyboard.press('Enter');
      const input = row.getByRole('spinbutton');
      await input.fill('0');
      await page.keyboard.press('Enter');
      const alert = row.getByRole('alert');
      await expect(alert).toHaveText('Enter 1 or more.');
      await expect(input).toHaveAttribute('aria-describedby', await alert.getAttribute('id'));
      expect(await row.evaluate((node) => node.matches(':hover'))).toBe(false);
      expect(await axeViolations(page)).toEqual([]);
      await input.click();
      expect(await row.evaluate((node) => node.matches(':hover'))).toBe(true);
      expect(await axeViolations(page)).toEqual([]);
      // An in-flow alert remains visible below its editor, including in the final row.
      const fieldBox = await input.boundingBox();
      const alertBox = await alert.boundingBox();
      expect(alertBox.y).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height);
      await expect(alert).toBeInViewport();
    });

test('axe reports unnamed textboxes and listboxes', async ({ page }) => {
  await page.setContent(
    '<main><div role="textbox" tabindex="0"></div><div class="bg-popover"><div role="listbox" class="outline-none"><div role="option">Other</div></div></div></main>',
  );
  const violations = await axeViolations(page);
  expect(violations.find((v) => v.id === 'aria-input-field-name')?.nodes.length).toBe(2);
});

test('copy checks reject labels placed on the wrong element', async ({ page }) => {
  await load(page, 'pagination', 'es', 'dark');
  const expected = expectedTable('pagination', 'es', 'initial');
  await checkCopy(page, expected, 'es');
  await page
    .locator('nav li:first-child button')
    .evaluate((node, label) => node.setAttribute('aria-label', label), copy.es.next);
  await page
    .locator('nav li:last-child button')
    .evaluate((node, label) => node.setAttribute('aria-label', label), copy.es.previous);
  // Both strings are allowed in this state; only the element-to-value assertion catches this.
  await expect(checkCopy(page, expected, 'es')).rejects.toThrow(/previous/);
});
