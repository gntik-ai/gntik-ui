import { expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// The exact BaseSelect.List inside SelectContent, not a rule-wide exemption.
export const SELECT_LISTBOX_NAME_79 = {
  issue: 'gntik-ai/gntik-ui#79',
  rule: 'aria-input-field-name',
  selector: '.bg-popover > [role="listbox"].outline-none',
};

export async function closed(page, role) {
  // Hidden Select lists stay mounted for typeahead. Only exposed roles must disappear.
  await expect(page.getByRole(role)).toHaveCount(0);
  await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
}

// Menu-to-dialog transitions are open-dialog checkpoints, not closed-popup checkpoints.
// The new dialog owns live guards; all guards belonging to the closing menu must be gone.
export async function openedDialog(page) {
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const viewport = document.querySelector('[role="dialog"]')?.parentElement;
        return [...document.querySelectorAll('[data-base-ui-focus-guard]')].filter(
          (guard) => !viewport?.contains(guard),
        ).length;
      }),
    )
    .toBe(0);
}

export async function axeViolations(page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async (allow) => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body);
    return result.violations.flatMap((violation) => {
      const nodes = violation.nodes.filter((node) => {
        if (violation.id !== allow.rule || node.target.length !== 1 || typeof node.target[0] !== 'string') return true;
        return !document.querySelector(node.target[0])?.matches(allow.selector);
      });
      return nodes.length ? [{ id: violation.id, nodes: nodes.map((node) => node.target) }] : [];
    });
  }, SELECT_LISTBOX_NAME_79);
}

export async function surfaces(page) {
  const dom = await page.evaluate(() => {
    const exposed = (el) => el.checkVisibility() && !el.closest('[aria-hidden="true"], [hidden]');
    const attributes = [
      ...document.querySelectorAll(
        '[aria-label], [aria-description], [title], [placeholder], [aria-live], [aria-valuetext]',
      ),
    ]
      .filter(exposed)
      .map((el) => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        ...Object.fromEntries(
          ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext'].map((key) => [
            key,
            el.getAttribute(key),
          ]),
        ),
        live: el.hasAttribute('aria-live') ? el.textContent : null,
      }));
    const text = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const node = walk.currentNode;
      if (!node.textContent.trim() || !node.parentElement || node.parentElement.closest('script, style')) continue;
      // Include visible aria-hidden chrome (e.g. the rows-per-page caption), and sr-only text.
      if (node.parentElement.checkVisibility()) text.push(node.textContent.trim());
    }
    return { attributes, text };
  });
  const session = await page.context().newCDPSession(page);
  const { nodes } = await session.send('Accessibility.getFullAXTree');
  await session.detach();
  const controls = new Set([
    'button',
    'checkbox',
    'radio',
    'combobox',
    'textbox',
    'searchbox',
    'spinbutton',
    'separator',
    'navigation',
    'search',
    'list',
    'group',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'dialog',
    'heading',
    'status',
  ]);
  const names = nodes
    .filter((node) => !node.ignored && controls.has(node.role?.value) && node.name?.value)
    .map((node) => ({ role: node.role.value, name: node.name.value }));
  return {
    ...dom,
    names,
    tree: await page.locator('body').ariaSnapshot(),
    callbacks: await page.evaluate(() => window.callbackCalls),
  };
}

// Fixed current defaults, independent of the source implementation and the translated fixture.
const ENGLISH_DEFAULTS = [
  'Rows per page',
  'Previous page',
  'Next page',
  'Search',
  'Search by name…',
  'Saved view',
  'Saved views',
  'Add filter',
  'Active filters',
  'Filters',
  'Clear all',
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
  'Rename',
  'Close',
  'Selection',
  'Select all rows on this page',
  'Actions',
  'No results',
  'Nothing matches the current filters.',
  'No group',
  'row',
  'rows',
  'result',
  'results',
  'of',
  'Press Enter or F2 to edit.',
  'The change could not be saved.',
  'Enter a number.',
];

export async function checkCopy(page, expected, language) {
  const evidence = await surfaces(page);
  const strings = [
    ...evidence.text,
    ...evidence.names.map((n) => n.name),
    ...evidence.attributes.flatMap((a) =>
      ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext', 'live']
        .map((key) => a[key])
        .filter((value) => typeof value === 'string'),
    ),
  ];
  // Expected values are a state/element table, including explicit caller and composed names.
  const allowed = new Set(expected);
  for (const string of strings) expect(allowed.has(string), `Unexpected ${language} surface: ${string}`).toBe(true);
  if (language === 'es') {
    for (const string of strings) {
      expect(ENGLISH_DEFAULTS, `English default remained: ${string}`).not.toContain(string);
      expect(string).not.toMatch(
        /^(Remove filter |Resize .* column$|Select all in |Actions for |Loading items|\d+ selected$|Page \d+$|Enter \d+ or (more|less)\.$)/,
      );
    }
  }
  return evidence;
}

export async function formatterCalled(page, key, args) {
  const calls = await page.evaluate(() => window.labelCalls);
  expect(calls).toContainEqual([key, args]);
}
