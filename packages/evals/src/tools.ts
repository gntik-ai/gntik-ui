/* ============================================================================
   @gntik-ai/evals · tools.ts — the agent's tools, run in-process
   ----------------------------------------------------------------------------
   Same behaviour as the MCP server's kit tools (packages/mcp/src): the MCP
   package does not export a library entry (its main starts a server), so its
   source modules are imported directly. submit_page ends the episode.
   ============================================================================ */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type Anthropic from '@anthropic-ai/sdk';
import { KIT_KINDS, filterKit, loadKit, nearIds, type KitKind, type KitRegistry } from '../../mcp/src/kit.js';
import { findKitItem, mdKitItem, mdKitList, mdScaffold } from '../../mcp/src/kit-tools.js';
import { PAGE_LAYOUTS, scaffoldPage } from '../../mcp/src/scaffold.js';
import { validatePage } from '../../mcp/src/validate.js';

type BetaTool = Anthropic.Beta.Messages.BetaTool;

export const EVALS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = path.resolve(EVALS_ROOT, '../..');

/** Tool output cap: keeps a single get_* call from flooding the context (and the bill). */
export const MAX_TOOL_OUTPUT = 40_000;

export const kit = (root = REPO_ROOT): KitRegistry => loadKit(root);

/* ── tool definitions (JSON schema, strict) ────────────────────────────────── */

type Prop = {
  type: 'string' | 'boolean' | 'array';
  description: string;
  enum?: readonly string[];
  items?: { type: 'string' };
};
type Schema = {
  type: 'object';
  properties: Record<string, Prop>;
  required: string[];
  additionalProperties: false;
};

const schema = (properties: Record<string, Prop>, required: string[] = []): Schema => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

const includeSource: Prop = {
  type: 'boolean',
  description: 'Include the full source of every file (default false: metadata, usage snippet and file list only).',
};

export const TOOL_SCHEMAS = {
  list_kit: schema({
    kind: { type: 'string', enum: KIT_KINDS, description: 'component | layout | block | template' },
    group: { type: 'string', description: 'Group/family, e.g. "Forms", "tables", "Settings"' },
    query: { type: 'string', description: 'Keywords; every term must match id, name, group or description (e.g. "members", "date range")' },
  }),
  get_component: schema({ id: { type: 'string', description: 'Component or layout id from list_kit, e.g. "dialog", "settings-layout"' }, include_source: includeSource }, ['id']),
  get_block: schema({ id: { type: 'string', description: 'Block id from list_kit, e.g. "kpi-row", "data-table"' }, include_source: includeSource }, ['id']),
  get_template: schema({ id: { type: 'string', description: 'Template id from list_kit, e.g. "settings-members"' }, include_source: includeSource }, ['id']),
  scaffold_page: schema({
    template: { type: 'string', description: 'Template id: the page renders it (shell prop wired for console templates)' },
    blocks: { type: 'array', items: { type: 'string' }, description: 'Block ids in page order (used when no template fits)' },
    layout: { type: 'string', enum: PAGE_LAYOUTS, description: 'Layout for `blocks` (default: console)' },
    name: { type: 'string', description: 'Component name of the page (PascalCase)' },
    route: { type: 'string', description: 'Route, e.g. "/settings/members"' },
  }),
  validate_page: schema({ code: { type: 'string', description: 'Full TSX source of the page' } }, ['code']),
  submit_page: schema(
    {
      filename: { type: 'string', description: 'File name, e.g. "MembersPage.tsx"' },
      code: { type: 'string', description: 'Complete TSX source of the page (default export)' },
    },
    ['filename', 'code'],
  ),
} satisfies Record<string, Schema>;

export type ToolName = keyof typeof TOOL_SCHEMAS;
export const TOOL_NAMES = Object.keys(TOOL_SCHEMAS) as ToolName[];

const DESCRIPTIONS: Record<ToolName, string> = {
  list_kit:
    'Lists installable gntik-ui kit items (components, layouts, blocks, page templates) with one-line descriptions. Filter by kind, group and/or query. Start here.',
  get_component: 'A kit component or layout: package, export name, keyboard contract, tokens, a usage example and (optionally) its source.',
  get_block: 'A page block from @gntik-ai/blocks: export name, components it composes, usage snippet and (optionally) its source.',
  get_template:
    'A page template from @gntik-ai/templates: layout, blocks, whether it renders in ConsoleShell (takes a `shell` prop), usage and (optionally) its source.',
  scaffold_page:
    'Returns a ready-to-use TSX page built from the kit: either `template` (preferred when one fits) or `blocks` + `layout`.',
  validate_page: 'Checks a TSX page against the brand rules (hex/rgb colours, Tailwind palette classes, gradients, glow, dark: variants, fonts). 0 errors = pass.',
  submit_page: 'Submits the finished page. Call it exactly once, last, with the complete file. Ends the task.',
};

export interface ToolOptions {
  /** Stream tool input as it is generated (input is then validated client-side). */
  eagerInputStreaming?: boolean;
}

export function toolDefinitions(opts: ToolOptions = {}): BetaTool[] {
  return TOOL_NAMES.map((name) => ({
    name,
    description: DESCRIPTIONS[name],
    input_schema: TOOL_SCHEMAS[name],
    strict: true,
    ...(opts.eagerInputStreaming ? { eager_input_streaming: true } : {}),
  }));
}

/* ── input validation (eager streaming skips the server's) ─────────────────── */

/** Problems with `input` against the tool's schema; empty when valid. */
export function validateInput(name: string, input: unknown): string[] {
  const s = (TOOL_SCHEMAS as Record<string, Schema | undefined>)[name];
  if (!s) return [`unknown tool "${name}"`];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return ['input must be an object'];
  const obj = input as Record<string, unknown>;
  const errors: string[] = [];
  for (const key of s.required) if (!(key in obj)) errors.push(`missing required "${key}"`);
  for (const [key, value] of Object.entries(obj)) {
    const prop = s.properties[key];
    if (!prop) {
      errors.push(`unexpected property "${key}"`);
      continue;
    }
    if (value === undefined || value === null) continue;
    if (prop.type === 'array') {
      if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) errors.push(`"${key}" must be an array of strings`);
    } else if (typeof value !== prop.type) errors.push(`"${key}" must be a ${prop.type}`);
    else if (prop.enum && !prop.enum.includes(value as string)) errors.push(`"${key}" must be one of ${prop.enum.join(', ')}`);
  }
  return errors;
}

/* ── execution ─────────────────────────────────────────────────────────────── */

export interface ToolResult {
  content: string;
  isError: boolean;
  /** Set by submit_page: the episode ends. */
  submitted?: { filename: string; code: string };
}

const cap = (text: string) =>
  text.length > MAX_TOOL_OUTPUT ? `${text.slice(0, MAX_TOOL_OUTPUT)}\n\n…[truncated at ${MAX_TOOL_OUTPUT} characters]` : text;
const ok = (content: string): ToolResult => ({ content: cap(content), isError: false });
const fail = (content: string): ToolResult => ({ content, isError: true });
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined);

function getItem(k: KitRegistry, input: Record<string, unknown>, kinds: readonly KitKind[], label: string): ToolResult {
  const id = str(input.id) ?? '';
  const item = findKitItem(k, id, kinds);
  if (!item) {
    const near = kinds.flatMap((kind) => nearIds(k, id, kind));
    return fail(`No ${label} "${id}".${near.length ? ` Did you mean ${near.join(', ')}?` : ''} Use list_kit.`);
  }
  return ok(mdKitItem(k.root, item, { source: input.include_source === true }));
}

/** Runs one tool call. Never throws: failures come back as is_error results. */
export function runTool(name: string, rawInput: unknown, root = REPO_ROOT): ToolResult {
  const problems = validateInput(name, rawInput);
  if (problems.length) return fail(`Invalid input for ${name}: ${problems.join('; ')}. Raw input: ${JSON.stringify(rawInput)}`);
  const input = rawInput as Record<string, unknown>;
  try {
    const k = kit(root);
    switch (name as ToolName) {
      case 'list_kit':
        return ok(mdKitList(filterKit(k.items, { kind: str(input.kind), group: str(input.group), query: str(input.query) }), k.items.length));
      case 'get_component':
        return getItem(k, input, ['component', 'layout'], 'component or layout');
      case 'get_block':
        return getItem(k, input, ['block'], 'block');
      case 'get_template':
        return getItem(k, input, ['template'], 'template');
      case 'scaffold_page': {
        const s = scaffoldPage(k, {
          template: str(input.template),
          blocks: strs(input.blocks),
          layout: str(input.layout),
          name: str(input.name),
          route: str(input.route),
        });
        return s.ok ? ok(mdScaffold(s)) : fail(mdScaffold(s));
      }
      case 'validate_page': {
        const r = validatePage(str(input.code) ?? '');
        return ok(JSON.stringify({ ok: r.ok, errors: r.errors, warnings: r.warnings, tokensUsed: r.tokensUsed, findings: r.findings }, null, 2));
      }
      case 'submit_page': {
        const filename = str(input.filename) ?? 'Page.tsx';
        const code = str(input.code) ?? '';
        if (!code.trim()) return fail('submit_page needs the complete page source in `code`.');
        return { content: `Received ${filename} (${code.split('\n').length} lines). Task complete.`, isError: false, submitted: { filename, code } };
      }
    }
  } catch (e) {
    return fail(`${name} failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  return fail(`Unknown tool "${name}".`);
}
