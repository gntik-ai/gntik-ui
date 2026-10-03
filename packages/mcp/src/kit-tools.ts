/* ============================================================================
   gntik-ui-mcp · kit-tools.ts — MCP tools over kit-registry.json
   ----------------------------------------------------------------------------
   list_kit · get_block · get_template · scaffold_page · scaffold_preset
   (get_component lives in server.ts: kit first, legacy catalog as fallback,
   and uses mdKitItem from here).
   ============================================================================ */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  KIT_KINDS, REPO_BLOB, docInfoOf, exportNameOf, filterKit, firstSentence, loadKit, nearIds, readRepoFile,
  usageOf, usesConsoleShell, type KitItem, type KitKind, type KitRegistry,
} from './kit.js';
import { PAGE_LAYOUTS, scaffoldPage, scaffoldPreset, type Scaffold } from './scaffold.js';

const F = '```';
const MAX_SOURCE = 120_000;
const langOf = (p: string) => (p.endsWith('.css') ? 'css' : p.endsWith('.tsx') ? 'tsx' : 'ts');

export interface KitItemOptions {
  /** Include the contents of every source file (default true). */
  source?: boolean;
}

/** Markdown for one kit item: metadata, keyboard, usage snippet, deps and (optionally) sources. */
export function mdKitItem(root: string, item: KitItem, opts: KitItemOptions = {}): string {
  const info = docInfoOf(root, item);
  const name = exportNameOf(root, item);
  const out: string[] = [`# ${item.name} · \`${item.id}\` — ${item.kind} · ${item.group || '—'} · ${item.status}`, item.description];
  const meta = [
    `**Package:** \`${item.package}\` · **Export:** \`${name}\``,
    item.kind === 'block' || item.kind === 'template'
      ? `**Install:** \`npm i ${item.package}\` and import it, or copy the source with \`gntik-ui add ${item.id}\``
      : `**Install:** \`gntik-ui add ${item.id}\` (npm) · own the source: \`gntik-ui eject ${item.id}\``,
  ];
  if (info.primitive) meta.push(`**Primitive:** \`${info.primitive}\``);
  if (info.pattern) meta.push(`**ARIA pattern:** ${info.pattern}`);
  if (info.uses.length) meta.push(`**Composes:** ${info.uses.join(', ')}`);
  if (item.kind === 'template') {
    if (info.layout) meta.push(`**Layout:** ${info.layout}`);
    if (info.blocks.length) meta.push(`**Blocks:** ${info.blocks.map((b) => `\`${b}\``).join(', ')}`);
    if (info.priority) meta.push(`**Priority:** ${info.priority}`);
    meta.push(`**Console shell:** ${usesConsoleShell(root, item) ? 'yes — pass your frame through the `shell` prop' : 'no'}`);
  }
  meta.push(`**npm dependencies:** ${item.dependencies.map((d) => `\`${d}\``).join(', ') || '—'}`);
  meta.push(`**Registry dependencies:** ${item.registryDependencies.map((d) => `\`${d}\``).join(', ') || '—'}`);
  if (item.docs) meta.push(`**Docs file:** [${item.docs}](${REPO_BLOB}${item.docs})`);
  out.push(meta.join('  \n'));
  if (info.keyboard.length) {
    out.push('## Keyboard', ['| Key | Behaviour |', '| --- | --- |', ...info.keyboard.map(([k, b]) => `| ${k} | ${b} |`)].join('\n'));
  }
  if (info.tokens.length) out.push(`## Tokens\n${info.tokens.map((t) => `\`${t}\``).join(' · ')}`);
  const usage = usageOf(root, item);
  out.push(`## Usage${usage.file ? ` (from \`${usage.file}\`, imports rewritten to packages)` : ''}`, `${F}tsx\n${usage.code.trimEnd()}\n${F}`);
  out.push('## Files', item.files.map((f) => `- \`${f.path}\` → \`${f.target}\``).join('\n'));
  if (opts.source ?? true) {
    let budget = MAX_SOURCE;
    const skipped: string[] = [];
    for (const f of item.files) {
      const text = readRepoFile(root, f.path);
      if (text === undefined) {
        skipped.push(`- \`${f.path}\` — not shipped with this server: ${REPO_BLOB}${f.path}`);
        continue;
      }
      if (text.length > budget) {
        skipped.push(`- \`${f.path}\` — omitted (size budget): ${REPO_BLOB}${f.path}`);
        continue;
      }
      budget -= text.length;
      out.push(`### ${f.path}\n${F}${langOf(f.path)}\n${text.trimEnd()}\n${F}`);
    }
    if (skipped.length) out.push(skipped.join('\n'));
  }
  out.push('---\nBrand rules: token classes only (no hex, palette colours, gradients, glow or `dark:`); brand text via `text-*-text`, tinted chips via `text-<tone>-chip-text`; inline links underlined.');
  return out.join('\n\n');
}

export function mdKitList(items: KitItem[], total: number): string {
  if (!items.length) return 'No kit items match. Try fewer filters, or `list_kit` with no arguments.';
  const out = [`# gntik-ui kit — ${items.length} of ${total} items`];
  for (const kind of KIT_KINDS) {
    const of = items.filter((i) => i.kind === kind);
    if (!of.length) continue;
    out.push(`## ${kind}s (${of.length})`);
    out.push(of.map((i) => `- \`${i.id}\` — **${i.name}** (${i.group || '—'} · ${i.status} · ${i.package}): ${firstSentence(i.description)}`).join('\n'));
  }
  out.push('Details + source: `get_component` / `get_block` / `get_template` with the id. Build a page: `scaffold_page`.');
  return out.join('\n\n');
}

/** Resolves an id (or a component name like "Button") within the given kinds. */
export function findKitItem(kit: KitRegistry, id: string, kinds: readonly KitKind[]): KitItem | undefined {
  const key = id.trim();
  const direct = kit.byId.get(key.toLowerCase());
  if (direct && kinds.includes(direct.kind)) return direct;
  return kit.items.find((i) => kinds.includes(i.kind) && i.name.toLowerCase() === key.toLowerCase());
}

export function mdScaffold(s: Scaffold): string {
  if (!s.ok) return `Cannot scaffold: ${s.error ?? 'unknown error'}`;
  return [`# ${s.filename}`, `${F}tsx\n${(s.code ?? '').trimEnd()}\n${F}`, '## Notes', s.notes.map((n) => `- ${n}`).join('\n')].join('\n\n');
}

export function registerKitTools(server: McpServer, getRoot: () => string): void {
  const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });
  const kit = () => loadKit(getRoot());
  const notFound = (k: KitRegistry, id: string, kind: KitKind) => {
    const near = nearIds(k, id, kind);
    return text(`No ${kind} \`${id}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(', ')}?` : ''} Use \`list_kit kind=${kind}\`.`);
  };

  server.registerTool('list_kit', {
    title: 'List the kit',
    description:
      'Lists installable kit items from kit-registry.json: components and layouts (@gntik-ai/ui, @gntik-ai/chat), blocks (@gntik-ai/blocks) and page templates (@gntik-ai/templates). Filter by kind, group and/or a free-text query (all terms must match id, name, group or description).',
    inputSchema: {
      kind: z.enum(KIT_KINDS).optional().describe('component | layout | block | template'),
      group: z.string().optional().describe('Group/family, e.g. "Forms", "data-display", "Settings"'),
      query: z.string().optional().describe('Keywords, e.g. "table filter", "sign in"'),
    },
  }, async ({ kind, group, query }) => {
    const k = kit();
    if (!k.items.length) return text('kit-registry.json not found next to this server — run `pnpm registry` in the gntik-ui repo.');
    return text(mdKitList(filterKit(k.items, { kind, group, query }), k.items.length));
  });

  server.registerTool('get_block', {
    title: 'Get a block',
    description:
      'A block from @gntik-ai/blocks (page-level composition: KPI row, data table, page header…): metadata, components it composes, deps, usage snippet and the full source of its files.',
    inputSchema: {
      id: z.string().describe('Block id from list_kit, e.g. "kpi-row", "data-table"'),
      include_source: z.boolean().optional().describe('Include file contents (default true)'),
    },
  }, async ({ id, include_source }) => {
    const k = kit();
    const item = findKitItem(k, id, ['block']);
    return item ? text(mdKitItem(k.root, item, { source: include_source })) : notFound(k, id, 'block');
  });

  server.registerTool('get_template', {
    title: 'Get a page template',
    description:
      'A page template from @gntik-ai/templates: metadata, layout and blocks it uses, whether it renders in ConsoleShell, deps, usage snippet and the full source (Page.tsx, data.ts…).',
    inputSchema: {
      id: z.string().describe('Template id from list_kit, e.g. "home-dashboard", "settings-members"'),
      include_source: z.boolean().optional().describe('Include file contents (default true)'),
    },
  }, async ({ id, include_source }) => {
    const k = kit();
    const item = findKitItem(k, id, ['template']);
    return item ? text(mdKitItem(k.root, item, { source: include_source })) : notFound(k, id, 'template');
  });

  server.registerTool('scaffold_page', {
    title: 'Scaffold a page',
    description:
      'Returns a ready-to-paste TSX page file built from the kit with package imports. Either `template` (a template id: the page renders it, wiring the ConsoleShell `shell` prop when the template uses it) or `blocks` (block ids) + `layout`. Prefer a template when one fits.',
    inputSchema: {
      template: z.string().optional().describe('Template id, e.g. "resource-index"'),
      blocks: z.array(z.string()).optional().describe('Block ids in page order, e.g. ["page-header","kpi-row","data-table"]'),
      layout: z.string().optional().describe(`With blocks: ${PAGE_LAYOUTS.join(' | ')} (default: console, or auth-layout/stacked-layout for auth/marketing blocks)`),
      name: z.string().optional().describe('Component name of the page (PascalCase)'),
      route: z.string().optional().describe('Route of the page, e.g. "/projects" (marks the active sidebar item)'),
    },
  }, async (args) => text(mdScaffold(scaffoldPage(kit(), args))));

  server.registerTool('scaffold_preset', {
    title: 'Scaffold a brand preset',
    description:
      'Returns a BrandPreset module (like packages/ui/src/theme/presets.tsx) for a product: id, name and logo mark. Colours never change between presets. Without `svg` the mark is a token-coloured monogram; with `svg`, the markup is converted to JSX and (by default) its fills/strokes mapped to token classes.',
    inputSchema: {
      name: z.string().describe('Product name, e.g. "Acme Cloud"'),
      id: z.string().optional().describe('Preset id (kebab-case; default derived from name)'),
      svg: z.string().optional().describe('Square logo mark as <svg>…</svg> markup'),
      colors: z.enum(['tokens', 'keep']).optional().describe('tokens (default): map artwork colours to fill-/stroke- token classes; keep: preserve them'),
      tile: z.boolean().optional().describe('Place the mark on the 64×64 chrome tile like the built-in presets (default true)'),
    },
  }, async (args) => text(mdScaffold(scaffoldPreset(args))));
}
