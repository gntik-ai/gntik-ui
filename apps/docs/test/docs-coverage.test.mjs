// The docs site is generated from source: a component's *.doc.ts and examples/ are picked up by
// import.meta.glob, and the sidebar comes from registry.jsx. This test fails when something that
// ships in a package (or in kit-registry.json) is not reachable from the docs app, so a new
// component, layout, block, template or entry point cannot be added without its page.
// Pure filesystem checks: no build, no browser. Run by `pnpm test`.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'apps/docs/src');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

test('the repaired component pages have no accessibility baseline suppressions', () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/docs/e2e/a11y-baseline.json'), 'utf8'));
  const repaired = /^(ChoiceCard|DiffViewer|Field|Textarea|ThemeProvider|Token|TokenInput|Toolbar)(?: |$)/;
  assert.deepEqual(
    Object.keys(baseline).filter((key) => repaired.test(key)),
    [],
  );
});

// ---- Known gaps ------------------------------------------------------------------------------------
// Shrink-only: a gap listed here is tolerated, a new one fails, and a listed gap that was closed must be
// removed (assertKnownGaps fails on stale entries), so this list can only get shorter.

/** Documented components that have no examples/ yet (no live preview on the page). */
const NO_EXAMPLES = ['packages/chat/src/ChatDemo', 'packages/ui/src/components/Spinner'];
/** Exported forms components with no <Name>.doc.ts yet (Form and FormField share FormField.tsx). */
const FORMS_WITHOUT_DOC = [];
/** kit-registry.json items that are not component folders, so they have no doc file. */
const REGISTRY_WITHOUT_DOC = ['theme', 'ui-utils'];

function assertKnownGaps(actual, known, label) {
  const unexpected = actual.filter((g) => !known.includes(g));
  assert.deepEqual(
    unexpected,
    [],
    `${label}: not reachable from the docs app. Add the doc/examples (see packages/ui/CONTRIBUTING.md) ` +
      `or, if it is a deliberate gap, list it in docs-coverage.test.mjs.`,
  );
  const stale = known.filter((g) => !actual.includes(g));
  assert.deepEqual(stale, [], `${label}: fixed, remove it from the known-gap list in docs-coverage.test.mjs.`);
}

// ---- Filesystem helpers ----------------------------------------------------------------------------
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.turbo']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const packageSources = fs
  .readdirSync(path.join(ROOT, 'packages'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, 'packages', e.name, 'src')))
  .flatMap((e) => walk(path.join(ROOT, 'packages', e.name, 'src')))
  .map(rel);

const dirs = (parent) =>
  fs
    .readdirSync(path.join(ROOT, parent), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

// ---- import.meta.glob patterns of the docs app ------------------------------------------------------
// Vite requires literal patterns, so they can be read from the source text. Patterns are resolved
// against the file that declares them, like Vite does, and compared with repo-relative paths.

function expandBraces(pattern) {
  const open = pattern.indexOf('{');
  if (open === -1) return [pattern];
  const close = pattern.indexOf('}', open);
  return pattern
    .slice(open + 1, close)
    .split(',')
    .flatMap((alt) => expandBraces(pattern.slice(0, open) + alt + pattern.slice(close + 1)));
}

function globToRegExp(pattern) {
  // `**/` spans directories, `*` stays inside one path segment; everything else is literal.
  const source = pattern
    .split(/(\*\*\/|\*)/)
    .map((part) => {
      if (part === '**/') return '(?:.*/)?';
      if (part === '*') return '[^/]*';
      return part.replace(/[.+^$()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${source}$`);
}

function globsOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  const patterns = [];
  for (const call of text.matchAll(/import\.meta\.glob\(\s*(\[[^\]]*\]|'[^']*'|"[^"]*")/g)) {
    for (const literal of call[1].matchAll(/'([^']*)'|"([^"]*)"/g)) patterns.push(literal[1] ?? literal[2]);
  }
  return patterns
    .flatMap(expandBraces)
    .map((p) => rel(path.resolve(path.dirname(file), p)))
    .map((p) => ({ pattern: p, test: globToRegExp(p) }));
}

const catalogDir = path.join(SRC, 'catalog');
const pageFiles = [
  ...fs
    .readdirSync(catalogDir)
    .filter((f) => f.endsWith('.jsx'))
    .map((f) => path.join(catalogDir, f)),
  path.join(SRC, 'preview-registry.js'),
];
const pageGlobs = pageFiles.flatMap(globsOf); // what the pages render
const apiGlobs = globsOf(path.join(SRC, 'api-docs.js')); // what the API reference is built from

const reachedBy = (globs, file) => globs.some((g) => g.test.test(file));

test('the glob reader finds the patterns the docs app declares', () => {
  assert.ok(pageGlobs.length >= 10, `expected many import.meta.glob patterns, found ${pageGlobs.length}`);
  assert.ok(reachedBy(pageGlobs, 'packages/ui/src/components/Button/Button.doc.ts'), 'ui component docs');
  assert.ok(reachedBy(pageGlobs, 'packages/blocks/src/data-display/ActivityFeed/block.meta.ts'), 'block metas');
  assert.ok(!reachedBy(pageGlobs, 'packages/ui/src/components/Button/Button.tsx'), 'component sources are not docs');
});

// ---- Every doc / meta file is rendered ---------------------------------------------------------------
const docFiles = packageSources.filter((f) => f.endsWith('.doc.ts'));
const metaFiles = packageSources.filter((f) => /\/(block|template)\.meta\.ts$/.test(f));

test('every *.doc.ts in a package is rendered on a docs page', () => {
  assert.ok(docFiles.length > 100, `expected the component docs, found ${docFiles.length}`);
  const missing = docFiles.filter((f) => !reachedBy(pageGlobs, f));
  assert.deepEqual(
    missing,
    [],
    'no import.meta.glob in apps/docs/src renders these docs: add a glob (catalog/*.jsx or preview-registry.js)',
  );
});

test('every block.meta.ts and template.meta.ts is rendered on a docs page', () => {
  assert.ok(metaFiles.length > 100, `expected block and template metas, found ${metaFiles.length}`);
  const missing = metaFiles.filter((f) => !reachedBy(pageGlobs, f));
  assert.deepEqual(missing, [], 'no import.meta.glob in apps/docs/src renders these metas');
});

test('every *.doc.ts also feeds the generated API reference', () => {
  const missing = docFiles.filter((f) => !reachedBy(apiGlobs, f));
  assert.deepEqual(missing, [], 'add a glob for these docs in apps/docs/src/api-docs.js');
});

// ---- Every component folder is documented, with a live preview ------------------------------------------
// Folders that ship components: ui components and layouts, and the chat pack (not hooks or helpers).
const componentFolders = [
  ...dirs('packages/ui/src/components').map((d) => `packages/ui/src/components/${d}`),
  ...dirs('packages/ui/src/layouts').map((d) => `packages/ui/src/layouts/${d}`),
  ...dirs('packages/chat/src')
    .filter((d) => /^[A-Z]/.test(d))
    .map((d) => `packages/chat/src/${d}`),
];

test('every component folder has a <Name>.doc.ts', () => {
  assert.ok(componentFolders.length > 100);
  const missing = componentFolders.filter((f) => !docFiles.includes(`${f}/${path.basename(f)}.doc.ts`));
  assert.deepEqual(missing, [], 'add <Name>.doc.ts (packages/ui/CONTRIBUTING.md): the docs page is built from it');
});

test('every documented component has examples with a live preview', () => {
  const hasPreview = (folder) =>
    packageSources.some(
      (f) =>
        f.startsWith(`${folder}/examples/`) &&
        f.endsWith('.tsx') &&
        /export\s+default\s/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')),
    );
  assertKnownGaps(
    componentFolders.filter((f) => !hasPreview(f)),
    NO_EXAMPLES,
    'component without examples/*.tsx (default export)',
  );
});

// ---- Entry points ----------------------------------------------------------------------------------------
test('@gntik-ai/ui/forms: every exported component is documented, and its examples are rendered', () => {
  const sources = packageSources.filter((f) => /^packages\/ui\/src\/forms\/[A-Z][A-Za-z]+\.tsx$/.test(f));
  assert.ok(sources.length > 0, 'expected component files in packages/ui/src/forms');
  const undocumented = sources
    .map((f) => path.basename(f, '.tsx'))
    .filter((name) => !docFiles.includes(`packages/ui/src/forms/${name}.doc.ts`));
  assertKnownGaps(undocumented, FORMS_WITHOUT_DOC, 'forms component without a doc');

  const examples = packageSources.filter((f) => f.startsWith('packages/ui/src/forms/examples/'));
  assert.ok(examples.length > 0, 'forms has no examples/');
  assert.deepEqual(
    examples.filter((f) => !reachedBy(pageGlobs, f)),
    [],
    'forms examples are not read by a docs page',
  );
});

test('@gntik-ai/chat: every folder exported from the entry point is documented and reachable', () => {
  const index = fs.readFileSync(path.join(ROOT, 'packages/chat/src/index.ts'), 'utf8');
  const exported = [...index.matchAll(/export \* from '\.\/([A-Za-z]+)'/g)].map((m) => m[1]);
  assert.ok(exported.length >= 12, `expected the chat folders in index.ts, found ${exported.length}`);
  for (const folder of exported.filter((d) => /^[A-Z]/.test(d))) {
    assert.ok(
      docFiles.includes(`packages/chat/src/${folder}/${folder}.doc.ts`),
      `chat/${folder} is exported but has no ${folder}.doc.ts`,
    );
    assert.ok(
      reachedBy(pageGlobs, `packages/chat/src/${folder}/${folder}.doc.ts`),
      `chat/${folder}.doc.ts is not rendered by a docs page`,
    );
  }
});

// ---- kit-registry.json (what the CLI and MCP install) ----------------------------------------------------
const kit = JSON.parse(fs.readFileSync(path.join(ROOT, 'kit-registry.json'), 'utf8')).items;

test('every installable item has a doc or meta that a docs page renders', () => {
  assert.ok(kit.length > 200, `expected the whole kit, found ${kit.length}`);
  const withoutDoc = kit.filter((i) => !i.docs).map((i) => i.id);
  assertKnownGaps(withoutDoc, REGISTRY_WITHOUT_DOC, 'kit-registry item without docs');

  const orphans = kit.filter((i) => i.docs && !reachedBy(pageGlobs, i.docs)).map((i) => `${i.kind}:${i.id}`);
  assert.deepEqual(orphans, [], 'installable items whose doc/meta no docs page renders');
  const missingFiles = kit.filter((i) => i.docs && !fs.existsSync(path.join(ROOT, i.docs))).map((i) => i.id);
  assert.deepEqual(missingFiles, [], 'kit-registry.json points at docs that do not exist (run pnpm registry)');
});

// ---- The catalog inventory (sidebar, counter, visual tests) ---------------------------------------------------
const registryText = fs.readFileSync(path.join(catalogDir, 'registry.jsx'), 'utf8');
const inventoryIds = [...registryText.matchAll(/\{\s*id:\s*'([a-z0-9-]+)'\s*,\s*label:/g)].map((m) => m[1]);

test('every inventory item has a section registered in window.SECTIONS', () => {
  assert.ok(inventoryIds.length > 50, `expected the inventory ids, found ${inventoryIds.length}`);
  // window.SECTIONS['id'] = X, or window.SECTIONS.id = X for single-word ids.
  const registrations = /SECTIONS(?:\[\s*'([a-z0-9-]+)'\s*\]|\.([a-z0-9]+))\s*=[^=]/g;
  const registered = new Set(
    pageFiles.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(registrations)]).map((m) => m[1] ?? m[2]),
  );
  const missing = inventoryIds.filter((id) => !registered.has(id));
  assert.deepEqual(missing, [], 'registry.jsx lists items that no catalog file registers (the page would be blank)');
});

test('the sidebar blurb for layouts names the real number of layouts', () => {
  const words = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
  ];
  const blurb = registryText.match(/id:\s*'layouts'[^\n]*blurb:\s*'(\w+) page layouts/);
  assert.ok(blurb, "the 'layouts' blurb should start with the count, e.g. 'Twelve page layouts'");
  const layouts = docFiles.filter((f) => /^packages\/ui\/src\/layouts\/[A-Za-z]+\/[A-Za-z]+\.doc\.ts$/.test(f)).length;
  assert.equal(
    words.indexOf(blurb[1].toLowerCase()),
    layouts,
    `the layouts blurb says "${blurb[1]}" but packages/ui/src/layouts has ${layouts}`,
  );
});
