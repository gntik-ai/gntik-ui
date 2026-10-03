import { applyCopy, fileSummary, planCopy, type CopyPlan } from '../copy.js';
import {
  installLines,
  openRegistry,
  runInstall,
  withInstallStatus,
  type CommandResult,
  type Context,
} from '../context.js';
import { CliError } from '../errors.js';
import { CONFIG_FILE, defaultConfig, detectProject, loadConfig, type GntikConfig, type ProjectInfo } from '../project.js';
import { isCopyIn, type RegistryItem } from '../registry.js';

export interface ProjectContext {
  info: ProjectInfo;
  config: GntikConfig;
  /** false when gntik-ui.json is missing and defaults were used. */
  configured: boolean;
}

export function projectContext(ctx: Context): ProjectContext {
  const info = detectProject(ctx.cwd);
  const loaded = loadConfig(ctx.cwd);
  return { info, config: loaded ?? defaultConfig(info), configured: loaded !== null };
}

/** Public export names of a component: from its index file, else its name. */
export function exportNames(item: RegistryItem, indexSource?: string): string[] {
  const names = new Set<string>();
  if (indexSource) {
    for (const m of indexSource.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of (m[1] ?? '').split(',')) {
        const p = part.trim();
        if (!p || p.startsWith('type ')) continue;
        const name = (p.split(/\s+as\s+/)[1] ?? p).trim();
        if (/^[A-Z]/.test(name)) names.add(name);
      }
    }
  }
  if (!names.size) names.add(item.name.replace(/[^A-Za-z0-9_$]/g, ''));
  return [...names];
}

export function importLine(names: string[], from: string) {
  return `import { ${names.join(', ')} } from '${from}';`;
}

async function packageImport(ctx: Context, item: RegistryItem, read: (p: string) => Promise<string>) {
  const index = item.files.find((f) => /\/index\.[jt]sx?$/.test(f.path));
  const src = index ? await read(index.path).catch(() => undefined) : undefined;
  return importLine(exportNames(item, src), item.package);
}

export function copySection(plan: CopyPlan, conflicts: string[], ctx: Context): string[] {
  const label = { create: ctx.flags.dryRun ? 'would create' : 'created', identical: 'unchanged', conflict: 'CONFLICT', overwrite: ctx.flags.dryRun ? 'would overwrite' : 'overwritten' };
  const lines = plan.files.map((f) => `  ${label[f.status].padEnd(15)} ${f.target}`);
  if (plan.rewrites.length) {
    lines.push('Rewritten imports:', ...plan.rewrites.map((r) => `  ${r.file}: '${r.from}' → '${r.to}'`));
  }
  if (plan.warnings.length) lines.push('Warnings:', ...plan.warnings.map((w) => `  ${w}`));
  if (conflicts.length) lines.push(`${conflicts.length} file(s) already exist and differ — nothing was written. Re-run with --overwrite to replace them.`);
  return lines;
}

export async function add(ctx: Context, positionals: string[]): Promise<CommandResult> {
  if (!positionals.length) throw new CliError('USAGE', 'Usage: gntik-ui add <id...>');
  const project = projectContext(ctx);
  const { config, info } = project;
  const registry = await openRegistry(ctx, config.registry);
  const closure = registry.closure(positionals);
  const requested = new Set(positionals);
  // Copy-in items (blocks, templates) are copied with their copy-in dependencies; components
  // and layouts they need come from their npm package.
  const toCopy = closure.filter((i) => isCopyIn(i.kind));
  const packageItems = closure.filter((i) => !isCopyIn(i.kind) && (requested.has(i.id) || toCopy.length > 0));
  const viaPackage = packageItems.filter((i) => requested.has(i.id));

  const plan = await planCopy(registry, toCopy, config, ctx.cwd);
  const { conflicts, written } = await applyCopy(plan, ctx.cwd, { overwrite: ctx.flags.overwrite, dryRun: ctx.flags.dryRun });

  const imports: string[] = [];
  for (const item of viaPackage) imports.push(await packageImport(ctx, item, (p) => registry.read(p)));

  const wanted = [
    ...packageItems.map((i) => i.package),
    ...toCopy.flatMap((i) => i.dependencies),
    ...plan.packages,
  ];
  const install = conflicts.length
    ? { packages: [], dev: [], commands: [], ran: false, exitCode: null }
    : runInstall(ctx, config.packageManager, info.packageJson, wanted);

  const data = {
    dryRun: ctx.flags.dryRun,
    configured: project.configured,
    items: closure.map((i) => ({ id: i.id, kind: i.kind, package: i.package, mode: isCopyIn(i.kind) ? 'copy' : 'package', requested: requested.has(i.id) })),
    files: plan.files.map(fileSummary),
    written,
    conflicts,
    rewrites: plan.rewrites,
    warnings: plan.warnings,
    imports,
    install,
  };
  const text: string[] = [];
  if (!project.configured) text.push(`No ${CONFIG_FILE} found — using defaults (run gntik-ui init).`);
  if (plan.files.length) text.push('Files:', ...copySection(plan, conflicts, ctx));
  if (imports.length) text.push('Import:', ...imports.map((l) => `  ${l}`));
  text.push(...installLines(install, ctx));
  if (conflicts.length) {
    return { code: 4, data, text, error: new CliError('CONFLICT', `${conflicts.length} file(s) already exist: ${conflicts.join(', ')}`) };
  }
  return withInstallStatus({ code: 0, data, text }, install);
}
