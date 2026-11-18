import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';

test('compiled focus utilities resolve the focus colour on the focused element for nested theme scopes', async () => {
  const base = fileURLToPath(new URL('..', import.meta.url));
  const compiler = await compile(
    '@import "./node_modules/tailwindcss/index.css"; @import "../../packages/tokens/src/tailwind.css";',
    {
      base,
      async loadStylesheet(id, directory) {
        const file = path.resolve(directory, id);
        return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
      },
    },
  );
  const css = compiler.build(['focus-ring', 'focus-ring-inset']);
  for (const utility of ['focus-ring', 'focus-ring-inset']) {
    const rule = new RegExp(`\\.${utility}(?::focus-visible|\\s*\\{\\s*&:focus-visible)\\s*\\{([^}]+)\\}`).exec(css);
    assert.ok(rule, `${utility}: compiled keyboard selector`);
    assert.match(rule[1], /--color-focus-ring:\s*hsl\(var\(--focus-ring\)\);/);
    assert.match(rule[1], /outline-color:\s*var\(--color-focus-ring\);/);
  }
});

test('an overflowing SidebarLayout main retains a solid inset outline when keyboard focused', async () => {
  const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/', pretendToBeVisual: true });
  const originals = new Map();
  const setGlobal = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };
  for (const key of ['window', 'document', 'navigator', 'Node', 'Element', 'HTMLElement', 'MutationObserver'])
    setGlobal(key, dom.window[key]);
  setGlobal('getComputedStyle', dom.window.getComputedStyle.bind(dom.window));
  setGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  dom.window.matchMedia = (media) => ({ media, matches: false, addEventListener() {}, removeEventListener() {} });
  Object.defineProperties(dom.window.HTMLElement.prototype, {
    scrollHeight: { configurable: true, get: () => 300 },
    clientHeight: { configurable: true, get: () => 100 },
  });
  setGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const { getByRole } = require('@testing-library/react');
  const root = createRoot(dom.window.document.getElementById('root'));
  try {
    const { SidebarLayout } = await import('../../../packages/ui/dist/index.js');
    await React.act(async () =>
      root.render(React.createElement(SidebarLayout, { sidebar: null, collapsible: false }, 'Static content')),
    );
    const main = getByRole(dom.window.document.body, 'main', { name: 'Main content' });
    assert.equal(main.tabIndex, 0);
    const base = fileURLToPath(new URL('..', import.meta.url));
    const compiler = await compile(
      '@import "./node_modules/tailwindcss/theme.css" reference; @import "../../packages/tokens/src/tailwind.css"; @tailwind utilities;',
      {
        base,
        async loadStylesheet(id, directory) {
          const file = path.resolve(directory, id);
          return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
        },
      },
    );
    const docsRequire = createRequire(new URL('../package.json', import.meta.url));
    const { optimize } = createRequire(docsRequire.resolve('@tailwindcss/vite'))('@tailwindcss/node');
    const style = dom.window.document.createElement('style');
    // Flatten Tailwind's nested selectors as the docs build does, using the rendered public component's classes.
    style.textContent = optimize(compiler.build([...main.classList])).code;
    dom.window.document.head.append(style);
    const { default: userEvent } = require('@testing-library/user-event');
    const user = userEvent.setup({ document: dom.window.document });
    getByRole(dom.window.document.body, 'button', { name: 'Open navigation' }).focus();
    await user.tab();
    assert.equal(dom.window.document.activeElement === main, true);
    assert.equal(main.matches(':focus-visible'), true);
    // jsdom caches selectors read by user-event before Tab; invalidate them after focus changes.
    main.setAttribute('class', main.className);
    const computed = dom.window.getComputedStyle(main);
    // jsdom preserves var() in computed properties; resolve this one custom property from its real cascade.
    const outlineStyle = computed.outlineStyle.replace(/var\((--[\w-]+)\)/g, (_, name) =>
      computed.getPropertyValue(name).trim(),
    );
    assert.equal(outlineStyle, 'solid');
    assert.equal(computed.outlineWidth, '2px');
    assert.equal(computed.outlineOffset, '-2px');
  } finally {
    React.act(() => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
