import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
test('real catalog index links every doc without previews and Select renders its complete reference', async () => {
  const dom = new JSDOM('', { url: 'http://localhost/' });
  globalThis.React = React;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.location = dom.window.location;
  globalThis.history = dom.window.history;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let root;
  const { createServer } = await import('vite');
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    for (const module of ['globals.js', 'catalog/kit.jsx', 'catalog/api-reference.jsx'])
      await server.ssrLoadModule(`/src/${module}`);
    const { COMPONENTS } = await server.ssrLoadModule('/src/catalog/library.jsx');
    const html = renderToStaticMarkup(React.createElement(window.SECTIONS['ui-components'], {}));
    const index = new JSDOM(html).window.document;
    assert.equal(index.querySelectorAll('a[href^="#ui-components/"]').length, COMPONENTS.length);
    assert.equal(index.querySelectorAll('section[id^="ui-"]').length, 0);
    assert.equal(index.querySelectorAll('[role="combobox"]').length, 0);
    const page = new JSDOM(
      renderToStaticMarkup(React.createElement(window.SECTIONS['ui-components'], { item: { id: 'select' } })),
    ).window.document;
    assert.equal(page.querySelector('h1').textContent, 'Select');
    assert.equal(page.querySelectorAll('section[id^="ui-"]').length, 1);
    for (const title of ['Anatomy', 'Props', 'Keyboard', 'Accessibility', 'Styling hooks'])
      assert.ok(
        [...page.querySelectorAll('h2,h3')].some((h) => h.textContent === title),
        title,
      );
    await server.ssrLoadModule('/src/catalog/viewers.jsx');
    for (const [section, id] of [
      ['blocks', 'flow-builder'],
      ['templates', 'workflow-builder'],
      ['layouts', 'canvas-layout'],
    ]) {
      const item = { id, name: id, description: '' };
      const gallery = new JSDOM(renderToStaticMarkup(React.createElement(window.SECTIONS[section], { item }))).window
        .document;
      assert.equal(gallery.querySelector('h1').textContent, id);
      assert.equal(gallery.querySelectorAll(`a[href="#${section}"]`).length, 1);
      if (section === 'layouts') {
        assert.equal(gallery.querySelectorAll('iframe').length, 1);
        assert.match(gallery.querySelector('iframe').getAttribute('src'), /canvas-layout--canvas-layout-flow-editor/);
        assert.ok([...gallery.querySelectorAll('h3')].some((h) => h.textContent === 'API reference'));
      } else assert.equal(gallery.querySelectorAll('article').length, 1);
    }
    const utility = new JSDOM(
      renderToStaticMarkup(React.createElement(window.SECTIONS['ui-components'], { item: { id: 'match-text' } })),
    ).window.document;
    assert.match(
      utility.querySelector('pre code').textContent,
      /import \{ foldText, matchRanges, matchText \} from '@gntik-ai\/ui'/,
    );
    const rows = [...page.querySelectorAll('table[aria-label="Select styling hooks"] tbody tr')].map((row) =>
      [...row.querySelectorAll('td')].map((cell) => cell.textContent),
    );
    for (const [attribute, part] of [
      ['data-popup-open', 'trigger'],
      ['data-highlighted', 'item'],
      ['data-selected', 'item'],
      ['data-disabled', 'item'],
    ])
      assert.ok(
        rows.some((r) => r[0] === attribute && r[1] === part),
        `${part}: ${attribute}`,
      );
    await server.ssrLoadModule('/src/catalog/registry.jsx');
    await server.ssrLoadModule('/src/catalog/catalog.jsx');
    localStorage.setItem('gntik-section', 'ui-components');
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(React.createElement(window.CatalogShell)));
    assert.equal(location.hash, '#ui-components', 'restored sections have shareable URLs');
    assert.equal(history.length, 1, 'normalizing a restored section does not push history');
    assert.equal(document.activeElement, container.querySelector('main h1'));
    await act(async () => {
      const changed = new Promise((resolve) => window.addEventListener('hashchange', resolve, { once: true }));
      window.__goto('ui-components', 'use-breakpoint');
      await changed;
    });
    assert.equal(history.length, 2, 'item navigation pushes a history entry');
    assert.equal(container.querySelector('main h1').textContent, 'Breakpoint values');
    assert.equal(document.title, 'Breakpoint values · Gntik UI');
    assert.equal(document.activeElement, container.querySelector('main h1'));
    const compact = [...container.querySelectorAll('header button')].find((button) => button.textContent === 'Compact');
    await act(async () => {
      compact.focus();
      compact.click();
    });
    assert.equal(document.activeElement, compact, 'density changes preserve focus');
    await act(async () => root.render(React.createElement(window.CatalogShell, { key: 'fresh-item-load' })));
    assert.equal(location.hash, '#ui-components/use-breakpoint', 'initialization preserves the item segment');
    assert.equal(container.querySelector('main h1').textContent, 'Breakpoint values');
    for (const [folder, attribute, meaning] of [
      ['Accordion', 'data-panel-open', 'The associated panel is expanded; the trigger state rotates the chevron.'],
      [
        'Popover',
        'data-side',
        'The popup placement side (top, right, bottom or left) positions and orients the arrow.',
      ],
    ]) {
      const reference = new JSDOM(
        renderToStaticMarkup(
          React.createElement(window.ApiReference, { folder, kind: 'component', showStyling: true }),
        ),
      ).window.document;
      const row = [...reference.querySelectorAll('tbody tr')].find(
        (row) => row.querySelector('td')?.textContent === attribute,
      );
      assert.equal(row.lastElementChild.textContent, meaning);
    }
    const undocumented = new JSDOM(
      renderToStaticMarkup(
        React.createElement(window.ApiReference, { folder: 'Button', kind: 'component', showStyling: true }),
      ),
    ).window.document;
    assert.equal(
      undocumented.querySelector('table[aria-label="Button styling hooks"] tbody tr td:last-child').textContent,
      'Not documented.',
    );
  } finally {
    if (root) await act(async () => root.unmount());
    await server.close();
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.React;
    delete globalThis.location;
    delete globalThis.history;
    delete globalThis.localStorage;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
