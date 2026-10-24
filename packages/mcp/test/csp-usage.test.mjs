import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { filterKit, loadKit, usageOf } from '../dist/kit.js';

const root = fileURLToPath(new URL('../../..', import.meta.url));

test('PrintLayout keeps its invoice as the canonical usage after adding the CSP preview', () => {
  const item = loadKit(root).byId.get('print-layout');
  assert.ok(item);
  const usage = usageOf(root, item);
  assert.equal(path.posix.basename(usage.file), 'PrintLayoutInvoice.tsx');
  assert.match(usage.code, /export default function PrintLayoutInvoice/);
});

test('CSPProvider and useCSP are discoverable as an installable kit item', () => {
  const kit = loadKit(root);
  const item = kit.byId.get('csp-provider');
  assert.ok(item);
  assert.equal(item.package, '@gntik-ai/ui');
  assert.equal(item.docs, 'packages/ui/src/csp/CSPProvider.doc.ts');
  assert.ok(item.files.some(({ path }) => path === 'packages/ui/src/csp/CSPProvider.tsx'));
  assert.ok(filterKit(kit.items, { query: 'useCSP' }).some(({ id }) => id === 'csp-provider'));
});
