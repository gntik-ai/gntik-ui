/* ============================================================================
   @gntik-ai/evals · score.ts — deterministic scoring of a submitted page
   ----------------------------------------------------------------------------
   brand        validate_page (the MCP brand validator): 0 errors = pass
   kitOnly      the rules of apps/musematic/scripts/check-kit-only.mjs
   typecheck    tsc --noEmit against the kit's published .d.ts (dist)
   composition  recall of the expected kit ids (+ mustNot penalty)
   efficiency   number of tool calls
   Weights: WEIGHTS below (documented in README.md).
   ============================================================================ */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { docInfoOf, exportNamesOf, usesConsoleShell, type KitItem, type KitRegistry } from '../../mcp/src/kit.js';
import { validatePage } from '../../mcp/src/validate.js';
import type { Task } from './battery.js';
import { EVALS_ROOT, REPO_ROOT, kit as loadKit } from './tools.js';

export const WEIGHTS = { brand: 25, kitOnly: 20, typecheck: 25, composition: 20, efficiency: 10 } as const;
export type Dimension = keyof typeof WEIGHTS;

/** Tool calls up to this many score full efficiency; the score reaches 0 at MAX_TURNS-like 20. */
export const EFFICIENT_CALLS = 6;
export const ZERO_EFFICIENCY_CALLS = 20;

export interface DimensionScore {
  /** 0..1 */
  score: number;
  pass: boolean;
  detail: string[];
}

export interface Scores {
  dimensions: Record<Dimension, DimensionScore>;
  /** Weighted 0..100. */
  total: number;
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

/** Removes block comments and whole-line // comments (same as check-kit-only.mjs). */
export const stripComments = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

/* ── (a) brand ────────────────────────────────────────────────────────────── */

/**
 * The validator's `no-tokens` warning ("no token class found") is ignored: a page composed only
 * of kit components legitimately carries no classes of its own.
 */
export function scoreBrand(code: string): DimensionScore {
  const r = validatePage(code, { allow: ['no-tokens'] });
  const detail = r.findings.map((f) => `${f.severity} ${f.rule} L${f.line}: ${f.excerpt}`);
  return { pass: r.ok, score: r.ok ? 1 - Math.min(0.3, 0.05 * r.warnings) : 0, detail: [`${r.errors} errors · ${r.warnings} warnings`, ...detail] };
}

/* ── (b) kit-only (rules of apps/musematic/scripts/check-kit-only.mjs) ─────── */

export const ALLOWED_IMPORT = /^(?:react(?:\/.*)?|react-dom(?:\/.*)?|@gntik-ai\/[^/]+(?:\/.*)?|\.{1,2}\/.*)$/;
const COLOUR_RULES: Array<[RegExp, string]> = [
  [/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g, 'hex colour literal'],
  [/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/gi, 'CSS colour function literal'],
];
const OWN_STYLING: Array<[RegExp, string]> = [
  [/\bclassName\s*=/g, 'sets className='],
  [/\bstyle\s*=/g, 'sets style='],
];
const IMPORT_RES = [
  /^\s*import\s+(?:type\s+)?[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  /^\s*import\s*['"]([^'"]+)['"]/gm,
  /^\s*export\s+(?:type\s+)?[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

export function importSpecifiers(code: string): string[] {
  const text = stripComments(code);
  return IMPORT_RES.flatMap((re) => [...text.matchAll(re)].map((m) => m[1] ?? ''));
}

export function scoreKitOnly(code: string): DimensionScore {
  const text = stripComments(code);
  const hard: string[] = [];
  const soft: string[] = [];
  for (const [re, message] of COLOUR_RULES) for (const m of text.matchAll(re)) hard.push(`L${lineOf(text, m.index)} ${message}: ${m[0]}`);
  for (const re of IMPORT_RES) {
    for (const m of text.matchAll(re)) {
      const spec = m[1] ?? '';
      const where = `L${lineOf(text, m.index)}`;
      if (!ALLOWED_IMPORT.test(spec)) hard.push(`${where} import of "${spec}" (only react, react-dom, @gntik-ai/* and relative paths)`);
      else if (spec.endsWith('.css')) hard.push(`${where} CSS import "${spec}" (global CSS belongs in the app's index.css)`);
    }
  }
  for (const [re, message] of OWN_STYLING) for (const m of text.matchAll(re)) soft.push(`L${lineOf(text, m.index)} ${message} (own styling)`);
  const pass = hard.length === 0;
  const score = pass ? Math.max(0.5, 1 - 0.1 * soft.length) : 0;
  return { pass, score, detail: [`${hard.length} violations · ${soft.length} own-styling uses`, ...hard, ...soft] };
}

/* ── (c) typecheck ────────────────────────────────────────────────────────── */

export const WORK_DIR = path.join(EVALS_ROOT, '.work');
const KIT_PACKAGES = ['ui', 'blocks', 'templates', 'icons', 'chat', 'charts', 'flow', 'editor', 'tokens'];

/** tsconfig `paths` resolving @gntik-ai/* to each package's published types and react to its @types. */
export function kitPaths(fromDir: string, root = REPO_ROOT): Record<string, string[]> {
  const rel = (p: string) => {
    const r = path.relative(fromDir, p).split(path.sep).join('/');
    return r.startsWith('.') ? r : `./${r}`;
  };
  const paths: Record<string, string[]> = {};
  for (const pkg of KIT_PACKAGES) {
    const dir = path.join(root, 'packages', pkg);
    let manifest: { exports?: Record<string, unknown> };
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as typeof manifest;
    } catch {
      continue;
    }
    for (const [sub, target] of Object.entries(manifest.exports ?? {})) {
      const types = typeof target === 'object' && target !== null ? (target as { types?: unknown }).types : undefined;
      if (typeof types !== 'string') continue;
      paths[`@gntik-ai/${pkg}${sub === '.' ? '' : sub.slice(1)}`] = [rel(path.join(dir, types))];
    }
  }
  const types = path.join(root, 'packages', 'ui', 'node_modules', '@types');
  for (const lib of ['react', 'react-dom']) {
    paths[lib] = [rel(path.join(types, lib, 'index.d.ts'))];
    paths[`${lib}/*`] = [`${rel(path.join(types, lib))}/*`];
  }
  return paths;
}

export interface TypecheckResult extends DimensionScore {
  errors: number;
}

const requireFrom = createRequire(import.meta.url);

/** Writes the page into .work/<id>/ with a tsconfig that resolves the kit, then runs `tsc --noEmit`. */
export function typecheckPage(id: string, code: string, root = REPO_ROOT): TypecheckResult {
  const dir = path.join(WORK_DIR, id.replace(/[^\w-]/g, '_'));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'Page.tsx'), code);
  fs.writeFileSync(path.join(dir, 'globals.d.ts'), "declare module '*.css';\n");
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      jsx: 'react-jsx',
      strict: true,
      noUncheckedIndexedAccess: true,
      skipLibCheck: true,
      isolatedModules: true,
      noEmit: true,
      types: [],
      paths: kitPaths(dir, root),
    },
    files: ['Page.tsx', 'globals.d.ts'],
  };
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  const tsc = requireFrom.resolve('typescript/bin/tsc');
  let out = '';
  try {
    execFileSync(process.execPath, [tsc, '-p', path.join(dir, 'tsconfig.json'), '--pretty', 'false'], { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim() || String(e);
  }
  const lines = out ? out.split('\n').filter((l) => /error TS\d+/.test(l)) : [];
  const errors = out && !lines.length ? 1 : lines.length;
  return { pass: errors === 0, score: errors === 0 ? 1 : 0, errors, detail: [`${errors} type errors`, ...(lines.length ? lines : out ? [out] : []).slice(0, 20)] };
}

/* ── (d) composition recall ───────────────────────────────────────────────── */

/** Names imported from @gntik-ai/* (original export name → local name). */
export function kitImports(code: string): Array<{ pkg: string; name: string; local: string }> {
  const text = stripComments(code);
  const out: Array<{ pkg: string; name: string; local: string }> = [];
  for (const m of text.matchAll(/^\s*import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"](@gntik-ai\/[^'"]+)['"]/gm)) {
    const pkg = m[2] ?? '';
    for (const raw of (m[1] ?? '').split(',')) {
      const spec = raw.trim().replace(/^type\s+/, '');
      if (!spec || raw.trim().startsWith('type ')) continue;
      const [name, local] = spec.split(/\s+as\s+/).map((s) => s.trim());
      if (name) out.push({ pkg, name, local: local || name });
    }
  }
  return out;
}

/** Kit ids the page uses: directly (imported and referenced) and through templates / ConsoleShell. */
export function usedKitIds(code: string, k: KitRegistry = loadKit()): { direct: Set<string>; all: Set<string> } {
  const body = stripComments(code).replace(/^\s*import\s[^;]*;?$/gm, '');
  const byName = new Map<string, KitItem[]>();
  for (const item of k.items) {
    for (const n of exportNamesOf(k.root, item)) {
      const key = `${item.package}:${n}`;
      byName.set(key, [...(byName.get(key) ?? []), item]);
    }
  }
  const direct = new Set<string>();
  const all = new Set<string>();
  const layouts = k.items.filter((i) => i.kind === 'layout');
  const viaShell = () => ['sidebar-layout', 'app-sidebar', 'app-topbar'].forEach((id) => all.add(id));
  for (const imp of kitImports(code)) {
    if (!new RegExp(`\\b${imp.local}\\b`).test(body)) continue;
    if (imp.pkg === '@gntik-ai/templates' && imp.name === 'ConsoleShell') viaShell();
    for (const item of byName.get(`${imp.pkg}:${imp.name}`) ?? []) {
      direct.add(item.id);
      all.add(item.id);
      if (item.kind !== 'template') continue;
      const info = docInfoOf(k.root, item);
      info.blocks.forEach((b) => all.add(b));
      for (const l of layouts) {
        const name = exportNamesOf(k.root, l)[0];
        if (name && info.layout && new RegExp(`\\b${name}\\b`).test(info.layout)) all.add(l.id);
      }
      if (usesConsoleShell(k.root, item)) viaShell();
    }
  }
  return { direct, all };
}

export function scoreComposition(task: Task, code: string, k: KitRegistry = loadKit()): DimensionScore & { recall: number } {
  const { all } = usedKitIds(code, k);
  const e = task.expect;
  const parts: Array<[string, boolean]> = [];
  if (e.templates?.length) parts.push([`template ${e.templates.join(' | ')}`, e.templates.some((t) => all.has(t))]);
  for (const id of [...(e.blocks ?? []), ...(e.components ?? []), ...(e.layout ? [e.layout] : [])]) parts.push([id, all.has(id)]);
  const hits = parts.filter(([, hit]) => hit).length;
  const recall = parts.length ? hits / parts.length : 1;
  const violations = (task.mustNot ?? []).filter((id) => all.has(id));
  const score = clamp01(recall - 0.25 * violations.length);
  return {
    recall,
    score,
    pass: recall === 1 && violations.length === 0,
    detail: [
      `recall ${hits}/${parts.length}`,
      ...parts.map(([id, hit]) => `${hit ? 'hit ' : 'miss'} ${id}`),
      ...violations.map((id) => `mustNot used: ${id}`),
      `used: ${[...all].sort().join(', ') || '—'}`,
    ],
  };
}

/* ── (e) efficiency ───────────────────────────────────────────────────────── */

export function scoreEfficiency(toolCalls: number): DimensionScore {
  const score =
    toolCalls <= EFFICIENT_CALLS ? 1 : clamp01(1 - (toolCalls - EFFICIENT_CALLS) / (ZERO_EFFICIENCY_CALLS - EFFICIENT_CALLS));
  return { score, pass: toolCalls <= EFFICIENT_CALLS, detail: [`${toolCalls} tool calls`] };
}

/* ── total ────────────────────────────────────────────────────────────────── */

export interface ScoreOptions {
  root?: string;
  /** Skip tsc (tests of the other dimensions). */
  typecheck?: boolean;
}

const zero = (why: string): DimensionScore => ({ score: 0, pass: false, detail: [why] });

export function scorePage(task: Task, code: string | undefined, toolCalls: number, opts: ScoreOptions = {}): Scores {
  if (code === undefined) {
    const none = zero('no page submitted');
    return { total: 0, dimensions: { brand: none, kitOnly: none, typecheck: none, composition: none, efficiency: none } };
  }
  const root = opts.root ?? REPO_ROOT;
  const dimensions: Record<Dimension, DimensionScore> = {
    brand: scoreBrand(code),
    kitOnly: scoreKitOnly(code),
    typecheck: opts.typecheck === false ? { score: 1, pass: true, detail: ['skipped'] } : typecheckPage(task.id, code, root),
    composition: scoreComposition(task, code, loadKit(root)),
    efficiency: scoreEfficiency(toolCalls),
  };
  const total = (Object.keys(WEIGHTS) as Dimension[]).reduce((sum, d) => sum + WEIGHTS[d] * dimensions[d].score, 0);
  for (const d of Object.values(dimensions)) d.score = round(d.score);
  return { dimensions, total: round(total, 1) };
}
