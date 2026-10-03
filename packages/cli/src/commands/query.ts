import { ok, openRegistry, type CommandResult, type Context } from '../context.js';
import { CliError } from '../errors.js';
import { loadConfig } from '../project.js';
import { ITEM_KINDS, summary, type Registry, type RegistryItem } from '../registry.js';

async function registryFor(ctx: Context): Promise<Registry> {
  let configured: string | undefined;
  try {
    configured = loadConfig(ctx.cwd)?.registry;
  } catch {
    configured = undefined;
  }
  return openRegistry(ctx, configured);
}

function checkKind(kind?: string) {
  if (kind && !(ITEM_KINDS as readonly string[]).includes(kind)) {
    throw new CliError('USAGE', `--kind must be one of ${ITEM_KINDS.join(', ')}`);
  }
}

/** Fixed-width table for humans. */
export function table(rows: string[][]): string[] {
  const widths = rows[0]?.map((_, i) => Math.max(...rows.map((r) => (r[i] ?? '').length))) ?? [];
  return rows.map((r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i] ?? 0))).join('  ').trimEnd());
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export async function list(ctx: Context): Promise<CommandResult> {
  const { kind, group } = ctx.flags;
  checkKind(kind);
  const registry = await registryFor(ctx);
  const items = registry.items.filter(
    (i) => (!kind || i.kind === kind) && (!group || i.group.toLowerCase() === group.toLowerCase()),
  );
  const rows = [['ID', 'KIND', 'GROUP', 'STATUS', 'PACKAGE'], ...items.map((i) => [i.id, i.kind, i.group, i.status, i.package])];
  return ok(
    { registry: registry.source.base, count: items.length, items: items.map(summary) },
    items.length ? [...table(rows), '', `${items.length} item(s)`] : ['No items match.'],
  );
}

/** Subsequence match: every query char appears in order. Returns a 0..1 closeness. */
function subsequence(q: string, s: string): number {
  let i = 0;
  let gaps = 0;
  let last = -1;
  for (let j = 0; j < s.length && i < q.length; j++) {
    if (s[j] === q[i]) {
      if (last >= 0) gaps += j - last - 1;
      last = j;
      i++;
    }
  }
  return i === q.length ? 1 / (1 + gaps) : 0;
}

/** Scores one item against one query term; 0 means no match. */
function termScore(term: string, item: RegistryItem): number {
  const id = item.id.toLowerCase();
  const name = item.name.toLowerCase();
  const group = item.group.toLowerCase();
  const desc = item.description.toLowerCase();
  if (id === term || name === term) return 100;
  if (id.startsWith(term) || name.startsWith(term)) return 80;
  if (id.includes(term) || name.includes(term)) return 60;
  if (group === term || group.includes(term)) return 40;
  if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(desc)) return 30;
  const fuzzy = Math.max(subsequence(term, id), subsequence(term, name));
  if (fuzzy > 0 && term.length >= 2) return Math.round(10 + 20 * fuzzy);
  if (desc.includes(term)) return 10;
  return 0;
}

export function searchItems(items: RegistryItem[], query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items
    .map((item) => {
      const scores = terms.map((t) => termScore(t, item));
      return { item, score: scores.every((s) => s > 0) ? scores.reduce((a, b) => a + b, 0) : 0 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
}

export async function search(ctx: Context, positionals: string[]): Promise<CommandResult> {
  const query = positionals.join(' ').trim();
  if (!query) throw new CliError('USAGE', 'Usage: gntik-ui search <query>');
  checkKind(ctx.flags.kind);
  const registry = await registryFor(ctx);
  let results = searchItems(
    registry.items.filter((i) => !ctx.flags.kind || i.kind === ctx.flags.kind),
    query,
  );
  if (ctx.flags.limit) results = results.slice(0, ctx.flags.limit);
  const rows = [['ID', 'KIND', 'SCORE', 'DESCRIPTION'], ...results.map((r) => [r.item.id, r.item.kind, String(r.score), truncate(r.item.description, 60)])];
  return ok(
    { query, count: results.length, items: results.map((r) => ({ ...summary(r.item), score: r.score })) },
    results.length ? table(rows) : [`No items match "${query}".`],
  );
}

export interface DocInfo {
  primitive: string | null;
  pattern: string | null;
  keyboard: Array<{ key: string; behaviour: string }>;
}

const STR = String.raw`(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|\x60((?:[^\x60\\]|\\.)*)\x60)`;
const unescape = (s: string) => s.replace(/\\(.)/g, '$1');

/** Reads primitive, pattern and the keyboard table from a *.doc.ts file without executing it. */
export function parseDocFile(text: string): DocInfo {
  const field = (name: string) => {
    const m = new RegExp(`\\b${name}\\s*:\\s*${STR}`).exec(text);
    return m ? unescape(m[1] ?? m[2] ?? m[3] ?? '') : null;
  };
  const keyboard: DocInfo['keyboard'] = [];
  const start = /\bkeyboard\s*:\s*\[/.exec(text);
  if (start) {
    let depth = 1;
    let i = start.index + start[0].length;
    for (; i < text.length && depth > 0; i++) {
      const c = text[i];
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === "'" || c === '"' || c === '`') {
        for (i++; i < text.length && text[i] !== c; i++) if (text[i] === '\\') i++;
      }
    }
    const body = text.slice(start.index + start[0].length, i - 1);
    const row = new RegExp(String.raw`\[\s*${STR}\s*,\s*${STR}\s*,?\s*\]`, 'g');
    for (const m of body.matchAll(row)) {
      keyboard.push({ key: unescape(m[1] ?? m[2] ?? m[3] ?? ''), behaviour: unescape(m[4] ?? m[5] ?? m[6] ?? '') });
    }
  }
  return { primitive: field('primitive'), pattern: field('pattern'), keyboard };
}

export async function docs(ctx: Context, positionals: string[]): Promise<CommandResult> {
  const [id] = positionals;
  if (!id || positionals.length > 1) throw new CliError('USAGE', 'Usage: gntik-ui docs <id>');
  const registry = await registryFor(ctx);
  const item = registry.get(id);
  if (!item) throw new CliError('NOT_FOUND', `Unknown item "${id}". Try: gntik-ui search ${id}`);
  let info: DocInfo = { primitive: null, pattern: null, keyboard: [] };
  if (item.docs) info = parseDocFile(await registry.read(item.docs));
  const text = [
    `${item.name} (${item.id}) — ${item.kind} · ${item.group} · ${item.status}`,
    '',
    item.description,
    '',
    `Package:      ${item.package}`,
    ...(info.primitive ? [`Primitive:    ${info.primitive}`] : []),
    ...(info.pattern ? [`ARIA pattern: ${info.pattern}`] : []),
    `Dependencies: ${item.dependencies.join(', ') || '—'}`,
    `Registry deps: ${item.registryDependencies.join(', ') || '—'}`,
    'Files:',
    ...item.files.map((f) => `  ${f.path} → ${f.target}`),
  ];
  if (info.keyboard.length) {
    text.push('', 'Keyboard:', ...table([['KEY', 'BEHAVIOUR'], ...info.keyboard.map((k) => [k.key, k.behaviour])]).map((l) => `  ${l}`));
  }
  return ok(
    {
      item: {
        ...summary(item),
        files: item.files,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        docs: item.docs ?? null,
      },
      primitive: info.primitive,
      pattern: info.pattern,
      keyboard: info.keyboard,
    },
    text,
  );
}
