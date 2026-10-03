import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { applyCopy, fileSummary, planCopy } from '../copy.js';
import { installLines, openRegistry, runInstall, withInstallStatus, type CommandResult, type Context } from '../context.js';
import { CliError } from '../errors.js';
import { CONFIG_FILE, mapTarget } from '../project.js';
import type { RegistryItem } from '../registry.js';
import { copySection, exportNames, projectContext } from './add.js';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.turbo', '.vercel']);
const CODE = /\.(tsx?|jsx?|mts|mjs)$/;

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) await walk(path.join(dir, e.name), out);
    } else if (CODE.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

export interface Usage {
  file: string;
  line: number;
  names: string[];
  /** Suggested replacement import pointing at the ejected copy. */
  replacement: string;
}

/** Finds `import { … } from '<package>'` lines that use the ejected component's names. */
export async function findUsages(cwd: string, pkg: string, names: string[], localEntry: string, skip: Set<string>): Promise<Usage[]> {
  const usages: Usage[] = [];
  const re = new RegExp(String.raw`import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]${pkg.replace(/[/.]/g, '\\$&')}['"]`, 'g');
  for (const abs of await walk(cwd)) {
    const rel = path.relative(cwd, abs).split(path.sep).join('/');
    if (skip.has(rel)) continue;
    const text = await readFile(abs, 'utf8');
    for (const m of text.matchAll(re)) {
      const imported = (m[1] ?? '').split(',').map((s) => s.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]?.trim() ?? '');
      const hit = imported.filter((n) => names.includes(n));
      if (!hit.length) continue;
      let spec = path.posix.relative(path.posix.dirname(rel), localEntry);
      if (!spec.startsWith('.')) spec = `./${spec}`;
      const line = text.slice(0, m.index).split('\n').length;
      usages.push({ file: rel, line, names: hit, replacement: `import { ${hit.join(', ')} } from '${spec}';` });
    }
  }
  return usages;
}

export async function eject(ctx: Context, positionals: string[]): Promise<CommandResult> {
  const [id] = positionals;
  if (!id || positionals.length > 1) throw new CliError('USAGE', 'Usage: gntik-ui eject <id>');
  const project = projectContext(ctx);
  const { config, info } = project;
  const registry = await openRegistry(ctx, config.registry);
  const item = registry.get(id);
  if (!item) throw new CliError('NOT_FOUND', `Unknown item "${id}"`);
  const items: RegistryItem[] = ctx.flags.deps ? registry.closure([id]) : [item];

  const plan = await planCopy(registry, items, config, ctx.cwd, { includeDocs: true });
  const { conflicts, written } = await applyCopy(plan, ctx.cwd, { overwrite: ctx.flags.overwrite, dryRun: ctx.flags.dryRun });

  const indexFile = item.files.find((f) => /\/index\.[jt]sx?$/.test(f.path)) ?? item.files[0];
  const localEntry = indexFile
    ? (() => {
        const t = mapTarget(indexFile.target, item.kind, config);
        return /\/index\.[jt]sx?$/.test(t) ? path.posix.dirname(t) : t.replace(/\.[jt]sx?$/, '');
      })()
    : '';
  const indexContent = plan.files.find((f) => f.source === indexFile?.path)?.content;
  const names = exportNames(item, indexContent);
  const usages = await findUsages(ctx.cwd, item.package, names, localEntry, new Set(plan.files.map((f) => f.target)));

  const install = conflicts.length
    ? { packages: [], dev: [], commands: [], ran: false, exitCode: null }
    : runInstall(ctx, config.packageManager, info.packageJson, [...items.flatMap((i) => i.dependencies), ...plan.packages]);

  const nextSteps = [
    `Import ${names.join(', ')} from the local copy (${localEntry}) instead of '${item.package}'.`,
    ...(usages.length ? [`Update the ${usages.length} import(s) listed under usages.`] : []),
    'The copy no longer receives kit updates; diff against the registry when upgrading.',
  ];
  const data = {
    dryRun: ctx.flags.dryRun,
    configured: project.configured,
    id,
    items: items.map((i) => i.id),
    files: plan.files.map(fileSummary),
    written,
    conflicts,
    rewrites: plan.rewrites,
    warnings: plan.warnings,
    localImport: localEntry,
    exports: names,
    usages,
    nextSteps,
    install,
  };
  const text: string[] = [];
  if (!project.configured) text.push(`No ${CONFIG_FILE} found — using defaults (run gntik-ui init).`);
  text.push(`Eject ${item.name} (${items.map((i) => i.id).join(', ')}):`, ...copySection(plan, conflicts, ctx));
  if (conflicts.length) {
    if (ctx.flags.deps) text.push('Tip: --no-deps ejects only this item and keeps its dependencies on the package.');
    return { code: 4, data, text, error: new CliError('CONFLICT', `${conflicts.length} file(s) already exist: ${conflicts.join(', ')}`) };
  }
  text.push('Next:', ...nextSteps.map((s) => `  - ${s}`));
  for (const u of usages) text.push(`  ${u.file}:${u.line}  ${u.replacement}`);
  text.push(...installLines(install, ctx));
  return withInstallStatus({ code: 0, data, text }, install);
}
