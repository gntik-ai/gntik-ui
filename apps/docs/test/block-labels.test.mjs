import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { axeViolations } from '../e2e/block-labels.helpers.js';
import { expectedTable } from '../e2e/block-labels.expected.js';
import { fixtureLabels } from '../src/block-labels-copy.js';
import { installFixtureLandmarks } from '../src/block-labels-landmarks.js';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const { JSDOM, VirtualConsole } = require('jsdom');
const fixturePage = readFileSync(new URL('../block-labels.html', import.meta.url), 'utf8');

test('copy tables cover caller headings in the complete fixture document', () => {
  const dom = new JSDOM(fixturePage);
  try {
    const headings = [...dom.window.document.querySelectorAll('main > h1, main > h2')];
    assert.deepEqual(
      headings.map((node) => node.textContent),
      ['Records', 'Items'],
    );
    for (const block of ['pagination', 'filter', 'table']) {
      for (const language of ['en', 'es']) {
        const expected = expectedTable(block, language, 'initial');
        for (const heading of headings) {
          assert.ok(expected.strings.includes(heading.textContent), `${block}/${language}: ${heading.textContent}`);
        }
      }
    }
  } finally {
    dom.window.close();
  }
});

// The DOM is the browser boundary: run the same injected axe build and filtering as Playwright.
async function audit(html, setup = () => {}) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', virtualConsole: new VirtualConsole() });
  try {
    await setup(dom.window.document);
    const page = {
      addScriptTag: async ({ content }) => dom.window.eval(content),
      evaluate: async (fn, arg) => dom.window.eval(`(${fn.toString()})`)(arg),
    };
    return await axeViolations(page);
  } finally {
    dom.window.close();
  }
}

test('the fixture landmark contains body portals without exempting the region rule', async () => {
  // Base UI portals append to body, alongside the fixture's padded content.
  const portal = '<div data-base-ui-portal><div>Portalled option</div></div>';
  const violations = await audit(fixturePage.replace('</body>', `${portal}</body>`), installFixtureLandmarks);
  assert.equal(violations.length, 0);

  const outsideLandmarks = await audit(
    '<main><h1>Records</h1></main><div>Outside fixture content</div>',
    installFixtureLandmarks,
  );
  assert.ok(outsideLandmarks.some((violation) => violation.id === 'region'));
});

test('fixture portal landmarks follow opening and closing without removing retained Select content', async () => {
  await audit(fixturePage, async (document) => {
    const disconnect = installFixtureLandmarks(document);
    try {
      const portal = document.createElement('div');
      portal.setAttribute('data-base-ui-portal', '');
      portal.innerHTML = '<div hidden><div role="listbox"><div role="option">Saved</div></div></div>';
      document.body.append(portal);
      await Promise.resolve();
      assert.equal(document.querySelectorAll('[role="region"]').length, 0);

      portal.firstElementChild.hidden = false;
      await Promise.resolve();
      assert.equal(document.querySelectorAll('[role="region"]').length, 1);
      assert.equal(portal.getAttribute('aria-label'), 'Items');
      // A submenu inherits its parent's landmark; it must not create a duplicate.
      const nested = document.createElement('div');
      nested.setAttribute('data-base-ui-portal', '');
      portal.append(nested);
      await Promise.resolve();
      assert.equal(nested.hasAttribute('role'), false);
      nested.remove();

      portal.firstElementChild.hidden = true;
      await Promise.resolve();
      assert.equal(document.querySelectorAll('[role="region"]').length, 0);
      assert.ok(document.querySelector('[role="listbox"]'));
    } finally {
      disconnect();
    }
  });
});

test('fixture landmarks preserve explicit portal host roles and names', async () => {
  await audit(
    fixturePage.replace(
      '</body>',
      '<div data-base-ui-portal role="complementary" aria-label="Existing host"><div>Content</div></div></body>',
    ),
    (document) => {
      installFixtureLandmarks(document);
      const host = document.querySelector('[data-base-ui-portal]');
      assert.equal(host.getAttribute('role'), 'complementary');
      assert.equal(host.getAttribute('aria-label'), 'Existing host');
    },
  );
});

test('#79 keeps unnamed textboxes and lookalike non-Select listboxes failing', async () => {
  const violations = await audit(
    '<main><div role="textbox" tabindex="0"></div><div class="bg-popover"><div role="listbox" class="outline-none"><div role="option">Other</div></div></div></main>',
  );
  assert.equal(violations.find((v) => v.id === 'aria-input-field-name')?.nodes.length, 2);
});

test('pagination expectations exclude other blocks and unopened page-size options', () => {
  const { strings: expected } = expectedTable('pagination', 'es', 'initial');
  assert.ok(!expected.includes('Elegir columnas'));
  assert.ok(!expected.includes('50'));
  assert.ok(!expected.includes('6'));
  assert.ok(!expected.includes('polite'));
});

test('column-menu captions stay bound to the parent menu when a pin submenu opens', () => {
  const dom = new JSDOM(
    '<div role="menu"><div role="group"><div>Columnas visibles</div><div role="menuitemcheckbox">Name</div></div><div role="group"><div>Posición de columnas</div></div></div><div role="menu"><div role="group"><div role="menuitemradio">Fijar al inicio</div></div></div>',
  );
  try {
    const expected = expectedTable('table', 'es', 'pin-options');
    const entry = expected.elements.find((e) => e.key === 'pinColumns');
    const nodes = [...dom.window.document.querySelectorAll(entry.selector.replaceAll(':visible', ''))];
    assert.deepEqual(
      nodes.map((n) => n.textContent),
      ['Posición de columnas'],
    );
  } finally {
    dom.window.close();
  }
});

test('#79 removes only the Select list node, preserving other nodes and rules', async () => {
  const violations = await audit(
    '<main><div role="textbox" tabindex="0"></div><div role="combobox" tabindex="0" aria-label="Choose" aria-expanded="true" aria-haspopup="listbox" aria-controls="select-list"></div><div class="bg-popover" role="presentation"><div id="select-list" role="listbox" class="outline-none" aria-required="invalid"><div role="option">Other</div></div></div></main>',
  );
  assert.equal(violations.find((v) => v.id === 'aria-input-field-name')?.nodes.length, 1);
  assert.ok(violations.some((v) => v.id === 'aria-valid-attr-value'));
});

test('element tables match the rendered public blocks and fixture states', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const testingRequire = createRequire(require.resolve('@testing-library/react'));
  const accessibilityRequire = createRequire(testingRequire.resolve('@testing-library/dom'));
  const { computeAccessibleName } = accessibilityRequire('dom-accessibility-api');
  const { PaginationFooter, FilterBar, DataTable } = await import('../../../packages/blocks/dist/index.js');
  const rows = [
    { id: 'a', name: 'Alpha', region: 'West', quantity: 2 },
    { id: 'b', name: 'Beta', region: 'East', quantity: 3 },
  ];
  const columns = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, width: 200, editable: true },
    { id: 'region', header: 'Region', accessor: (row) => row.region, sortable: true, width: 160 },
    { id: 'quantity', header: 'Quantity', accessor: (row) => row.quantity, width: 120, editable: true },
  ];
  const tableProps = {
    rows,
    columns,
    caption: 'Items',
    resizable: true,
    showPinMenu: true,
    defaultViews: [{ id: 'saved', name: 'Saved', state: {} }],
    rowActions: () => [{ label: 'Inspect', onClick: () => {} }],
  };
  for (const language of ['en', 'es']) {
    const labels = fixtureLabels(language);
    const fixtures = [
      ['pagination', 'initial', PaginationFooter, { noun: 'Items', total: 97 }],
      ['pagination', 'resized', PaginationFooter, { noun: 'Items', total: 97, defaultPageSize: 25 }],
      ['filter', 'initial', FilterBar, { resultCount: 12, defaultFilters: [] }],
      ['filter', 'selected', FilterBar, { resultCount: 11, defaultFilters: [{ field: 'status', value: 'Ready' }] }],
      ['table', 'initial', DataTable, tableProps],
      [
        'table',
        'pinned-right',
        DataTable,
        { ...tableProps, hiddenColumns: ['region'], pinnedColumns: { right: ['name'] } },
      ],
      ['table', 'empty', DataTable, { ...tableProps, rows: [] }],
      ['table', 'loading', DataTable, { ...tableProps, loading: true }],
      ['table', 'grouped', DataTable, { ...tableProps, groupBy: () => '' }],
      ['table', 'editing', DataTable, { ...tableProps, onCellEdit: () => false }],
    ];
    for (const [block, state, Component, props] of fixtures) {
      const filterProps =
        block === 'filter'
          ? {
              fields: [{ id: 'status', label: 'Status', options: ['Ready', 'Failed'] }],
              views: [{ value: 'saved', label: 'Saved', filters: [{ field: 'status', value: 'Ready' }] }],
            }
          : {};
      const html = renderToStaticMarkup(React.createElement(Component, { ...props, ...filterProps, labels }));
      const dom = new JSDOM(fixturePage.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
      try {
        for (const { key, selector, surface, values } of expectedTable(block, language, state).elements) {
          const actual = [...dom.window.document.querySelectorAll(selector)].map((node) => {
            if (surface === 'name') return computeAccessibleName(node);
            if (surface === 'text') return node.textContent.replace(/\s+/g, ' ').trim();
            return node.getAttribute(surface);
          });
          assert.deepEqual(actual, values, `${block}/${language}/${state}/${key}: ${selector}`);
        }
      } finally {
        dom.window.close();
      }
    }
  }
});
