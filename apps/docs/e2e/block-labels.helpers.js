import { expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

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

export async function openedPopup(page, role) {
  const popup = page.getByRole(role);
  await expect(popup.last()).toBeVisible();
  // Select may keep focus outside its listbox; wait wherever the primitive puts it.
  await settledFocus(page);
}

// Read exactly the existing trace fields, twice on consecutive animation frames.
// A real timeout also bounds the wait if animation frames stop arriving.
export async function settledFocus(page, includeTabIndex = true) {
  return page.evaluate(
    (withTabIndex) =>
      new Promise((resolve, reject) => {
        const read = () => {
          const el = document.activeElement;
          // A disabled control can retain focus until the browser's later blur task.
          if (el.matches(':disabled')) return null;
          const fields = [el.tagName, el.getAttribute('role'), el.getAttribute('aria-label'), el.textContent];
          if (withTabIndex) fields.push(el.tabIndex);
          return fields;
        };
        let previous = read();
        let frame;
        const timer = setTimeout(() => {
          cancelAnimationFrame(frame);
          reject(new Error('Keyboard focus trace did not settle within 3000ms'));
        }, 3_000);
        const poll = () => {
          const current = read();
          if (current && JSON.stringify(current) === JSON.stringify(previous)) {
            clearTimeout(timer);
            resolve(current);
          } else {
            previous = current;
            frame = requestAnimationFrame(poll);
          }
        };
        frame = requestAnimationFrame(poll);
      }),
    includeTabIndex,
  );
}

// Exercise focus movement at each baseline state without submitting or toggling a value.
// Stay inside an open popup so the probe does not close it before the checkpoint.
export async function keyboardAtState(page) {
  const initial = await settledFocus(page);
  const originalFocus = await page.evaluateHandle(() => document.activeElement);
  const menu = page.getByRole('menu');
  const list = page.getByRole('listbox');
  const dialog = page.getByRole('dialog');
  let first;
  let keys;
  if (await menu.count()) {
    first = menu.last().locator('[role^="menuitem"]:not([aria-disabled="true"])').first();
    keys = ['ArrowDown', 'ArrowUp'];
  } else if (await list.count()) {
    first = list.getByRole('option').first();
    keys = ['ArrowDown', 'ArrowUp'];
  } else {
    const scope = (await dialog.count()) ? dialog : page.locator('#root');
    first = scope.locator('input:not([type="hidden"]):not([disabled]), button:not([disabled])').first();
    keys = ['Tab', 'Shift+Tab'];
  }
  const focus = () => settledFocus(page);
  const trace = [initial];
  try {
    await first.focus();
    trace.push(await focus());
    for (const key of keys) {
      await page.keyboard.press(key);
      trace.push(await focus());
    }
  } finally {
    await originalFocus.evaluate((el) => el.focus({ preventScroll: true }));
    await originalFocus.dispose();
  }
  trace.push(await focus());
  return trace;
}

export async function axeViolations(page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document.body);
    return result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    }));
  });
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
    'region',
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

// #79 adds the trigger's name to Select lists; only the 0.5.0 comparison removes that exact delta.
export async function selectListboxPairs(page) {
  const lists = await page.getByRole('listbox').all();
  if (!lists.length) return [];
  const session = await page.context().newCDPSession(page);
  try {
    const { root } = await session.send('DOM.getDocument');
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: '[role="combobox"][aria-haspopup="listbox"][aria-controls]',
    });
    const triggers = [];
    for (const nodeId of nodeIds) {
      const { node } = await session.send('DOM.describeNode', { nodeId });
      const attributes = {};
      for (let index = 0; index < node.attributes.length; index += 2)
        attributes[node.attributes[index]] = node.attributes[index + 1];
      triggers.push({ backendNodeId: node.backendNodeId, controls: attributes['aria-controls'] });
    }
    const { nodes } = await session.send('Accessibility.getFullAXTree');
    const pairs = [];
    for (const list of lists) {
      const listboxId = await list.getAttribute('id');
      if (!listboxId) continue;
      const matches = triggers.filter((trigger) => trigger.controls === listboxId);
      if (!matches.length) continue;
      expect(matches, '#79 requires one trigger per listbox').toHaveLength(1);
      const triggerNodeId = matches[0].backendNodeId;
      const names = nodes.filter((node) => !node.ignored && node.backendDOMNodeId === triggerNodeId);
      expect(names, '#79 requires the trigger in the accessibility tree').toHaveLength(1);
      const name = names[0].name?.value;
      expect(typeof name).toBe('string');
      expect(name).not.toBe('');
      // Independently verify the paired list's computed name, before snapshot normalization.
      const namedList = page.getByRole('listbox', { name, exact: true });
      await expect(namedList).toHaveCount(1);
      await expect(namedList).toHaveAttribute('id', listboxId);
      pairs.push({ listboxId, triggerNodeId, name });
    }
    return pairs;
  } finally {
    await session.detach();
  }
}

export function normalizeSelectListboxNames(current, pairs) {
  const attributes = [...current.attributes];
  const lines = current.tree.split('\n');
  for (const { name } of pairs) {
    const expected = {
      tag: 'DIV',
      role: 'listbox',
      'aria-label': name,
      'aria-description': null,
      title: null,
      placeholder: null,
      'aria-valuetext': null,
      live: null,
    };
    const row = attributes.findIndex((attribute) => isDeepStrictEqual(attribute, expected));
    expect(row, '#79 requires the exact listbox attributes row').toBeGreaterThanOrEqual(0);
    attributes.splice(row, 1);

    const named = `- listbox ${JSON.stringify(name)}`;
    const matches = lines.flatMap((line, index) =>
      line.trimStart() === named || line.trimStart() === `${named}:` ? [index] : [],
    );
    expect(matches, '#79 requires exactly one named listbox line').toHaveLength(1);
    const index = matches[0];
    const line = lines[index];
    const indent = line.slice(0, line.length - line.trimStart().length);
    lines[index] = `${indent}- listbox${line.trimStart() === `${named}:` ? ':' : ''}`;
  }
  return { ...current, attributes, tree: lines.join('\n') };
}

// Fixed current defaults, independent of the source implementation and the translated fixture.
const ENGLISH_DEFAULTS = [
  'Scrollable table',
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
  for (const { key, selector, surface, values, background } of expected.elements) {
    if (background && surface === 'name') continue;
    const nodes = page.locator(selector);
    await expect(nodes, `${key}: ${selector}`).toHaveCount(values.length);
    for (const [index, value] of values.entries()) {
      const node = nodes.nth(index);
      if (surface === 'name') await expect(node, key).toHaveAccessibleName(value);
      else if (surface === 'text') await expect(node, key).toHaveText(value);
      else await expect(node, key).toHaveAttribute(surface, value);
    }
  }
  const evidence = await surfaces(page);
  const domStrings = [
    ...evidence.text,
    ...evidence.attributes.flatMap((a) =>
      ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext', 'live']
        .map((key) => a[key])
        .filter((value) => typeof value === 'string'),
    ),
  ];
  // Expected values are a state/element table, including explicit caller and composed names.
  const allowed = new Set(expected.strings);
  for (const string of domStrings) expect(allowed.has(string), `Unexpected ${language} surface: ${string}`).toBe(true);
  const allowedNames = new Set([...expected.strings, ...expected.browserNames]);
  const names = evidence.names.map((n) => n.name);
  for (const name of names)
    expect(allowedNames.has(name), `Unexpected ${language} accessible name: ${name}`).toBe(true);
  for (const name of expected.browserNames)
    expect(names, `Missing ${language} accessible name: ${name}`).toContain(name);
  if (language === 'es') {
    for (const string of [...domStrings, ...names]) {
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
