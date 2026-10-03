// shadcn registry generator (scripts/build-shadcn-registry.ts): schema shape, dependency URLs,
// inlined file contents whose relative imports resolve after the copy, and --check mode.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../..');
const SCRIPT = path.resolve(here, '../scripts/build-shadcn-registry.ts');
const gen = await tsImport(SCRIPT, import.meta.url);
const BASE = 'https://registry.example.test';
const { files, warnings } = gen.build({ baseUrl: BASE });
const items = [...files].filter(([f]) => f !== 'registry.json').map(([, c]) => JSON.parse(c));
const byName = new Map(items.map((i) => [i.name, i]));
const kit = JSON.parse(fs.readFileSync(path.join(ROOT, 'kit-registry.json'), 'utf8'));

// Keys and enums of the shadcn 4.x registry-item schema (@shadcn/registry/schema, registryItemSchema).
const ITEM_KEYS = new Set(['$schema', 'extends', 'name', 'type', 'title', 'author', 'description', 'dependencies', 'devDependencies',
  'registryDependencies', 'files', 'tailwind', 'cssVars', 'css', 'envVars', 'meta', 'docs', 'categories']);
const ITEM_TYPES = new Set(['registry:lib', 'registry:block', 'registry:component', 'registry:ui', 'registry:hook', 'registry:page',
  'registry:file', 'registry:theme', 'registry:style', 'registry:item', 'registry:example', 'registry:internal']);
const FILE_KEYS = new Set(['path', 'content', 'type', 'target']);

test('one item per kit entry plus gntik-tokens, and an index', () => {
  assert.equal(items.length, kit.items.length + 1);
  for (const k of kit.items) assert.ok(byName.has(k.id), `missing ${k.id}`);
  assert.ok(files.has('registry.json'));
  assert.deepEqual(warnings, [], 'every relative import resolves inside the item closure');
});

test('items are shaped like registry-item.json', () => {
  for (const item of items) {
    for (const key of Object.keys(item)) assert.ok(ITEM_KEYS.has(key), `${item.name}: unexpected key ${key}`);
    assert.equal(item.$schema, 'https://ui.shadcn.com/schema/registry-item.json');
    assert.equal(typeof item.name, 'string');
    assert.ok(ITEM_TYPES.has(item.type), `${item.name}: type ${item.type}`);
    assert.ok(item.author.length >= 2);
    for (const list of ['dependencies', 'registryDependencies', 'categories']) {
      assert.ok(Array.isArray(item[list]) && item[list].every((s) => typeof s === 'string'), `${item.name}.${list}`);
    }
    for (const f of item.files) {
      for (const key of Object.keys(f)) assert.ok(FILE_KEYS.has(key), `${item.name}: file key ${key}`);
      assert.ok(ITEM_TYPES.has(f.type) && f.type !== 'registry:page' && f.type !== 'registry:file');
      assert.ok(f.target && !f.target.startsWith('/') && !f.target.includes('..'), `${item.name}: target ${f.target}`);
    }
    if (item.css) for (const [k, v] of Object.entries(item.css)) assert.ok(/^@import "[^"]+"$/.test(k) && typeof v === 'object');
  }
});

test('types follow the kit kind', () => {
  const kindOf = new Map(kit.items.map((i) => [i.id, i.kind]));
  for (const item of items) {
    const kind = kindOf.get(item.name);
    if (!kind) continue;
    assert.equal(item.type, kind === 'component' ? 'registry:ui' : 'registry:block', item.name);
  }
  assert.equal(byName.get('button').type, 'registry:ui');
  assert.equal(byName.get('kpi-row').type, 'registry:block');
});

test('gntik-tokens brings the token package, fonts and CSS imports; every item depends on it', () => {
  const tokens = byName.get(gen.TOKENS_ID);
  assert.equal(tokens.type, 'registry:theme');
  assert.ok(tokens.dependencies.includes('@gntik-ai/tokens'));
  assert.ok('@import "@gntik-ai/tokens/tailwind.css"' in tokens.css);
  assert.ok(tokens.docs.includes('@gntik-ai:registry=https://npm.pkg.github.com'));
  for (const item of items) {
    if (item.name === gen.TOKENS_ID) continue;
    assert.equal(item.registryDependencies[0], `${BASE}/r/${gen.TOKENS_ID}.json`, item.name);
  }
});

test('registryDependencies are URLs to sibling items', () => {
  const button = byName.get('button');
  assert.ok(button.registryDependencies.includes(`${BASE}/r/spinner.json`));
  assert.ok(button.registryDependencies.includes(`${BASE}/r/ui-utils.json`));
  for (const item of items) {
    for (const dep of item.registryDependencies) {
      const m = new RegExp(`^${BASE.replace(/\./g, '\\.')}/r/([a-z0-9-]+)\\.json$`).exec(dep);
      assert.ok(m, `${item.name}: ${dep}`);
      assert.ok(files.has(`${m[1]}.json`), `${item.name}: ${dep} has no file`);
    }
  }
});

test('npm dependencies carry version ranges, kit packages stay bare', () => {
  assert.ok(byName.get('button').dependencies.some((d) => /^@base-ui\/react@\^/.test(d)));
  assert.deepEqual(byName.get('kpi-row').dependencies, ['@gntik-ai/ui']);
  assert.deepEqual(byName.get('kpi-row').css, { '@import "@gntik-ai/ui/styles.css"': {} });
});

test('file contents are inlined and relative imports resolve to copied targets', () => {
  const SPEC = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.[^'"\n]*)\1/g;
  const targetsOf = (name, seen = new Set()) => {
    if (seen.has(name)) return seen;
    seen.add(name);
    for (const d of byName.get(name).registryDependencies) targetsOf(d.slice(d.lastIndexOf('/') + 1, -5), seen);
    return seen;
  };
  for (const item of items) {
    const reach = [...targetsOf(item.name)].flatMap((n) => byName.get(n).files.map((f) => f.target.replace(/\.(tsx?|css)$/, '')));
    const available = new Set(reach.flatMap((t) => (t.endsWith('/index') ? [t, t.slice(0, -6)] : [t])));
    for (const f of item.files) {
      assert.ok(typeof f.content === 'string' && f.content.length > 0, `${item.name}: ${f.target} empty`);
      for (const m of f.content.matchAll(SPEC)) {
        const to = path.posix.normalize(path.posix.join(path.posix.dirname(f.target), m[2].replace(/\.(tsx?|jsx?)$/, '')));
        // Imports inside code-sample strings (fixtures) are not modules; they never resolve on disk either.
        if (/^\s*\/\/|`/.test(f.content.slice(f.content.lastIndexOf('\n', m.index) + 1, m.index))) continue;
        assert.ok(available.has(to), `${item.name}: ${f.target} imports '${m[2]}' → ${to}, not copied`);
      }
    }
  }
  const cn = byName.get('ui-utils').files.find((f) => f.target === 'components/utils/cn.ts');
  assert.equal(cn.content, fs.readFileSync(path.join(ROOT, cn.path), 'utf8'));
  const btn = byName.get('button').files.find((f) => f.target === 'components/ui/button/Button.tsx');
  assert.match(btn.content, /from '\.\.\/spinner/);
  assert.doesNotMatch(btn.content, /from '\.\.\/Spinner/);
});

test('the index lists every item without file contents', () => {
  const index = JSON.parse(files.get('registry.json'));
  assert.equal(index.$schema, 'https://ui.shadcn.com/schema/registry.json');
  assert.equal(index.name, 'gntik-ui');
  assert.equal(index.homepage, BASE);
  assert.equal(index.items.length, items.length);
  for (const i of index.items) {
    assert.equal(i.$schema, undefined);
    assert.ok(i.files.every((f) => f.content === undefined && f.target));
  }
});

test('rejects a non-absolute base URL', () => {
  assert.throws(() => gen.build({ baseUrl: '/r' }), /absolute/);
});

test('sync writes, then check reports changed and stale files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shadcn-r-'));
  try {
    assert.equal(gen.sync(dir, files, false).length, files.size);
    assert.deepEqual(gen.sync(dir, files, true), []);
    fs.writeFileSync(path.join(dir, 'button.json'), '{}\n');
    fs.writeFileSync(path.join(dir, 'gone.json'), '{}\n');
    assert.deepEqual(gen.sync(dir, files, true).sort(), ['button.json', 'gone.json (stale)']);
    gen.sync(dir, files, false);
    assert.ok(!fs.existsSync(path.join(dir, 'gone.json')));
    assert.deepEqual(gen.sync(dir, files, true), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI --check exits 1 when stale and 0 when fresh', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shadcn-cli-'));
  const tsx = path.resolve(here, '../node_modules/.bin/tsx');
  const run = (...args) => spawnSync(tsx, [SCRIPT, '--out', dir, ...args], { env: { ...process.env, GNTIK_REGISTRY_BASE_URL: BASE }, encoding: 'utf8' });
  try {
    assert.equal(run('--check').status, 1);
    assert.equal(run().status, 0);
    const ok = run('--check');
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /up to date/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
