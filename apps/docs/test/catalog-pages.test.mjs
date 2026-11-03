import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';
import { createServer } from 'vite';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

let context;
let cleanup;
after(async () => cleanup?.());

async function catalog(run) {
  if (context) return run(context);
  const dom = new JSDOM('', { url: 'http://localhost/' });
  const originals = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    React,
    location: dom.window.location,
    localStorage: dom.window.localStorage,
    HTMLElement: dom.window.HTMLElement,
    MutationObserver: dom.window.MutationObserver,
    Element: dom.window.Element,
    Node: dom.window.Node,
    getComputedStyle: dom.window.getComputedStyle,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const render = (section, props) => {
    dom.window.document.body.innerHTML = renderToStaticMarkup(React.createElement(dom.window.SECTIONS[section], props));
    return dom.window.document;
  };
  cleanup = async () => {
    await server.close();
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  };
  await server.ssrLoadModule('/src/catalog/kit.jsx');
  await server.ssrLoadModule('/src/catalog/api-reference.jsx');
  await server.ssrLoadModule('/src/catalog/library.jsx');
  await server.ssrLoadModule('/src/catalog/hooks.jsx');
  context = { server, render };
  await run(context);
}

test('the component index links every documented entry without live previews', async () => {
  await catalog(async ({ render, server }) => {
    const doc = render('ui-components');
    assert.equal(doc.querySelectorAll('[data-component-preview]').length, 0);
    assert.equal(doc.querySelectorAll('#ui-Select [role="combobox"]').length, 0);
    assert.equal(doc.querySelector('a[href="#ui-components/select"]').textContent.includes('Select'), true);
    const { UI_PAGES } = await server.ssrLoadModule('/src/catalog/item-inventory.js');
    assert.equal(doc.querySelectorAll('a[href^="#ui-components/"]').length, UI_PAGES.length);
  });
});

test('Foundations explains the opt-in base layer and its document and app-root hooks', async () => {
  await catalog(async ({ render, server }) => {
    await server.ssrLoadModule('/src/catalog/foundations.jsx');
    const doc = render('foundations');
    const text = doc.body.textContent;
    assert.match(text, /opt-in/i);
    assert.match(text, /@layer base/);
    assert.match(text, /utilities.*override/i);
    assert.match(text, /data-scroll-gutter="stable"/);
    assert.match(text, /Next\.js App Router/);
    assert.match(text, /data-app-root/);
    assert.match(text, /#root.*#__next/);
  });
});

test('Select has a single page heading, anatomy, examples, API and part-specific styling hooks', async () => {
  await catalog(async ({ render }) => {
    const doc = render('ui-components', { itemId: 'select' });
    assert.deepEqual(
      [...doc.querySelectorAll('h1')].map((h) => h.textContent),
      ['Select'],
    );
    assert.equal(doc.querySelector('h1').tabIndex, -1);
    assert.ok(doc.querySelector('a[href="#ui-components"]'));
    assert.match(doc.body.textContent, /import \{ Select \} from '@gntik-ai\/ui'/);
    for (const heading of ['Anatomy', 'Examples', 'Props', 'Keyboard', 'Accessibility', 'Styling hooks']) {
      assert.ok(
        [...doc.querySelectorAll('h2')].some((h) => h.textContent === heading),
        heading,
      );
    }
    const rows = [...doc.querySelectorAll('table[aria-label="Select styling hooks"] tbody tr')].map(
      (r) => r.textContent,
    );
    for (const [attribute, part] of [
      ['data-popup-open', 'trigger'],
      ['data-highlighted', 'item'],
      ['data-selected', 'item'],
      ['data-disabled', 'item'],
    ]) {
      assert.ok(
        rows.some((row) => row.includes(attribute) && row.includes(part)),
        `${attribute} ${part}`,
      );
    }
    const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    for (let i = 1; i < headings.length; i++) {
      assert.ok(
        Number(headings[i].tagName.slice(1)) <= Number(headings[i - 1].tagName.slice(1)) + 1,
        `heading order: ${headings[i].textContent}`,
      );
    }
    assert.ok(
      [...doc.querySelectorAll('h3')].some((h) => h.textContent === 'Select Basic'),
      'example headings sit below the Examples h2',
    );
    assert.equal(doc.querySelectorAll('#ui-Button').length, 0);
    const plain = render('ui-components', { itemId: 'badge' });
    assert.equal(plain.querySelectorAll('table[aria-label$="styling hooks"]').length, 0);
  });
});

test('gallery item pages render only the selected item, all layout frames and its API', async () => {
  await catalog(async ({ server, render }) => {
    await server.ssrLoadModule('/src/catalog/viewers.jsx');
    for (const [section, id, name] of [
      ['blocks', 'flow-builder', 'Flow builder'],
      ['templates', 'workflow-builder', 'Flow builder'],
      ['layouts', 'canvas-layout', 'CanvasLayout'],
    ]) {
      const doc = render(section, { itemId: id });
      assert.deepEqual(
        [...doc.querySelectorAll('h1')].map((h) => h.textContent),
        [name],
      );
      assert.equal(doc.querySelector('h1').tabIndex, -1);
      assert.ok(doc.querySelector(`a[href="#${section}"]`));
      const frames = [...doc.querySelectorAll('iframe')];
      assert.ok(frames.length > 0);
      assert.ok(frames.every((f) => f.src.includes(`id=${id}`)));
      if (section === 'layouts') {
        const { CATALOG } = await server.ssrLoadModule('/src/preview-registry.js');
        assert.equal(frames.length, CATALOG.layouts.filter((l) => l.layout === 'CanvasLayout').length);
        assert.match(doc.body.textContent, /CanvasLayoutProps/);
      }
    }
  });
});

test('the shared scrolling code surface is keyboard focusable', async () => {
  await catalog(async () => {
    document.body.innerHTML = renderToStaticMarkup(
      React.createElement(window.CodeBlock, { code: 'long code '.repeat(40), open: true }),
    );
    assert.equal(document.querySelector('pre').tabIndex, 0);
  });
});

test('every component page keeps the catalog heading hierarchy', async () => {
  await catalog(async ({ render, server }) => {
    const { UI_PAGES } = await server.ssrLoadModule('/src/catalog/item-inventory.js');
    for (const item of UI_PAGES) {
      const doc = render('ui-components', { itemId: item.id });
      const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
      assert.equal(headings[0].textContent, item.name);
      for (let i = 1; i < headings.length; i++) {
        assert.ok(
          Number(headings[i].tagName.slice(1)) <= Number(headings[i - 1].tagName.slice(1)) + 1,
          `${item.name}: ${headings[i - 1].tagName} ${headings[i - 1].textContent} → ${headings[i].tagName} ${headings[i].textContent}`,
        );
      }
    }
  });
});

test('component and utility pages show imports readers can use', async () => {
  await catalog(async ({ render }) => {
    for (const [id, names] of [
      ['choice-card', 'ClickableCard, SelectableCardGroup, SelectableCard'],
      ['resizable', 'ResizablePanelGroup, ResizablePanel, ResizeHandle'],
      ['toast', 'ToastProvider, Toaster, useToast'],
      ['match-text', 'matchText'],
      ['responsive', 'responsiveClasses'],
    ]) {
      const doc = render('ui-components', { itemId: id });
      assert.equal(doc.querySelector('pre code').textContent, `import { ${names} } from '@gntik-ai/ui'`, id);
    }
  });
});

test('the Hooks page lists every HookDoc with signature, server behaviour, a live example and source', async () => {
  await catalog(async ({ render, server }) => {
    const { HOOK_PAGES } = await server.ssrLoadModule('/src/catalog/item-inventory.js');
    assert.ok(HOOK_PAGES.length >= 11, `expected the hook docs, found ${HOOK_PAGES.length}`);
    const doc = render('ui-hooks');
    for (const page of HOOK_PAGES) {
      const { doc: hookDoc } = await server.ssrLoadModule(`/../../packages/ui/src/hooks/${page.folder}.doc.ts`);
      const section = doc.getElementById(`ui-${page.folder}`);
      assert.ok(section, `${page.name} has no entry on the Hooks page`);
      const text = section.textContent;
      assert.ok(text.includes(hookDoc.signature), `${page.name}: signature`);
      assert.ok(text.includes(hookDoc.server), `${page.name}: server behaviour`);
      assert.ok(section.querySelectorAll('[data-component-preview]').length >= 1, `${page.name}: live example`);
      assert.match(section.textContent, /from '@gntik-ai\/ui(\/hooks)?'/, `${page.name}: example source`);
      assert.ok(section.querySelector(`a[href="#ui-hooks/${page.id}"]`), `${page.name}: link to its page`);
    }
  });
});

test('every hook page imports from the hooks entry and keeps the heading hierarchy', async () => {
  await catalog(async ({ render, server }) => {
    const { HOOK_PAGES } = await server.ssrLoadModule('/src/catalog/item-inventory.js');
    for (const item of HOOK_PAGES) {
      const doc = render('ui-hooks', { itemId: item.id });
      const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
      assert.equal(headings[0].textContent, item.name);
      for (let i = 1; i < headings.length; i++) {
        assert.ok(
          Number(headings[i].tagName.slice(1)) <= Number(headings[i - 1].tagName.slice(1)) + 1,
          `${item.name}: ${headings[i - 1].tagName} ${headings[i - 1].textContent} → ${headings[i].tagName} ${headings[i].textContent}`,
        );
      }
      const importLine = doc.querySelector('pre code').textContent;
      assert.match(
        importLine,
        new RegExp(`^import \\{ [^}]*\\b${item.name}\\b[^}]* \\} from '@gntik-ai/ui/hooks'$`),
        item.name,
      );
    }
  });
});

test('hook docs are no longer listed with the components', async () => {
  await catalog(async ({ render }) => {
    const doc = render('ui-components');
    assert.equal(doc.querySelectorAll('a[href^="#ui-components/use-"]').length, 0);
  });
});

test('sidebar buttons navigate through section hashes', async () => {
  await catalog(async ({ server }) => {
    await server.ssrLoadModule('/src/catalog/registry.jsx');
    await server.ssrLoadModule('/src/catalog/catalog.jsx');
    const { createRoot } = require('react-dom/client');
    location.hash = '#ui-components';
    document.body.innerHTML = '<div id="root"></div>';
    const root = createRoot(document.querySelector('#root'));
    try {
      await React.act(async () => root.render(React.createElement(window.CatalogShell)));
      const button = [...document.querySelectorAll('aside nav button')].find((b) => b.textContent === 'Install');
      assert.ok(button, 'Install sidebar button');
      await React.act(async () => {
        button.click();
        await new Promise((resolve) => window.setTimeout(resolve, 30));
      });
      assert.equal(location.hash, '#install');
      assert.equal(document.querySelector('main h1').textContent, 'Install');
    } finally {
      await React.act(async () => root.unmount());
    }
  });
});
