/* ============================================================================
   smoke.mjs — real E2E: the official MCP client against the server over stdio.
   Exercises tools, prompts and resources the way Claude Code will.
   ============================================================================ */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.resolve(here, '..', 'dist', 'index.js');

const client = new Client({ name: 'smoke', version: '0.0.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [entry, '--stdio'],
  env: { ...process.env },
});

const fail = (msg) => { console.error(`✗ ${msg}`); process.exitCode = 1; };
const ok = (msg) => console.log(`✓ ${msg}`);
const textOf = (r) => r.content?.map((c) => c.text ?? '').join('\n') ?? '';

await client.connect(transport);
ok('connected over stdio');

const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
const expected = [
  'analyze_page', 'get_adoption_guide', 'get_app_shell', 'get_component', 'get_rules',
  'get_tokens', 'list_components', 'overview', 'search_components', 'sync_design_system', 'validate_page',
  'list_kit', 'get_block', 'get_template', 'scaffold_page', 'scaffold_preset',
];
for (const e of expected) if (!names.includes(e)) fail(`missing tool ${e}`);
ok(`tools (${names.length}): ${names.join(', ')}`);

const overview = textOf(await client.callTool({ name: 'overview', arguments: {} }));
if (!/design system/i.test(overview) || !/blocks/.test(overview)) fail('empty overview');
ok('overview');

const kit = textOf(await client.callTool({ name: 'list_kit', arguments: { kind: 'template', query: 'dashboard' } }));
if (!kit.includes('`home-dashboard`')) fail('list_kit does not list home-dashboard');
ok('list_kit (kind + query)');

const block = textOf(await client.callTool({ name: 'get_block', arguments: { id: 'kpi-row', include_source: false } }));
if (!block.includes("from '@gntik-ai/blocks'")) fail('get_block without usage');
ok('get_block kpi-row');

const page = textOf(await client.callTool({ name: 'scaffold_page', arguments: { template: 'home-dashboard', route: '/overview' } }));
if (!page.includes('<HomeDashboardPage shell={shell} />')) fail('scaffold_page without the template page');
ok('scaffold_page home-dashboard');

const list = textOf(await client.callTool({ name: 'list_components', arguments: { group: 'Elements' } }));
if (!list.includes('`buttons`')) fail('list_components does not list buttons');
ok('list_components (group filter)');

const search = textOf(await client.callTool({ name: 'search_components', arguments: { query: 'toast notificación' } }));
if (!search.includes('notifications')) fail('search does not find notifications');
ok('search_components');

const comp = textOf(await client.callTool({ name: 'get_component', arguments: { id: 'buttons' } }));
if (!comp.includes('bg-primary') || !comp.includes('```tsx')) fail('get_component (catalog id) without canonical code');
ok('get_component buttons (catalog)');
const kitComp = textOf(await client.callTool({ name: 'get_component', arguments: { id: 'button', include_source: false } }));
if (!kitComp.includes('@gntik-ai/ui') || !kitComp.includes('| Enter |')) fail('get_component (kit id) without metadata');
ok('get_component button (kit)');

const shell = textOf(await client.callTool({ name: 'get_app_shell', arguments: { include_html_block: true } }));
if (!/sidebar/i.test(shell)) fail('empty app shell');
if (!shell.includes('blocks/Shell.html')) fail('app shell without the HTML block');
ok('get_app_shell (+Shell.html)');

const tokens = textOf(await client.callTool({ name: 'get_tokens', arguments: { theme: 'dark', format: 'css' } }));
if (!tokens.includes('--primary')) fail('dark tokens without --primary');
ok('get_tokens dark');

const guide = textOf(await client.callTool({ name: 'get_adoption_guide', arguments: {} }));
if (!guide.includes('@theme inline')) fail('guide without the Tailwind v4 bridge');
ok('get_adoption_guide');

const rules = textOf(await client.callTool({ name: 'get_rules', arguments: {} }));
if (!rules.includes('hex-color')) fail('get_rules without rule ids');
ok('get_rules');

const analysis = textOf(await client.callTool({
  name: 'analyze_page',
  arguments: { source: '<nav class="navbar"></nav><div class="sidebar"/><table class="table"></table><button class="btn btn-primary" style="color:#fff">x</button>', filename: 'legacy.html' },
}));
if (!analysis.includes('tables') || !analysis.includes('Bootstrap')) fail('weak analyze_page');
ok('analyze_page');

const bad = textOf(await client.callTool({
  name: 'validate_page',
  arguments: { source: '<p class="bg-red-500" style="color:#fff">x</p>' },
}));
if (!bad.includes('❌')) fail('validate_page reports no errors');
const good = textOf(await client.callTool({
  name: 'validate_page',
  arguments: { source: '<button className="bg-primary text-primary-foreground border border-border">ok</button>' },
}));
if (!good.includes('✅')) fail('validate_page rejects tokenised code');
ok('validate_page (bad ❌ / good ✅)');

const sync = textOf(await client.callTool({ name: 'sync_design_system', arguments: {} }));
if (!sync.includes('kit items')) fail('sync without stats');
ok('sync_design_system');

const { prompts } = await client.listPrompts();
const pnames = prompts.map((p) => p.name);
if (!pnames.includes('remaquetar') || !pnames.includes('preparar_producto')) fail(`missing prompts: ${pnames.join(', ')}`);
const prompt = await client.getPrompt({ name: 'remaquetar', arguments: { pagina: 'src/pages/Fleet.tsx' } });
if (!prompt.messages?.[0]?.content?.text?.includes('Fleet.tsx')) fail('remaquetar prompt without the page');
ok('prompts: remaquetar · preparar_producto');

const { resources } = await client.listResources();
if (!resources.some((r) => r.uri === 'gntik-ui://tokens')) fail('tokens resource missing');
const res = await client.readResource({ uri: 'gntik-ui://componente/buttons' });
if (!res.contents?.[0]?.text?.includes('bg-primary')) fail('empty componente/buttons resource');
ok(`resources (${resources.length} static + componente/{id} template)`);

await client.close();
if (process.exitCode) { console.error('\nSMOKE: FAIL'); process.exit(1); }
console.log('\nSMOKE: OK — the server answers end to end the way Claude Code will use it');
