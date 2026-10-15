import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { expectedTable } from '../e2e/block-labels.expected.js';
import { fixtureLabels } from '../src/block-labels-copy.js';
import { installFixtureLandmarks } from '../src/block-labels-landmarks.js';
import { axeViolations, settledFocus } from '../e2e/block-labels.helpers.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const fixturePage = readFileSync(new URL('../block-labels.html', import.meta.url), 'utf8');

test('focus samples wait for frame-delayed DOM updates and preserve both trace shapes', async () => {
  const dom = new JSDOM('<button aria-label="Before">Before</button>', {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  // The browser evaluation boundary runs in a real DOM with its own animation frames.
  const page = { evaluate: (fn, arg) => dom.window.eval(`(${fn.toString()})`)(arg) };
  try {
    const button = dom.window.document.querySelector('button');
    button.focus();
    dom.window.requestAnimationFrame(() => {
      button.setAttribute('aria-label', 'After');
      button.textContent = 'Ready';
      button.tabIndex = 2;
    });
    assert.deepEqual(Array.from(await settledFocus(page)), ['BUTTON', null, 'After', 'Ready', 2]);
    assert.deepEqual(Array.from(await settledFocus(page, false)), ['BUTTON', null, 'After', 'Ready']);
  } finally {
    dom.window.close();
  }
});

test('a continuously changing focus trace fails within the bounded settle timeout', async () => {
  const dom = new JSDOM('<button>Changing</button>', { pretendToBeVisual: true, runScripts: 'outside-only' });
  const page = { evaluate: (fn, arg) => dom.window.eval(`(${fn.toString()})`)(arg) };
  try {
    const button = dom.window.document.querySelector('button');
    button.focus();
    let change = 0;
    const update = () => {
      button.setAttribute('aria-label', String(++change));
      dom.window.requestAnimationFrame(update);
    };
    dom.window.requestAnimationFrame(update);
    await assert.rejects(settledFocus(page), /did not settle within 3000ms/);
  } finally {
    dom.window.close();
  }
});

test('element tables match client-rendered blocks, including Select portal anchors', { timeout: 300_000 }, async () => {
  let checkpoint = 'setup';
  // Bound async interactions as well as the whole test, with the failing fixture state.
  const step = async (action) => {
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(action),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Stalled at ${checkpoint}`)), 15_000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  const dom = new JSDOM(fixturePage, { url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  const disconnectLandmarks = installFixtureLandmarks(dom.window.document);
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };
  for (const key of ['window', 'document', 'navigator', 'Node', 'Element', 'HTMLElement', 'MutationObserver'])
    setGlobal(key, dom.window[key]);
  for (const key of ['requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle'])
    setGlobal(key, dom.window[key].bind(dom.window));
  setGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  dom.window.matchMedia = (media) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  dom.window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  dom.window.Element.prototype.getAnimations = () => [];
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const { getByRole, queryByRole, waitFor } = require('@testing-library/react');
  const closed = (role) =>
    waitFor(() => {
      // Comparing the DOM node to null makes AssertionError format its entire React tree
      // on every retry during closing. Compare a boolean to keep retries cheap and bounded.
      assert.equal(queryByRole(dom.window.document.body, role) === null, true, `${role} is still exposed`);
      assert.equal(dom.window.document.querySelectorAll('[data-base-ui-focus-guard]').length, 0);
    });
  const { default: userEvent } = require('@testing-library/user-event');
  const user = userEvent.setup({ document: dom.window.document });
  const testingRequire = createRequire(require.resolve('@testing-library/react'));
  const accessibilityRequire = createRequire(testingRequire.resolve('@testing-library/dom'));
  const { computeAccessibleName } = accessibilityRequire('dom-accessibility-api');
  const { PaginationFooter, FilterBar, DataTable } = await step(() => import('../../../packages/blocks/dist/index.js'));
  const { ThemeProvider, I18nProvider } = await step(() => import('../../../packages/ui/dist/index.js'));
  function FilterFixture(props) {
    const [count, setCount] = React.useState(12);
    return React.createElement(FilterBar, {
      ...props,
      resultCount: count,
      onFiltersChange: (filters) => setCount(12 - filters.length),
    });
  }
  const root = createRoot(dom.window.document.getElementById('root'));
  try {
    const rows = [
      { id: 'a', name: 'Alpha', region: 'West', quantity: 2 },
      { id: 'b', name: 'Beta', region: 'East', quantity: 3 },
    ];
    const columns = [
      { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, width: 200 },
      { id: 'region', header: 'Region', accessor: (row) => row.region, sortable: true, width: 160 },
      { id: 'quantity', header: 'Quantity', accessor: (row) => row.quantity, width: 120 },
    ];
    for (const language of ['en', 'es']) {
      const labels = fixtureLabels(language);
      for (const [block, Component, props] of [
        ['pagination', PaginationFooter, { noun: 'Items', total: 97 }],
        [
          'filter',
          FilterFixture,
          {
            resultCount: 12,
            defaultFilters: [],
            fields: [{ id: 'status', label: 'Status', options: ['Ready', 'Failed'] }],
            views: [{ value: 'saved', label: 'Saved', filters: [{ field: 'status', value: 'Ready' }] }],
          },
        ],
        [
          'table',
          DataTable,
          {
            rows,
            columns,
            caption: 'Items',
            resizable: true,
            showPinMenu: true,
            defaultViews: [{ id: 'saved', name: 'Saved', state: {} }],
            rowActions: () => [{ label: 'Inspect', onClick: () => {} }],
          },
        ],
      ]) {
        checkpoint = `${block}/${language}/render`;
        await step(() =>
          React.act(async () => {
            root.render(
              React.createElement(
                ThemeProvider,
                { storageKey: null },
                React.createElement(
                  I18nProvider,
                  { locale: 'en', applyTo: 'document' },
                  React.createElement(Component, { ...props, labels }),
                ),
              ),
            );
          }),
        );
        const states =
          block === 'pagination'
            ? ['initial', 'next', 'previous', 'numbered', 'open']
            : block === 'filter'
              ? ['initial', 'menu', 'selected', 'focused', 'removed', 'clear', 'views', 'applied']
              : ['initial', 'columns', 'toggled', 'pin-options', 'pinned', 'left-suffix'];
        for (const state of states) {
          checkpoint = `${block}/${language}/${state}`;
          const byRole = (role, name) => getByRole(dom.window.document.body, role, { name, exact: true });
          if (block === 'pagination' && ['next', 'previous', 'numbered'].includes(state))
            await step(() =>
              user.click(
                byRole('button', state === 'numbered' ? (language === 'es' ? 'Ir a 3' : 'Go to 3') : labels[state]),
              ),
            );
          if (['open', 'menu', 'columns', 'left-suffix'].includes(state)) {
            await step(() =>
              user.click(
                byRole(
                  block === 'pagination' ? 'combobox' : 'button',
                  labels[block === 'pagination' ? 'rowsPerPageLabel' : block === 'filter' ? 'addFilter' : 'columns'],
                ),
              ),
            );
            await step(() =>
              waitFor(() => getByRole(dom.window.document.body, block === 'pagination' ? 'listbox' : 'menu')),
            );
          }
          if (state === 'toggled') await step(() => user.click(byRole('menuitemcheckbox', 'Region')));
          if (block === 'filter') {
            if (state === 'selected') {
              await step(() => user.click(byRole('menuitemcheckbox', 'Ready')));
              await step(() => user.keyboard('{Escape}'));
              await step(() => closed('menu'));
            }
            const remove = () => byRole('button', language === 'es' ? 'Quitar Status|Ready' : 'Drop Status|Ready');
            if (state === 'focused') await step(() => React.act(async () => remove().focus()));
            if (state === 'removed') await step(() => user.keyboard('{Delete}'));
            if (state === 'clear') {
              await step(() => user.type(byRole('searchbox', labels.searchLabel), 'Alpha'));
              await step(() => user.click(byRole('button', labels.clearAll)));
            }
            if (state === 'views') await step(() => user.click(byRole('combobox', labels.savedViewLabel)));
            if (state === 'views' || state === 'applied') {
              await step(() => waitFor(() => byRole('listbox', '')));
              await step(() => waitFor(() => byRole('option', 'Saved')));
            }
            if (state === 'applied') {
              await step(() => user.click(byRole('option', 'Saved')));
              await step(() => closed('listbox'));
            }
          }
          if (state === 'pin-options' || state === 'left-suffix') {
            await step(() =>
              React.act(async () =>
                dom.window.document.querySelector('[role="menuitem"][aria-haspopup="menu"]').focus(),
              ),
            );
            await step(() => user.keyboard('{ArrowRight}'));
            await step(() => waitFor(() => byRole('menuitemradio', labels.pinLeft)));
          }
          if (state === 'pinned') {
            await step(() => user.click(byRole('menuitemradio', labels.pinLeft)));
            await step(() => closed('menu'));
          }
          const expected = expectedTable(block, language, state);
          for (const { key, selector, surface, values, background } of expected.elements) {
            if (background && surface === 'name') continue;
            const actual = [...dom.window.document.querySelectorAll(selector.replaceAll(':visible', ''))].map(
              (node) => {
                if (surface === 'name') return computeAccessibleName(node);
                if (surface === 'text') return node.textContent.replace(/\s+/g, ' ').trim();
                return node.getAttribute(surface);
              },
            );
            assert.deepEqual(actual, values, `${block}/${language}/${state}/${key}: ${selector}`);
          }
          const walk = dom.window.document.createTreeWalker(dom.window.document.body, dom.window.NodeFilter.SHOW_TEXT);
          const hiddenByDisplay = new WeakMap();
          const isHidden = (element) => {
            if (!element) return false;
            if (!hiddenByDisplay.has(element))
              hiddenByDisplay.set(
                element,
                dom.window.getComputedStyle(element).display === 'none' || isHidden(element.parentElement),
              );
            return hiddenByDisplay.get(element);
          };
          while (walk.nextNode()) {
            const node = walk.currentNode;
            const text = node.textContent.trim();
            if (!text || node.parentElement.closest('script, style')) continue;
            if (!isHidden(node.parentElement))
              assert.ok(expected.strings.includes(text), `${block}/${language}/${state}: unexpected text ${text}`);
          }
          for (const node of dom.window.document.querySelectorAll(
            'button, input[type="search"], h1, h2, nav, [role]',
          )) {
            if (node.closest('[aria-hidden="true"], [hidden]')) continue;
            const name = computeAccessibleName(node);
            if (name)
              assert.ok(expected.strings.includes(name), `${block}/${language}/${state}: unexpected name ${name}`);
          }
          if (['open', 'menu', 'views', 'columns', 'pin-options', 'left-suffix'].includes(state)) {
            const violations = await step(() =>
              axeViolations({
                addScriptTag: async ({ content }) => dom.window.eval(content),
                evaluate: async (fn, arg) => dom.window.eval(`(${fn.toString()})`)(arg),
              }),
            );
            assert.equal(
              violations.some((v) => ['region', 'landmark-unique'].includes(v.id)),
              false,
              checkpoint,
            );
          }
        }
        await step(() => React.act(async () => root.render(null)));
      }
    }
  } finally {
    // Synchronous unmount guarantees cleanup even if an earlier async act stalled.
    React.act(() => root.unmount());
    disconnectLandmarks();
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
