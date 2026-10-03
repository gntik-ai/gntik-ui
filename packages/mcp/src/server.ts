/* ============================================================================
   gntik-ui-mcp · server.ts — MCP tools, prompts and resources
   ----------------------------------------------------------------------------
   Kit tools over kit-registry.json (list_kit, get_component, get_block,
   get_template, scaffold_page, scaffold_preset — see kit-tools.ts), catalog
   tools over registry.json (overview, list/search_components, tokens, app
   shell, adoption guide, rules), rebuild tools (analyze_page, validate_page)
   and sync. Prompts: /remaquetar (rebuild a page) and /preparar_producto
   (wire a product) — names kept for compatibility. Resources: tokens, rules,
   inventory and componente/{id}.
   ============================================================================ */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ComponentDoc, DesignSystemIndex, IndexStats } from './types.js';
import { analyzePage, type Analysis } from './analyze.js';
import { validatePage, RULES, type ValidationReport } from './validate.js';
import { readBlock } from './indexer.js';
import { loadKit } from './kit.js';
import { findKitItem, mdKitItem, registerKitTools } from './kit-tools.js';

export const SERVER_NAME = 'gntik-ui';
export const SERVER_VERSION = '0.1.0';

export interface SyncResult {
  root: string;
  source: 'dir' | 'git';
  gitHead?: string;
  updated?: boolean;
  stats: IndexStats;
}

export interface ServerContext {
  getIndex(): DesignSystemIndex;
  sync(): Promise<SyncResult>;
}

/* ── markdown builders ───────────────────────────────────────────────────── */

const F = '```';

function mdComponent(doc: ComponentDoc): string {
  const out: string[] = [];
  out.push(`# ${doc.label} · \`${doc.id}\` — catalog group ${doc.group}`);
  if (doc.blurb) out.push(doc.blurb);
  if (doc.intro) out.push(`> ${doc.intro}`);
  if (doc.header) out.push(`_${doc.header.replace(/\n/g, ' ')}_`);
  if (doc.snippets.length === 0) {
    out.push('(This catalog entry has no code snippets of its own.)');
  } else {
    out.push(`## Canonical code (${doc.snippets.length} snippets) — copy it and adapt copy/data`);
    doc.snippets.forEach((s, i) => {
      out.push(`### ${i + 1} · ${s.title ?? s.name}`);
      if (s.desc) out.push(s.desc);
      out.push(`${F}${s.lang}\n${s.code}\n${F}`);
    });
  }
  out.push('---');
  out.push('This is the catalog (copy-paste) reference. When the product can use the packages, prefer the kit: `list_kit` → `get_component` / `get_block` / `get_template`.');
  out.push('Rules: token classes only (`bg-primary`, `text-foreground`, `border-border`…) — no hard-coded colours, no gradients, flat shadows, no `dark:`. Check the result with `validate_page`.');
  return out.join('\n\n');
}

function mdList(index: DesignSystemIndex, group?: string, status?: string): string {
  const groups = new Map<string, typeof index.registry>();
  for (const item of index.registry) {
    if (group && item.group.toLowerCase() !== group.toLowerCase()) continue;
    if (status && item.status !== status) continue;
    const arr = groups.get(item.group) ?? [];
    arr.push(item);
    groups.set(item.group, arr);
  }
  const out: string[] = [`# gntik-ui catalog — ${index.stats.components} entries in ${index.stats.groups} groups`];
  for (const [g, items] of groups) {
    out.push(`## ${g}`);
    for (const it of items) {
      const snips = index.components[it.id]?.snippets.length ?? 0;
      out.push(`- \`${it.id}\` — **${it.label}** (${it.status}${snips ? ` · ${snips} snippets` : ''})${it.blurb ? `: ${it.blurb}` : ''}`);
    }
  }
  out.push('\nUse `get_component` with the `id` for the canonical code. The installable packages: `list_kit`.');
  return out.join('\n');
}

function mdOverview(index: DesignSystemIndex): string {
  const light = index.themes.find((t) => t.theme === 'light');
  const primary = light?.tokens['primary'] ?? '145 61% 50%';
  const groups = [...new Set(index.registry.map((r) => r.group))];
  const kit = loadKit(index.root).items;
  const count = (k: string) => kit.filter((i) => i.kind === k).length;
  return [
    '# gntik-ui — the product-agnostic design system of gntik-ai',
    `**Brand:** green primary \`hsl(${primary})\` · Geist + Geist Mono · radius 0.625rem · 3 themes (dark default · light · high_contrast). Colour values are frozen; products differ only by a brand preset (name + logo).`,
    kit.length
      ? `**Kit (packages):** ${count('component')} components · ${count('layout')} layouts (@gntik-ai/ui, @gntik-ai/chat) · ${count('block')} blocks (@gntik-ai/blocks) · ${count('template')} page templates (@gntik-ai/templates).`
      : '**Kit (packages):** kit-registry.json not found next to this server.',
    `**Catalog (copy-paste reference):** ${index.stats.components} entries in ${index.stats.groups} groups · ${index.stats.snippets} canonical snippets · ${index.stats.tokens} tokens. Groups: ${groups.join(' · ')}`,
    '**How it works:** all styling comes from `@gntik-ai/tokens` (HSL channels, 3 themes). Components use ONLY token classes (`bg-primary`, `text-foreground`, `border-border`, `bg-card`…). Re-skinning = tokens; markup never changes.',
    '## Hard rules',
    index.rulesMd ?? '- Sober: no gradients, no glow; flat shadows.\n- Mono-brand green; the primary is never a severity colour.\n- No hard-coded colours: always classes that resolve to tokens.',
    '## Building a page',
    [
      '1. A template fits? `list_kit kind=template` → `scaffold_page template=<id>` (console templates render inside ConsoleShell).',
      '2. Otherwise compose blocks: `list_kit kind=block` → `scaffold_page blocks=[…] layout=console|page|auth-layout|…`.',
      '3. Fill the gaps with components: `get_component <id>` (metadata, keyboard, usage, source).',
      '4. New product: `scaffold_preset` for its BrandPreset, then `get_adoption_guide`.',
      '5. `validate_page` on the result → fix until 0 errors.',
    ].join('\n'),
    '## Rebuilding a legacy page',
    '`analyze_page` → `get_component` per suggestion (`get_app_shell` for the chrome) → rewrite keeping all logic → `validate_page`.',
    'Tools: `list_kit` · `get_component` · `get_block` · `get_template` · `scaffold_page` · `scaffold_preset` · `list_components` · `search_components` · `get_tokens` · `get_app_shell` · `get_adoption_guide` · `get_rules` · `analyze_page` · `validate_page` · `sync_design_system`. Prompt: `/remaquetar`.',
  ].join('\n\n');
}

function mdValidation(report: ValidationReport, filename?: string): string {
  const head = report.ok
    ? `✅ **No errors** — ${report.summary}`
    : `❌ **${report.errors} errors** — ${report.summary}`;
  const out = [`# Validation${filename ? ` · ${filename}` : ''}`, head];
  const shown = report.findings.slice(0, 60);
  if (shown.length) {
    out.push(
      shown
        .map((f) => `- L${f.line} · **${f.rule}** (${f.severity}) — ${f.message}\n  \`${f.excerpt.replace(/`/g, "'")}\``)
        .join('\n'),
    );
    if (report.findings.length > shown.length) out.push(`…and ${report.findings.length - shown.length} more.`);
  }
  if (!report.ok) out.push('Fix the errors and validate again. Warnings: fix or justify them.');
  return out.join('\n\n');
}

function mdAnalysis(a: Analysis, filename?: string): string {
  const out = [`# Analysis${filename ? ` · ${filename}` : ''} — ${a.stats.lines} lines`];
  if (a.frameworks.length) {
    out.push('## Legacy frameworks/libraries detected');
    out.push(a.frameworks.map((f) => `- **${f.name}** — ${f.hint}`).join('\n'));
  }
  if (a.suggestions.length) {
    out.push('## Suggested gntik-ui catalog entries (by signals found)');
    out.push(
      a.suggestions
        .map((s) => {
          const where = s.lines.length ? ` · lines ${s.lines.join(', ')}` : '';
          return `- \`${s.id}\`${s.label ? ` — **${s.label}**` : ''} (${s.group ?? '?'}) · ${s.reasons.join('; ')}${where}`;
        })
        .join('\n'),
    );
  } else {
    out.push('No clear patterns detected — review the page by hand with `list_kit` / `list_components` as a map.');
  }
  out.push(`## Styles to replace — ${a.stats.totalStyleErrors} brand violations detected`);
  if (a.styleErrors.length) {
    out.push(a.styleErrors.map((f) => `- L${f.line} · ${f.rule}: \`${f.excerpt.replace(/`/g, "'")}\``).join('\n'));
  } else {
    out.push('(no hard violations detected)');
  }
  out.push(`**Next step:** \`get_component\` with: ${a.suggestions.slice(0, 8).map((s) => `\`${s.id}\``).join(', ') || '`list_components`'}. Kit equivalents: \`list_kit query=<pattern>\`.`);
  out.push(`Brand tokens already in use: ${a.stats.tokensUsed}.`);
  return out.join('\n\n');
}

/* ── catalog search ──────────────────────────────────────────────────────── */

function searchComponents(index: DesignSystemIndex, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: Array<{ doc: ComponentDoc; score: number; matched: string[] }> = [];
  for (const doc of Object.values(index.components)) {
    let score = 0;
    const matched = new Set<string>();
    const fields: Array<[string, string | undefined, number]> = [
      ['id', doc.id, 5],
      ['label', doc.label, 5],
      ['group', doc.group, 2],
      ['blurb', doc.blurb, 3],
      ['intro', doc.intro, 2],
      ['snippets', doc.snippets.map((s) => `${s.name} ${s.title ?? ''} ${s.desc ?? ''}`).join(' '), 2],
      ['code', doc.snippets.map((s) => s.code).join(' '), 1],
    ];
    for (const term of terms) {
      for (const [fname, value, weight] of fields) {
        if (value && value.toLowerCase().includes(term)) {
          score += weight;
          matched.add(fname);
        }
      }
    }
    if (score > 0) results.push({ doc, score, matched: [...matched] });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

/* ── prompts ─────────────────────────────────────────────────────────────── */

function rebuildPrompt(page: string, notes?: string): string {
  return [
    `Rebuild the page \`${page}\` on the **gntik-ui** design system using the tools of the \`${SERVER_NAME}\` MCP server.${notes ? `\n\nUser notes: ${notes}` : ''}`,
    'Required flow:',
    [
      '1. Read the page file and its styles/partials/subcomponents.',
      '2. Call `analyze_page` with the source → suggested components and style violations.',
      '3. First page in this session: `overview` and `get_rules`. If the page lives inside the app chrome: `get_app_shell` (or `get_template` for a console template).',
      '4. If the product can use the packages, look for a template or blocks first (`list_kit`, `scaffold_page`). Otherwise call `get_component` for every detected pattern and use its canonical code as the exact markup and class reference.',
      '5. Rewrite the page:',
      '   - Keep ALL logic: handlers, state, data fetching, routes, i18n, accessibility and test ids.',
      '   - Replace the markup with the kit/catalog one, adapting the page\'s real copy and data.',
      '   - Token classes only (`bg-primary`, `text-foreground`, `border-border`…): no hard-coded colours, no gradients, flat shadows, no `dark:` variants (tokens handle the theme).',
      '   - Not React? Move the same markup and classes into the framework template (Angular/Vue/HTML).',
      '   - Delete (or flag for deletion) page CSS/SCSS that becomes dead.',
      '6. Call `validate_page` with the result. Iterate until **0 errors**; justify every warning you keep.',
      '7. Summarise: components used, decisions, CSS removed and open TODOs.',
    ].join('\n'),
    'Do not invent classes when the kit has an equivalent. When in doubt, `list_kit query=…` or `search_components`.',
  ].join('\n\n');
}

function productSetupPrompt(framework?: string): string {
  return [
    `Prepare this product${framework ? ` (${framework})` : ''} to adopt the gntik-ui design system.`,
    [
      '1. Call `get_adoption_guide` and `get_tokens` (format css).',
      '2. Install `@gntik-ai/ui` + `@gntik-ai/tokens` (or run `gntik-ui init`); in the global CSS, after `@import "tailwindcss";`, import the Geist fonts and `@gntik-ai/ui/styles.css` (add `@gntik-ai/templates/styles.css` when using blocks/templates).',
      '3. Tailwind v4: the `tailwind.css` bridge already maps every token to `--color-*`; on Tailwind v3 use `hsl(var(--token) / <alpha-value>)`.',
      '4. Wrap the app in `<ThemeProvider brand={preset}>` (`scaffold_preset` makes the preset) and inline `themeScript` in <head> to avoid a theme flash. Theme class on <html>: none = light · `dark` (default) · `high_contrast`.',
      '5. Check with a pilot page: `validate_page` must report 0 errors.',
    ].join('\n'),
  ].join('\n\n');
}

/* ── server ──────────────────────────────────────────────────────────────── */

export function buildServer(ctx: ServerContext): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });

  /* — catalog + kit tools — */

  server.registerTool('overview', {
    title: 'Design system overview',
    description:
      'Summary of the gntik-ui design system: brand, tokens, hard rules, kit and catalog inventory, and how to build or rebuild a page. Call this first.',
    inputSchema: {},
  }, async () => text(mdOverview(ctx.getIndex())));

  registerKitTools(server, () => ctx.getIndex().root);

  server.registerTool('list_components', {
    title: 'List catalog entries',
    description: 'The copy-paste catalog inventory (id, group, status, snippets). Filter by group or status. For the installable packages use list_kit.',
    inputSchema: {
      group: z.string().optional().describe('Filter by group (e.g. "Forms", "Overlays")'),
      status: z.string().optional().describe('Filter by status: done | wip | todo'),
    },
  }, async ({ group, status }) => text(mdList(ctx.getIndex(), group, status)));

  server.registerTool('search_components', {
    title: 'Search catalog entries',
    description:
      'Searches the catalog by keywords (id, name, description and code). Useful when you see a legacy pattern and do not know which brand component covers it.',
    inputSchema: {
      query: z.string().describe('Keywords, e.g. "selectable table", "toast", "avatar dropdown"'),
    },
  }, async ({ query }) => {
    const index = ctx.getIndex();
    const results = searchComponents(index, query);
    if (!results.length) return text(`No results for "${query}". Try \`list_kit query=…\` or \`list_components\`.`);
    const md = [
      `# Results for "${query}"`,
      ...results.map((r) =>
        `- \`${r.doc.id}\` — **${r.doc.label}** (${r.doc.group}) · score ${r.score} · matched ${r.matched.join(', ')}${r.doc.blurb ? `\n  ${r.doc.blurb}` : ''}`),
      '\nUse `get_component` with the chosen id.',
    ].join('\n');
    return text(md);
  });

  server.registerTool('get_component', {
    title: 'Get a component',
    description:
      'A kit component or layout (@gntik-ai/ui, @gntik-ai/chat): metadata, keyboard contract, tokens, deps, a usage example and the full source. Ids that only exist in the copy-paste catalog (e.g. "buttons", "tables") return the catalog entry with all its canonical React+Tailwind code.',
    inputSchema: {
      id: z.string().describe('Kit id or name (e.g. "button", "Dialog", "sidebar-layout") or catalog id (e.g. "buttons", "modal-dialogs")'),
      include_source: z.boolean().optional().describe('Kit items: include file contents (default true)'),
    },
  }, async ({ id, include_source }) => {
    const index = ctx.getIndex();
    const kit = loadKit(index.root);
    const item = findKitItem(kit, id, ['component', 'layout']);
    const legacy = index.components[id.toLowerCase().trim()];
    if (item) {
      const md = mdKitItem(index.root, item, { source: include_source });
      return text(legacy ? `${md}\n\nThe copy-paste catalog also has \`${legacy.id}\` (${legacy.label}): \`list_components\`.` : md);
    }
    if (legacy) return text(mdComponent(legacy));
    const near = searchComponents(index, id).slice(0, 5).map((r) => `\`${r.doc.id}\``).join(', ');
    return text(`No component \`${id}\`.${near ? ` Did you mean ${near}?` : ''} Use \`list_kit kind=component\` or \`list_components\`.`);
  });

  server.registerTool('get_tokens', {
    title: 'Brand tokens',
    description:
      'The token layer (packages/tokens/src/brand.css): colour, typography, radii and shadows per theme. format=css returns the file as-is (to copy into a product); format=json the parsed values.',
    inputSchema: {
      theme: z.enum(['light', 'dark', 'high_contrast', 'all']).optional().describe('One theme or all (default)'),
      format: z.enum(['css', 'json']).optional().describe('css (default) | json'),
    },
  }, async ({ theme, format }) => {
    const index = ctx.getIndex();
    const t = theme ?? 'all';
    if ((format ?? 'css') === 'json') {
      const themes = t === 'all' ? index.themes : index.themes.filter((x) => x.theme === t);
      return text(`${F}json\n${JSON.stringify(themes, null, 2)}\n${F}`);
    }
    if (t === 'all') return text(`${F}css\n${index.tokensCss}\n${F}`);
    const th = index.themes.find((x) => x.theme === t);
    if (!th) return text(`Unknown theme: ${t}`);
    const body = Object.entries(th.tokens).map(([k, v]) => `  --${k}:${v};`).join('\n');
    return text(`${F}css\n${th.selector}{\n${body}\n}\n${F}`);
  });

  server.registerTool('get_app_shell', {
    title: 'App shell',
    description:
      'The shared chrome (sidebar + topbar + page header) from the catalog: docs and canonical code. With the packages, prefer the ConsoleShell of @gntik-ai/templates (`get_template home-dashboard`).',
    inputSchema: {
      include_html_block: z.boolean().optional().describe('Also include blocks/Shell.html (approved HTML reference)'),
    },
  }, async ({ include_html_block }) => {
    const index = ctx.getIndex();
    const doc = index.components['app-shell'];
    if (!doc) return text('The catalog has no app-shell entry.');
    let md = mdComponent(doc);
    if (include_html_block) {
      const html = readBlock(index.root, 'Shell');
      if (html) md += `\n\n## blocks/Shell.html (approved HTML reference)\n\n${F}html\n${html}\n${F}`;
    }
    return text(md);
  });

  server.registerTool('get_adoption_guide', {
    title: 'Adoption guide',
    description:
      'How to wire a product to the design system: import the tokens (brand.css) and the Tailwind v4 bridge (tailwind.css), switch themes by class and load Geist. Includes the real tailwind.css.',
    inputSchema: {},
  }, async () => {
    const index = ctx.getIndex();
    const { extractSection } = await import('./indexer.js');
    const adopt = extractSection(index.readme, /^##\s*(Adoptar|Adopt)/) ?? index.readme ?? '';
    const out = [
      '# Adopting gntik-ui in a product',
      adopt,
      '## Tailwind v4 bridge (packages/tokens/src/tailwind.css · token → utility)',
      index.tailwindConfig ? `${F}css\n${index.tailwindConfig}\n${F}` : '(not found: packages/tokens/src/tailwind.css)',
      '## Theme switching',
      'Class on `<html>`: none = light · `dark` · `high_contrast` (ThemeProvider handles it; `themeScript` avoids the flash). Fonts: Geist + Geist Mono (self-hosted with @fontsource/geist and @fontsource/geist-mono).',
      'Full tokens: tool `get_tokens` (format css), or install `@gntik-ai/tokens`. Brand preset (name + logo): `scaffold_preset`.',
    ].join('\n\n');
    return text(out);
  });

  server.registerTool('get_rules', {
    title: 'Design system rules',
    description:
      'The brand hard rules + exactly what validate_page checks (rule ids and severity). Read them before rewriting a page.',
    inputSchema: {},
  }, async () => {
    const index = ctx.getIndex();
    const out = [
      '# Hard rules (catalog CLAUDE.md)',
      index.rulesMd ?? '(rules section not found — the validate_page checks apply)',
      '## Kit conventions',
      '- Brand-coloured text: `text-primary-text`, `text-success-text`, `text-warning-text`, `text-destructive-text`; on tinted chips/badges `text-<tone>-chip-text`.\n- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring`.\n- Inline links are underlined.\n- Copy is English and product-agnostic; product data lives in fixtures.',
      '## What `validate_page` checks',
      RULES.map((r) => `- \`${r.id}\` (**${r.severity}**): ${r.message}`).join('\n'),
      '- `no-tokens` (**warning**): the page uses no token class at all.',
      'Acceptance: **0 errors**; every remaining warning justified. Silence specific rules with the `allow` parameter.',
    ].join('\n\n');
    return text(out);
  });

  /* — rebuild tools — */

  server.registerTool('analyze_page', {
    title: 'Analyse a legacy page',
    description:
      'Analyses a page\'s source (React, Angular, Vue, HTML…): detects UI patterns and legacy libraries, suggests the equivalent gntik-ui entries and lists the brand violations to replace. First step of every rebuild.',
    inputSchema: {
      source: z.string().describe('Full source of the page'),
      filename: z.string().optional().describe('File name/path (informative)'),
    },
  }, async ({ source, filename }) => text(mdAnalysis(analyzePage(source, ctx.getIndex()), filename)));

  server.registerTool('validate_page', {
    title: 'Validate a page',
    description:
      'Validates a page against the brand hard rules (hard-coded colours, Tailwind palette outside tokens, gradients, glow, dark:, typography). Returns errors/warnings with line and excerpt. Iterate until 0 errors.',
    inputSchema: {
      source: z.string().describe('Source of the rebuilt page'),
      filename: z.string().optional().describe('File name/path (informative)'),
      allow: z.array(z.string()).optional().describe('Rule ids to ignore (e.g. ["dark-variant"])'),
    },
  }, async ({ source, filename, allow }) => text(mdValidation(validatePage(source, { filename, allow }), filename)));

  server.registerTool('sync_design_system', {
    title: 'Sync the design system',
    description:
      'Re-reads the gntik-ui repo (git pull when the server cloned it itself) and rebuilds the index. Use it if the design system changed during the session.',
    inputSchema: {},
  }, async () => {
    const r = await ctx.sync();
    const kit = loadKit(r.root).items.length;
    return text(
      `Design system synced from ${r.source === 'git' ? 'git' : 'local directory'} (${r.root})` +
      `${r.gitHead ? ` · HEAD \`${r.gitHead}\`` : ''}${r.updated === false ? ' · no changes' : ''}\n` +
      `Index: ${r.stats.components} catalog entries · ${r.stats.snippets} snippets · ${r.stats.tokens} tokens · ${kit} kit items.`,
    );
  });

  /* — prompts (slash commands in Claude Code; names kept for compatibility) — */

  server.registerPrompt('remaquetar', {
    title: 'Rebuild a page on the design system',
    description: 'Full rebuild flow for one page: analyse → kit/components → rewrite → validate.',
    argsSchema: {
      pagina: z.string().describe('Path of the page file to rebuild'),
      notas: z.string().optional().describe('Extra notes or constraints (optional)'),
    },
  }, ({ pagina, notas }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: rebuildPrompt(pagina, notas) } }],
  }));

  server.registerPrompt('preparar_producto', {
    title: 'Prepare a product to adopt gntik-ui',
    description: 'Initial wiring: tokens, Tailwind, themes, brand preset and fonts.',
    argsSchema: {
      framework: z.string().optional().describe('Product framework (React, Angular, …) — optional'),
    },
  }, ({ framework }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: productSetupPrompt(framework) } }],
  }));

  /* — resources — */

  server.registerResource('tokens', 'gntik-ui://tokens', {
    title: 'brand.css (@gntik-ai/tokens)',
    description: 'Brand token layer (3 themes)',
    mimeType: 'text/css',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/css', text: ctx.getIndex().tokensCss }],
  }));

  server.registerResource('reglas', 'gntik-ui://reglas', {
    title: 'Design system hard rules',
    mimeType: 'text/markdown',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: ctx.getIndex().rulesMd ?? '' }],
  }));

  server.registerResource('inventario', 'gntik-ui://inventario', {
    title: 'INVENTORY.md',
    mimeType: 'text/markdown',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: ctx.getIndex().inventoryMd ?? '' }],
  }));

  server.registerResource(
    'componente',
    new ResourceTemplate('gntik-ui://componente/{id}', {
      list: async () => ({
        resources: ctx.getIndex().registry.map((r) => ({
          uri: `gntik-ui://componente/${r.id}`,
          name: r.label,
          description: r.blurb,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    { title: 'Catalog entry', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const doc = ctx.getIndex().components[String(id)];
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: doc ? mdComponent(doc) : `Unknown catalog entry: ${id}`,
        }],
      };
    },
  );

  return server;
}
