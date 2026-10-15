import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { expectedTable } from '../e2e/block-labels.expected.js';
import { fixtureLabels } from '../src/block-labels-copy.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const fixturePage = readFileSync(new URL('../block-labels.html', import.meta.url), 'utf8');

test('element tables match client-rendered blocks, including Select portal anchors', async () => {
  const dom = new JSDOM(fixturePage, { url: 'http://localhost/', pretendToBeVisual: true });
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
  const { default: userEvent } = require('@testing-library/user-event');
  const user = userEvent.setup({ document: dom.window.document });
  const testingRequire = createRequire(require.resolve('@testing-library/react'));
  const accessibilityRequire = createRequire(testingRequire.resolve('@testing-library/dom'));
  const { computeAccessibleName } = accessibilityRequire('dom-accessibility-api');
  const { PaginationFooter, FilterBar, DataTable } = await import('../../../packages/blocks/dist/index.js');
  const { ThemeProvider, I18nProvider } = await import('../../../packages/ui/dist/index.js');
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
        await React.act(async () => {
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
        });
        const states =
          block === 'pagination'
            ? ['initial', 'next', 'previous', 'numbered', 'open']
            : block === 'filter'
              ? ['initial', 'menu']
              : ['initial', 'columns', 'toggled', 'pin-options', 'pinned', 'left-suffix'];
        for (const state of states) {
          const byRole = (role, name) => getByRole(dom.window.document.body, role, { name, exact: true });
          if (block === 'pagination' && ['next', 'previous', 'numbered'].includes(state))
            await user.click(
              byRole('button', state === 'numbered' ? (language === 'es' ? 'Ir a 3' : 'Go to 3') : labels[state]),
            );
          if (['open', 'menu', 'columns', 'left-suffix'].includes(state)) {
            await user.click(
              byRole(
                block === 'pagination' ? 'combobox' : 'button',
                labels[block === 'pagination' ? 'rowsPerPageLabel' : block === 'filter' ? 'addFilter' : 'columns'],
              ),
            );
            await waitFor(() => getByRole(dom.window.document.body, block === 'pagination' ? 'listbox' : 'menu'));
          }
          if (state === 'toggled') await user.click(byRole('menuitemcheckbox', 'Region'));
          if (state === 'pin-options' || state === 'left-suffix') {
            await React.act(async () =>
              dom.window.document.querySelector('[role="menuitem"][aria-haspopup="menu"]').focus(),
            );
            await user.keyboard('{ArrowRight}');
            await waitFor(() => byRole('menuitemradio', labels.pinLeft));
          }
          if (state === 'pinned') {
            await user.click(byRole('menuitemradio', labels.pinLeft));
            await waitFor(() => assert.equal(queryByRole(dom.window.document.body, 'menu'), null));
            await waitFor(() =>
              assert.equal(dom.window.document.querySelectorAll('[data-base-ui-focus-guard]').length, 0),
            );
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
          while (walk.nextNode()) {
            const node = walk.currentNode;
            const text = node.textContent.trim();
            if (!text || node.parentElement.closest('script, style')) continue;
            let hidden = false;
            for (let parent = node.parentElement; parent; parent = parent.parentElement)
              if (dom.window.getComputedStyle(parent).display === 'none') hidden = true;
            if (!hidden)
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
        }
        await React.act(async () => root.render(null));
      }
    }
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
