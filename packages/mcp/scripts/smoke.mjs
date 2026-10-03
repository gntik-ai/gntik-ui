/* ============================================================================
   smoke.mjs — E2E real: cliente MCP oficial contra el server por stdio.
   Ejercita tools, prompts y resources tal y como lo hará Claude Code.
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
ok('conectado por stdio');

const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
const expected = [
  'analyze_page', 'get_adoption_guide', 'get_app_shell', 'get_component', 'get_rules',
  'get_tokens', 'list_components', 'overview', 'search_components', 'sync_design_system', 'validate_page',
];
for (const e of expected) if (!names.includes(e)) fail(`falta tool ${e}`);
ok(`tools (${names.length}): ${names.join(', ')}`);

const overview = textOf(await client.callTool({ name: 'overview', arguments: {} }));
if (!/design system/i.test(overview) || !/componentes/.test(overview)) fail('overview vacío');
ok('overview');

const list = textOf(await client.callTool({ name: 'list_components', arguments: { group: 'Elements' } }));
if (!list.includes('`buttons`')) fail('list_components no lista buttons');
ok('list_components (filtro grupo)');

const search = textOf(await client.callTool({ name: 'search_components', arguments: { query: 'toast notificación' } }));
if (!search.includes('notifications')) fail('search no encuentra notifications');
ok('search_components');

const comp = textOf(await client.callTool({ name: 'get_component', arguments: { id: 'buttons' } }));
if (!comp.includes('bg-primary') || !comp.includes('```tsx')) fail('get_component sin código canónico');
ok('get_component buttons');

const shell = textOf(await client.callTool({ name: 'get_app_shell', arguments: { include_html_block: true } }));
if (!/sidebar/i.test(shell)) fail('app shell sin contenido');
if (!shell.includes('blocks/Shell.html')) fail('app shell sin el block HTML');
ok('get_app_shell (+Shell.html)');

const tokens = textOf(await client.callTool({ name: 'get_tokens', arguments: { theme: 'dark', format: 'css' } }));
if (!tokens.includes('--primary')) fail('tokens dark sin --primary');
ok('get_tokens dark');

const guide = textOf(await client.callTool({ name: 'get_adoption_guide', arguments: {} }));
if (!guide.includes('@theme inline')) fail('guía sin el puente Tailwind v4');
ok('get_adoption_guide');

const rules = textOf(await client.callTool({ name: 'get_rules', arguments: {} }));
if (!rules.includes('hex-color')) fail('get_rules sin ids de regla');
ok('get_rules');

const analysis = textOf(await client.callTool({
  name: 'analyze_page',
  arguments: { source: '<nav class="navbar"></nav><div class="sidebar"/><table class="table"></table><button class="btn btn-primary" style="color:#fff">x</button>', filename: 'legacy.html' },
}));
if (!analysis.includes('tables') || !analysis.includes('Bootstrap')) fail('analyze_page flojo');
ok('analyze_page');

const bad = textOf(await client.callTool({
  name: 'validate_page',
  arguments: { source: '<p class="bg-red-500" style="color:#fff">x</p>' },
}));
if (!bad.includes('❌')) fail('validate_page no marca errores');
const good = textOf(await client.callTool({
  name: 'validate_page',
  arguments: { source: '<button className="bg-primary text-primary-foreground border border-border">ok</button>' },
}));
if (!good.includes('✅')) fail('validate_page no acepta código tokenizado');
ok('validate_page (malo ❌ / bueno ✅)');

const sync = textOf(await client.callTool({ name: 'sync_design_system', arguments: {} }));
if (!sync.includes('componentes')) fail('sync sin stats');
ok('sync_design_system');

const { prompts } = await client.listPrompts();
const pnames = prompts.map((p) => p.name);
if (!pnames.includes('remaquetar') || !pnames.includes('preparar_producto')) fail(`faltan prompts: ${pnames.join(', ')}`);
const prompt = await client.getPrompt({ name: 'remaquetar', arguments: { pagina: 'src/pages/Fleet.tsx' } });
if (!prompt.messages?.[0]?.content?.text?.includes('Fleet.tsx')) fail('prompt remaquetar sin la página');
ok('prompts: remaquetar · preparar_producto');

const { resources } = await client.listResources();
if (!resources.some((r) => r.uri === 'gntik-ui://tokens')) fail('resource tokens ausente');
const res = await client.readResource({ uri: 'gntik-ui://componente/buttons' });
if (!res.contents?.[0]?.text?.includes('bg-primary')) fail('resource componente/buttons vacío');
ok(`resources (${resources.length} estáticos + template componente/{id})`);

await client.close();
if (process.exitCode) { console.error('\nSMOKE: FAIL'); process.exit(1); }
console.log('\nSMOKE: OK — el server responde end-to-end como lo usará Claude Code');
