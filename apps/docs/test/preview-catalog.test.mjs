import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';

test('block gallery lists installable blocks while Spanish PageHeader remains previewable', async () => {
  const { createServer } = await import('vite');
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { CATALOG, PREVIEW_LOADERS, loadSource } = await server.ssrLoadModule('/src/preview-registry.js');
    const registry = JSON.parse(readFileSync(new URL('../../../kit-registry.json', import.meta.url), 'utf8'));
    assert.deepEqual(
      CATALOG.blocks.map(({ id }) => id).sort(),
      registry.items
        .filter(({ kind }) => kind === 'block')
        .map(({ id }) => id)
        .sort(),
    );
    const preview = await PREVIEW_LOADERS.block['page-header--spanish']();
    assert.equal(typeof preview.default, 'function');
    const wrap = await PREVIEW_LOADERS.block['log-viewer--wrap']();
    assert.equal(typeof wrap.default, 'function');
    const wrapSource = await loadSource('../../../packages/blocks/src/builders/LogViewer/examples/Wrap.tsx');
    assert.match(wrapSource, /\bwrap\b/);
    const source = await loadSource('../../../packages/blocks/src/page-chrome/PageHeader/examples/Spanish.tsx');
    assert.match(source, /I18nProvider locale="es"/);
  } finally {
    await server.close();
  }
});

test('scheduling locale and display-zone previews have distinct frame titles and control names', async () => {
  const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
  const { JSDOM } = require('jsdom');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { createServer } = await import('vite');
  const dom = new JSDOM();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalReact = Object.getOwnPropertyDescriptor(globalThis, 'React');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
  Object.defineProperty(globalThis, 'React', { configurable: true, value: React });
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    await server.ssrLoadModule('/src/catalog/kit.jsx');
    await server.ssrLoadModule('/src/catalog/viewers.jsx');
    dom.window.document.body.innerHTML = renderToStaticMarkup(React.createElement(dom.window.SECTIONS.blocks));
    for (const id of ['month-calendar', 'week-calendar', 'agenda-list']) {
      const article = dom.window.document.querySelector(`[aria-labelledby="block-${id}-t"]`);
      const titles = [...article.querySelectorAll('iframe')].map((frame) => frame.title);
      assert.equal(titles.length, 3);
      assert.equal(new Set(titles).size, 3, `${id} frame titles must be unique`);
      const labels = [...article.querySelectorAll('[role="group"]')].map((group) => group.getAttribute('aria-label'));
      assert.equal(new Set(labels).size, labels.length, `${id} control groups must have distinct names`);
      assert.deepEqual(
        [...article.querySelectorAll('h4')].map((heading) => heading.textContent),
        ['Locale defaults', 'Display time zone'],
      );
    }
  } finally {
    await server.close();
    dom.window.close();
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else delete globalThis.document;
    if (originalReact) Object.defineProperty(globalThis, 'React', originalReact);
    else delete globalThis.React;
  }
});
