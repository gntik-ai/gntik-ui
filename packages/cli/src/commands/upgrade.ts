import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ok, type CommandResult, type Context } from '../context.js';
import { CliError } from '../errors.js';
import { detectPackageManager, installCommand, readJson, SCOPE, type PackageJson } from '../project.js';
import { table } from './query.js';

export const CODEMODS_PACKAGE = '@gntik-ai/codemods';

/** The parts of @gntik-ai/codemods the CLI uses (the CLI has no dependency on it; it is loaded from the project). */
export interface CodemodMeta {
  id: string;
  package: string;
  fromVersion: string;
  toVersion: string;
  description: string;
  reportOnly: boolean;
}

export interface CodemodsFileResult {
  file: string;
  status: 'modified' | 'unchanged' | 'error';
  transforms: string[];
  reports: Array<{ transform: string; line: number | null; message: string }>;
  error?: string;
}

export interface CodemodsModule {
  VERSION?: string;
  transforms: readonly CodemodMeta[];
  selectTransforms(options: { from?: string | Record<string, string>; to?: string; only?: string[]; skip?: string[]; force?: boolean }): CodemodMeta[];
  runCodemods(options: { cwd: string; transforms: string[]; dry: boolean; files?: string[] }): Promise<{ scanned: number; files: CodemodsFileResult[] }>;
}

const VERSION_RE = /^v?\d+(\.\d+){0,2}(-[0-9A-Za-z.-]+)?$/;

/**
 * Finds @gntik-ai/codemods in the project's node_modules (walking up from cwd, like Node — but not
 * NODE_PATH or global folders, so only a package the project installed counts).
 */
export function findCodemods(cwd: string): string | null {
  let dir = path.resolve(cwd);
  for (;;) {
    const pkgDir = path.join(dir, 'node_modules', ...CODEMODS_PACKAGE.split('/'));
    if (existsSync(path.join(pkgDir, 'package.json'))) {
      try {
        // Self-reference through the package's own "exports".
        return createRequire(path.join(pkgDir, 'package.json')).resolve(CODEMODS_PACKAGE);
      } catch {
        return null;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Imports @gntik-ai/codemods from the project; null when it is not installed. */
export async function loadCodemods(cwd: string): Promise<{ module: CodemodsModule; path: string } | null> {
  const resolved = findCodemods(cwd);
  if (!resolved) return null;
  const mod = (await import(pathToFileURL(resolved).href)) as Partial<CodemodsModule>;
  if (!Array.isArray(mod.transforms) || typeof mod.selectTransforms !== 'function' || typeof mod.runCodemods !== 'function') {
    throw new CliError('ERROR', `${resolved} does not look like ${CODEMODS_PACKAGE} (missing transforms/selectTransforms/runCodemods)`);
  }
  return { module: mod as CodemodsModule, path: resolved };
}

/** Declared @gntik-ai/* versions in the project's package.json (ranges stripped; workspace:/file: specs skipped). */
export function declaredVersions(pkg: PackageJson | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, spec] of Object.entries({ ...pkg?.devDependencies, ...pkg?.dependencies })) {
    if (!name.startsWith(`${SCOPE}/`) || name === CODEMODS_PACKAGE) continue;
    const m = /\d+(\.\d+){0,2}(-[0-9A-Za-z.-]+)?/.exec(spec);
    if (m && !/^(workspace|file|link|git|github|https?):/.test(spec)) out[name] = m[0];
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

const metaOut = (t: CodemodMeta) => ({ id: t.id, package: t.package, fromVersion: t.fromVersion, toVersion: t.toVersion, reportOnly: t.reportOnly, description: t.description });

export async function upgrade(ctx: Context, positionals: string[]): Promise<CommandResult> {
  const { flags } = ctx;
  for (const [name, v] of [['--from', flags.from], ['--to', flags.to]] as const) {
    if (v !== undefined && !(name === '--to' && v === 'latest') && !VERSION_RE.test(v)) throw new CliError('USAGE', `${name} must be a version like 0.2.0, got "${v}"`);
  }
  const dryRun = !flags.apply;
  const pkg = readJson<PackageJson>(path.join(ctx.cwd, 'package.json'));
  const detected = declaredVersions(pkg);
  const from: string | Record<string, string> | null = flags.from ?? (Object.keys(detected).length ? detected : null);
  const to = flags.to ?? 'latest';

  const loaded = await loadCodemods(ctx.cwd);
  if (!loaded) {
    const install = installCommand(detectPackageManager(ctx.cwd, pkg), [CODEMODS_PACKAGE], true).join(' ');
    return {
      code: 1,
      data: { dryRun, from, to, codemods: { installed: false, version: null, install } },
      text: [`${CODEMODS_PACKAGE} is not installed in this project. Install it, then run upgrade again:`, `  ${install}`],
      error: new CliError('CODEMODS', `${CODEMODS_PACKAGE} not found from ${ctx.cwd}`),
    };
  }
  const { module: mods } = loaded;
  const codemods = { installed: true, version: mods.VERSION ?? null, install: null };
  const known = new Set(mods.transforms.map((t) => t.id));
  const unknown = [...flags.codemods, ...flags.skipCodemods].filter((id) => !known.has(id));
  if (unknown.length) throw new CliError('NOT_FOUND', `Unknown codemod(s): ${unknown.join(', ')}. Run gntik-ui upgrade --list.`);

  const selected = mods.selectTransforms({
    from: from ?? undefined,
    to,
    only: flags.codemods.length ? flags.codemods : undefined,
    skip: flags.skipCodemods,
    // Codemods named with --codemod run whatever the versions say.
    force: flags.codemods.length > 0,
  });
  const selectedIds = new Set(selected.map((t) => t.id));
  const fromLabel = from === null ? 'any version' : typeof from === 'string' ? from : Object.entries(from).map(([n, v]) => `${n}@${v}`).join(', ');
  const header = `${CODEMODS_PACKAGE} ${codemods.version ?? '?'} · from ${fromLabel} → ${to}`;

  if (flags.list) {
    const rows = [['ID', 'PACKAGE', 'VERSIONS', 'SELECTED', 'KIND'], ...mods.transforms.map((t) => [t.id, t.package, `${t.fromVersion} → ${t.toVersion}`, selectedIds.has(t.id) ? 'yes' : 'no', t.reportOnly ? 'report' : 'rewrite'])];
    return ok(
      { dryRun, from, to, codemods, transforms: mods.transforms.map((t) => ({ ...metaOut(t), selected: selectedIds.has(t.id) })) },
      [header, '', ...table(rows), '', ...mods.transforms.map((t) => `${t.id}: ${t.description}`)],
    );
  }

  const base = { dryRun, from, to, codemods, transforms: selected.map(metaOut) };
  if (!selected.length) {
    return ok({ ...base, scanned: 0, files: [], changed: [], reports: [], errors: [] }, [header, 'No codemods apply to this upgrade.']);
  }
  const result = await mods.runCodemods({ cwd: ctx.cwd, transforms: selected.map((t) => t.id), dry: dryRun, files: positionals.length ? positionals : undefined });
  const files = [...result.files].sort((a, b) => a.file.localeCompare(b.file));
  const changed = files.filter((f) => f.status === 'modified').map((f) => f.file);
  const reports = files.flatMap((f) => f.reports.map((r) => ({ file: f.file, line: r.line, transform: r.transform, message: r.message })));
  const errors = files.filter((f) => f.status === 'error').map((f) => ({ file: f.file, message: f.error ?? 'failed' }));
  const data = { ...base, scanned: result.scanned, files, changed, reports, errors };

  const text = [header, `Codemods: ${selected.map((t) => t.id).join(', ')}`, `Scanned ${result.scanned} file(s).`];
  const verb = dryRun ? 'Would modify' : 'Modified';
  if (changed.length) text.push('', `${verb} ${changed.length} file(s):`, ...files.filter((f) => f.status === 'modified').map((f) => `  ${f.file} (${f.transforms.join(', ')})`));
  else text.push('No files to change.');
  if (reports.length) text.push('', `Warnings (${reports.length}):`, ...reports.map((r) => `  ${r.file}${r.line ? `:${r.line}` : ''} [${r.transform}] ${r.message}`));
  if (errors.length) text.push('', `Errors (${errors.length}):`, ...errors.map((e) => `  ${e.file}: ${e.message}`));
  if (dryRun && changed.length) text.push('', 'Dry run: nothing was written. Re-run with --apply to write the changes.');

  if (errors.length) return { code: 1, data, text, error: new CliError('ERROR', `${errors.length} file(s) could not be transformed`) };
  return ok(data, text);
}
