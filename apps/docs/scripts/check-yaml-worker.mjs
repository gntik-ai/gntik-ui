import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Worker as Thread } from 'node:worker_threads';
// Run after the production docs build; only browser/worker boundaries are shimmed.
const root = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(`${root}/packages/editor/package.json`);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('', {
  url: 'http://localhost:4173',
  pretendToBeVisual: true,
});
for (const name of [
  'customElements',
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLCanvasElement',
  'MutationObserver',
  'MouseEvent',
  'UIEvent',
  'KeyboardEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
])
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: typeof dom.window[name] === 'function' ? dom.window[name].bind(dom.window) : dom.window[name],
  });
globalThis.CSS = { escape: (value) => value };
globalThis.self = globalThis;
window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
// Bundled modulepreload fetches and stylesheet load events are browser boundaries.
globalThis.fetch = async (url) => {
  assert.equal(
    new URL(url, 'http://localhost:4173').origin === 'http://localhost:4173' || new URL(url).protocol === 'file:',
    true,
    'No external requests',
  );
  return new Response('');
};
new MutationObserver(() => {
  for (const link of document.querySelectorAll('link')) link.dispatchEvent(new dom.window.Event('load'));
}).observe(document.head, { childList: true });
const threads = [];
const received = [];
globalThis.Worker = class {
  constructor(url) {
    const asset = new URL(url, 'http://localhost:4173').pathname.split('/').pop();
    const workerFile = pathToFileURL(`${root}/apps/docs/dist/assets/${asset}`).href;
    const thread = new Thread(
      `
      const { parentPort } = require('node:worker_threads');
      globalThis.self = globalThis;
      globalThis.postMessage = data => parentPort.postMessage(data);
      globalThis.addEventListener = (type, listener) => {
        if (type === 'message') parentPort.on('message', data => listener({data}));
      };
      globalThis.removeEventListener = () => {};
      globalThis.fetch = () => { throw new Error('Remote schema requests are forbidden'); };
      import(${JSON.stringify(workerFile)}).then(() => {
        parentPort.on('message', data => globalThis.onmessage?.({data}));
      });
    `,
      { eval: true },
    );
    this.thread = thread;
    this.listeners = new Map();
    thread.on('message', (data) => {
      received.push(data);
      this.onmessage?.({ data });
      for (const listener of this.listeners.get('message') ?? []) listener({ data });
    });
    thread.on('error', (error) => {
      this.onerror?.(error);
      for (const listener of this.listeners.get('error') ?? []) listener(error);
    });
    threads.push(thread);
  }
  postMessage(data) {
    this.thread.postMessage(data);
  }
  addEventListener(type, listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  removeEventListener(type, listener) {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((l) => l !== listener),
    );
  }
  terminate() {
    return this.thread.terminate();
  }
};
const errors = [];
process.on('unhandledRejection', (error) => errors.push(String(error)));
const manifest = JSON.parse(readFileSync(`${root}/apps/docs/dist/.vite/manifest.json`));
const { yamlLoader } = await import(
  pathToFileURL(`${root}/apps/docs/dist/${manifest['src/examples/yaml-loader.js'].file}`)
);
const monaco = await yamlLoader();
const labels = [];
const getWorker = globalThis.MonacoEnvironment.getWorker;
globalThis.MonacoEnvironment.getWorker = (id, label) => {
  labels.push(label);
  return getWorker(id, label);
};
const model = monaco.editor.createModel('count: wrong\n', 'yaml');
const diagnostic = await new Promise((resolve) => {
  const subscription = monaco.editor.onDidChangeMarkers(() => {
    const marker = monaco.editor.getModelMarkers({ resource: model.uri }).find((m) => m.message.includes('integer'));
    if (marker) {
      subscription.dispose();
      resolve(marker);
    }
  });
  setTimeout(() => {
    subscription.dispose();
    resolve(null);
  }, 5000);
});
try {
  assert.ok(
    diagnostic,
    `Expected an integer schema diagnostic, got ${JSON.stringify(monaco.editor.getModelMarkers({ resource: model.uri }))}; errors: ${errors}`,
  );
  assert.deepEqual(errors, [], 'Language-service errors must not be swallowed');
  assert.ok(labels.includes('yaml'), 'Validation must use getWorker with label yaml');
  assert.ok(JSON.stringify(received).includes('integer'), 'Diagnostic must arrive from a real worker');
  console.log('PASS: integer schema diagnostic from the bundled YAML worker');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  model.dispose();
  await Promise.all(threads.map((thread) => thread.terminate()));
  dom.window.close();
}
process.exit(process.exitCode ?? 0);
