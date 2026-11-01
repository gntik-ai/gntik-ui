import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

test('the chat integration guide does not add a component section to the catalog', async () => {
  const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
  const { JSDOM } = require('jsdom');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const dom = new JSDOM('', { url: 'http://localhost/' });
  const originals = new Map();
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, React })) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    await server.ssrLoadModule('/src/catalog/kit.jsx');
    const { default: ChatRuntimeGuide } = await server.ssrLoadModule('/src/catalog/chat-runtime.jsx');
    dom.window.document.body.innerHTML = renderToStaticMarkup(
      React.createElement('main', null, React.createElement(ChatRuntimeGuide)),
    );
    assert.equal(dom.window.document.querySelectorAll('main section[id^="chat-"]').length, 0);
    assert.equal(dom.window.document.querySelectorAll('main section').length, 1);
    assert.ok(
      dom.window.document.querySelector('iframe[src="/preview.html?kind=template&id=assistant-chat--adapter"]'),
    );
    assert.equal(dom.window.document.querySelector('main h2').textContent, 'Chat runtime');
  } finally {
    await server.close();
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
