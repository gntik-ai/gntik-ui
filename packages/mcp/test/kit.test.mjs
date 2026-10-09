/* Kit tools (kit-registry.json) against the REAL monorepo, through an in-memory MCP client. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadIndex } from '../dist/indexer.js';
import { buildServer } from '../dist/server.js';
import { loadKit, parseDocInfo, filterKit, exportNameOf, hasRequiredProps, toPackageImports } from '../dist/kit.js';
import { scaffoldPage, scaffoldPreset, svgToJsx } from '../dist/scaffold.js';
import { validatePage } from '../dist/validate.js';

const ROOT = process.env.GNTIK_UI_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const index = loadIndex(ROOT, { source: 'dir' });
const kit = loadKit(ROOT);
const client = new Client({ name: 'kit-test', version: '0.0.0' });
const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return r.content.map((c) => c.text ?? '').join('\n');
};
const fenced = (md) => /```tsx\n([\s\S]*?)\n```/.exec(md)?.[1] ?? '';

before(async () => {
  const server = buildServer({ getIndex: () => index, sync: async () => ({ root: ROOT, source: 'dir', stats: index.stats }) });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
});
after(() => client.close());

test('kit: registry loads every kind', () => {
  for (const kind of ['component', 'layout', 'block', 'template']) {
    assert.ok(kit.items.some((i) => i.kind === kind), `kit has ${kind}s`);
  }
  assert.equal(kit.byId.get('button')?.package, '@gntik-ai/ui');
});

test('kit: doc parsing reads keyboard, tokens, uses and template blocks', () => {
  const info = parseDocInfo(`export const doc = { name: 'X', primitive: '@base-ui/react/x', keyboard: [['Enter', 'Opens [it]'], ["Esc", 'Closes']], tokens: ['primary', 'border'] };`);
  assert.equal(info.primitive, '@base-ui/react/x');
  assert.deepEqual(info.keyboard, [['Enter', 'Opens [it]'], ['Esc', 'Closes']]);
  assert.deepEqual(info.tokens, ['primary', 'border']);
  const tpl = parseDocInfo(`export const meta = { layout: 'SidebarLayout + Page', blocks: ['kpi-row', 'chart-card'], uses: [] };`);
  assert.equal(tpl.layout, 'SidebarLayout + Page');
  assert.deepEqual(tpl.blocks, ['kpi-row', 'chart-card']);
});

test('kit: export names, required props and example import rewriting', () => {
  assert.equal(exportNameOf(ROOT, kit.byId.get('home-dashboard')), 'HomeDashboardPage');
  assert.equal(exportNameOf(ROOT, kit.byId.get('kpi-row')), 'KpiRow');
  assert.equal(exportNameOf(ROOT, kit.byId.get('inline-edit-row')), 'InlineEditTable', 'a block whose main export needs props falls back to a bare one');
  assert.ok(hasRequiredProps('export interface AProps {\n  row: T;\n  b?: string;\n}', 'A'));
  assert.ok(!hasRequiredProps('export interface AProps {\n  b?: string;\n  /** x: y */\n}', 'A'));
  assert.equal(
    toPackageImports("import { X } from '../X';\nimport { Bot } from 'lucide-react';", '@gntik-ai/ui'),
    "import { X } from '@gntik-ai/ui';\nimport { Bot } from '@gntik-ai/icons';",
  );
});

test('list_kit: filters by kind, group and query', async () => {
  const blocks = await call('list_kit', { kind: 'block' });
  assert.match(blocks, /`kpi-row`/);
  assert.doesNotMatch(blocks, /`home-dashboard`/);
  const settings = await call('list_kit', { kind: 'template', group: 'Settings' });
  assert.match(settings, /`settings-members`/);
  assert.doesNotMatch(settings, /`sign-in`/);
  const q = filterKit(kit.items, { query: 'sign in' });
  assert.ok(q.some((i) => i.id === 'sign-in'), 'query matches');
  assert.match(await call('list_kit', { query: 'zzzz-nothing' }), /No kit items match/);
});

test('get_component: kit component with keyboard, usage and source; legacy ids still work', async () => {
  const md = await call('get_component', { id: 'Button' });
  assert.match(md, /`@gntik-ai\/ui`/);
  assert.match(md, /\| Enter \|/);
  assert.match(md, /from '@gntik-ai\/ui'/, 'usage imports rewritten to the package');
  assert.match(md, /### packages\/ui\/src\/components\/Button\/Button\.tsx/, 'source included');
  const lean = await call('get_component', { id: 'button', include_source: false });
  assert.doesNotMatch(lean, /### packages\//);
  const layout = await call('get_component', { id: 'auth-layout' });
  assert.match(layout, /AuthLayout/);
  const legacy = await call('get_component', { id: 'buttons' });
  assert.match(legacy, /Canonical code/);
  assert.match(await call('get_component', { id: 'nope-nothing' }), /No component/);
});

test('get_block: metadata, composed components, deps and source', async () => {
  const md = await call('get_block', { id: 'kpi-row' });
  assert.match(md, /\*\*Composes:\*\*/);
  assert.match(md, /import \{ KpiRow \} from '@gntik-ai\/blocks'/);
  assert.match(md, /### packages\/blocks\/src\/data-display\/KpiRow\/KpiRow\.tsx/);
  assert.match(await call('get_block', { id: 'kpi' }), /Did you mean .*kpi-row/);
});

test('get_template: layout, blocks, console shell and source', async () => {
  const md = await call('get_template', { id: 'home-dashboard' });
  assert.match(md, /\*\*Layout:\*\*/);
  assert.match(md, /`kpi-row`/);
  assert.match(md, /\*\*Console shell:\*\* yes/);
  assert.match(md, /### packages\/templates\/src\/home-dashboard\/Page\.tsx/);
  assert.match(await call('get_template', { id: 'sign-in', include_source: false }), /\*\*Console shell:\*\* no/);
});

test('public-hub: Auth template lists its composition, props, keyboard and examples', async () => {
  const listing = await call('list_kit', { kind: 'template' });
  assert.match(listing, /`public-hub`/);
  const item = kit.byId.get('public-hub');
  assert.equal(item.kind, 'template');
  assert.equal(item.group, 'Auth');
  const documentation = await call('get_template', { id: 'public-hub', include_source: false });
  for (const text of [
    '**Layout:** AuthLayout', '`page-header`', 'instead of landing',
    '**ARIA pattern:**', '## Keyboard', '| Tab / Shift+Tab |', '| Enter |',
    'PublicHubPage', 'Skip to main content',
  ]) assert.ok(documentation.includes(text), `catalogue includes ${text}`);
  for (const prop of [
    'eyebrow', 'title', 'description', 'cards', 'primaryAction', 'secondaryAction',
    'tertiaryLink', 'footer', 'loading', 'logo', 'loadingLabel',
  ]) assert.ok(documentation.includes(`| ${prop} |`), `documents ${prop}`);
  for (const theme of ['dark', 'light', 'high_contrast']) {
    assert.ok(documentation.includes(`defaultMode="${theme}"`), `example for ${theme}`);
  }
});

test('pending-activation: discoverable Auth template with documented prop source', async () => {
  const listing = await call('list_kit', { kind: 'template', group: 'Auth' });
  assert.match(listing, /`pending-activation`/);
  const item = kit.byId.get('pending-activation');
  assert.equal(item.kind, 'template');
  assert.equal(item.group, 'Auth');
  assert.equal(item.status, 'beta');
  assert.match(item.description, /approval or activation/);
  assert.match(item.description, /verify-email/);
  const response = await call('get_template', { id: 'pending-activation' });
  assert.match(response, /AuthLayout/);
  assert.match(response, /`inline-callout`/);
  assert.match(response, /`error-panel`/);
  assert.match(response, /### packages\/templates\/src\/pending-activation\/Page\.tsx/);
  assert.match(response, /export interface PendingActivationPageProps/);
  const props = /export interface PendingActivationPageProps \{([\s\S]*?)\n\}/.exec(response)?.[1];
  assert.ok(props, 'get_template returns the public prop interface');
  for (const line of props.split('\n').filter((line) => /^ {2}\w+\??:/.test(line))) {
    const offset = props.indexOf(line);
    assert.match(props.slice(0, offset), /\/\*\*[\s\S]*?\*\/\s*$/, `doc comment for ${line.trim()}`);
  }
  assert.match(props, /recoveryLinks: readonly/);
});

test('scaffold_page: template → page with the shell prop', async () => {
  const md = await call('scaffold_page', { template: 'resource-index', route: '/projects' });
  const code = fenced(md);
  assert.match(code, /import \{ ResourceIndexPage, type ConsoleShellProps \} from '@gntik-ai\/templates'/);
  assert.match(code, /currentHref: '\/projects'/);
  assert.match(code, /<ResourceIndexPage shell=\{shell\} \/>/);
  const auth = fenced(await call('scaffold_page', { template: 'sign-in' }));
  assert.doesNotMatch(auth, /shell/);
  assert.equal(validatePage(code).errors, 0);
});

test('scaffold_page: blocks + layout', async () => {
  const s = scaffoldPage(kit, { blocks: ['app-sidebar', 'page-header', 'kpi-row', 'data-table'], route: '/projects' });
  assert.ok(s.ok);
  assert.match(s.code, /import \{ DataTable, KpiRow, PageHeader \} from '@gntik-ai\/blocks'/);
  assert.match(s.code, /<ConsoleShell currentHref="\/projects">/);
  assert.match(s.code, /<Page width="wide" header=\{<PageHeader \/>\}>/);
  assert.doesNotMatch(s.code, /AppSidebar/, 'ConsoleShell already renders the sidebar');
  assert.equal(validatePage(s.code).errors, 0);
  const auth = scaffoldPage(kit, { blocks: ['sign-in-form'] });
  assert.match(auth.code, /<AuthLayout fullScreen>/, 'auth blocks infer the auth layout');
  assert.match(await call('scaffold_page', { blocks: ['kpi-row'], layout: 'wizard-layout' }), /Unsupported layout/);
  assert.match(await call('scaffold_page', { blocks: ['nope'] }), /Unknown block/);
  assert.match(await call('scaffold_page', {}), /Pass `template`/);
});

test('scaffold_preset: monogram and converted SVG with token colours', async () => {
  const md = await call('scaffold_preset', { name: 'Acme Cloud' });
  const code = fenced(md);
  assert.match(code, /export const acmeCloudPreset: BrandPreset = \{/);
  assert.match(code, /id: 'acme-cloud'/);
  assert.match(code, /className="fill-chrome"/);
  assert.equal(validatePage(code).errors, 0);
  const svg = scaffoldPreset({
    name: 'Orbit',
    svg: '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>x</title><rect width="24" height="24" fill="#0C2017"/><path fill-rule="evenodd" class="st0" fill="#33CE73" d="M1 1h4"/></svg>',
  });
  assert.match(svg.code, /viewBox="0 0 24 24"/);
  assert.match(svg.code, /fillRule="evenodd"/);
  assert.match(svg.code, /className="fill-primary"/);
  assert.doesNotMatch(svg.code, /#33CE73|<title>|class=|st0/);
  assert.equal(validatePage(svg.code).errors, 0, 'tokenised artwork passes the brand validator');
  const kept = scaffoldPreset({ name: 'Orbit', svg: '<svg viewBox="0 0 8 8"><circle r="4" fill="#33CE73"/></svg>', colors: 'keep' });
  assert.match(kept.code, /fill="#33CE73"/);
  assert.ok(kept.notes.some((n) => /colours kept/i.test(n)));
  assert.equal(svgToJsx('<g stroke-linecap="round"></g>'), '<g strokeLinecap="round" />');
  assert.match(await call('scaffold_preset', { name: 'X', svg: 'not svg' }), /Cannot scaffold/);
});
