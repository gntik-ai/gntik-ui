import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { SELECT_LISTBOX_79 } from '../../../packages/blocks/src/tables/__tests__/select-allowlist';
import {
  paginationLabels,
  filterLabels,
  tableLabels,
} from '../../../packages/blocks/src/tables/__tests__/labels-fixtures';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const theme of ['dark', 'light', 'high_contrast'])
  for (const mode of ['default', 'en', 'es']) {
    for (const block of ['pagination', 'filters', 'table']) {
      test(`${block} matrix ${mode}/${theme}`, async ({ page }) => {
        const locale = mode === 'es' ? 'es' : 'en';
        const p = paginationLabels[locale];
        const f = filterLabels[locale];
        const t = tableLabels[locale];
        const url = `/table-labels.html?block=${block}&theme=${theme}&mode=${mode}`;
        await page.goto(url);
        await page.evaluate(() => document.fonts.ready);
        await page.addScriptTag({ content: AXE });
        const checkpoint = async (state) => {
          await expect(
            page.getByRole(block === 'pagination' ? 'navigation' : block === 'filters' ? 'search' : 'table', {
              includeHidden: true,
            }),
          ).toBeVisible();
          const violations = await page.evaluate(async ({ rule, selector }) => {
            // Page-level portal host containers share the fixture's landmark context.
            const hosts = [...document.body.children].filter((element) => !element.hasAttribute('role'));
            const previous = hosts.map((element) => ({ element, label: element.getAttribute('aria-label') }));
            hosts.forEach((element, index) => {
              element.setAttribute('role', 'region');
              element.setAttribute('aria-label', `Overlay ${index + 1}`);
            });
            try {
              // eslint-disable-next-line no-undef
              const result = await axe.run(document.body);
              return result.violations.flatMap((violation) => {
                const nodes = violation.nodes.filter((node) => {
                  if (violation.id !== rule || node.target.length !== 1 || typeof node.target[0] !== 'string')
                    return true;
                  return !document.querySelector(node.target[0])?.matches(selector);
                });
                return nodes.length ? [{ id: violation.id, nodes: nodes.map((node) => node.target) }] : [];
              });
            } finally {
              for (const { element, label } of previous) {
                element.removeAttribute('role');
                if (label === null) element.removeAttribute('aria-label');
                else element.setAttribute('aria-label', label);
              }
            }
          }, SELECT_LISTBOX_79);
          expect(violations).toEqual([]);
          // The normal a11y job scans all states without requiring new image files.
          // The dedicated config compares external immutable-baseline artifacts.
          const visual = test.info().config.configFile?.endsWith('playwright.table-labels.config.js');
          if (mode === 'default' && visual)
            await expect(page).toHaveScreenshot(`issue30-${block}-${state}-${theme}.png`);
        };
        const click = async (role, name) => page.getByRole(role, { name, exact: true }).click();
        await checkpoint('initial');
        if (block === 'pagination') {
          await click('button', p.next);
          await checkpoint('next');
          await click('button', p.previous);
          await checkpoint('previous');
          await click('button', p.page(3));
          await checkpoint('page');
          await click('combobox', p.rowsPerPage);
          await checkpoint('select-open');
          await click('option', '25');
          await checkpoint('resized');
        } else if (block === 'filters') {
          await click('combobox', f.savedView);
          await checkpoint('views-open');
          await click('option', 'Choice A');
          await checkpoint('view-picked');
          await click('button', f.addFilter);
          await checkpoint('add-open');
          await click('menuitemcheckbox', 'B');
          await checkpoint('checked');
          await page.keyboard.press('Escape');
          await page.getByRole('button', { name: f.removeFilter('Kind', 'B'), exact: true }).focus();
          await checkpoint('remove-focused');
          await page.keyboard.press('Enter');
          await checkpoint('removed');
          await click('button', f.clearAll);
          await checkpoint('cleared');
          await page.goto(`${url}&state=count-N`);
          await page.addScriptTag({ content: AXE });
          await checkpoint('count-N');
        } else {
          await click('button', t.columnMenu.trigger);
          await checkpoint('columns-open');
          await click('menuitemcheckbox', 'Category');
          await checkpoint('column-toggled');
          await page.getByRole('menuitem', { name: 'Name', exact: true }).focus();
          await page.keyboard.press('ArrowRight');
          await checkpoint('pin-submenu');
          await click('menuitemradio', t.columnMenu.pinLeft);
          await page.keyboard.press('Escape');
          await checkpoint('pinned');
          await click('button', t.density.compact);
          await checkpoint('compact');
          await click('button', t.density.comfortable);
          await checkpoint('comfortable');
          const openViews = async () =>
            page.getByRole('button', { name: /^(Default view|Vista inicial|New choice|Renamed)/ }).click();
          await openViews();
          await checkpoint('views-open');
          await click('menuitem', t.views.saveAs);
          await checkpoint('save-dialog');
          await click('button', t.views.cancel);
          await checkpoint('save-cancelled');
          await openViews();
          await click('menuitem', t.views.saveAs);
          await page.getByRole('textbox', { name: t.views.name }).fill('New choice');
          await click('button', t.views.save);
          await checkpoint('saved');
          await openViews();
          await click('menuitem', t.views.renameView);
          await checkpoint('rename-dialog');
          await click('button', t.views.cancel);
          await checkpoint('rename-cancelled');
          await openViews();
          await click('menuitem', t.views.renameView);
          await page.getByRole('textbox', { name: t.views.name }).fill('Renamed');
          await click('button', t.views.rename);
          await checkpoint('renamed');
          await click('button', 'Name');
          await checkpoint('modified');
          await openViews();
          await click('menuitem', t.views.deleteView);
          await checkpoint('deleted');
          await click('checkbox', t.selection.selectRow('A'));
          await checkpoint('selected');
          await click('button', 'A');
          await checkpoint('editable');
          await page.getByRole('textbox', { name: t.edit.label('Name', 'A') }).fill('D');
          await page.keyboard.press('Enter');
          await checkpoint('edit-error');
          await page.keyboard.press('Escape');
          await click('button', `G ${t.grouping.groupRowCount(2)}`);
          await checkpoint('collapsed');
          for (const state of ['loading', 'empty']) {
            await page.goto(`${url}&state=${state}`);
            await page.addScriptTag({ content: AXE });
            await checkpoint(state);
          }
        }
      });
    }
  }
