import { spawnSync } from 'node:child_process';
import type { Flags } from './args.js';
import { CliError } from './errors.js';
import { installCommand, installedPackages, type PackageJson, type PackageManager } from './project.js';
import { DEFAULT_REGISTRY, loadRegistry, type Registry } from './registry.js';

export type Exec = (cmd: string, args: string[], opts: { cwd: string; quiet: boolean }) => number;

export const defaultExec: Exec = (cmd, args, { cwd, quiet }) => {
  const r = spawnSync(cmd, args, { cwd, stdio: quiet ? 'pipe' : 'inherit', shell: process.platform === 'win32' });
  if (r.error) return 127;
  return r.status ?? 1;
};

export interface Context {
  /** Project directory (absolute). */
  cwd: string;
  /** Directory relative --registry paths resolve against (the shell's cwd). */
  invocationCwd: string;
  flags: Flags;
  exec: Exec;
  env: Record<string, string | undefined>;
}

/** What a command hands back: data for --json and lines for humans. */
export interface CommandResult {
  code: number;
  data: Record<string, unknown>;
  text: string[];
  error?: CliError;
}

export const ok = (data: Record<string, unknown>, text: string[]): CommandResult => ({ code: 0, data, text });

export function registrySpec(ctx: Context, configured?: string): string {
  return ctx.flags.registry ?? ctx.env.GNTIK_UI_REGISTRY ?? configured ?? DEFAULT_REGISTRY;
}

export async function openRegistry(ctx: Context, configured?: string): Promise<Registry> {
  return loadRegistry(registrySpec(ctx, configured), ctx.invocationCwd);
}

export interface InstallReport {
  packages: string[];
  dev: string[];
  commands: string[];
  ran: boolean;
  exitCode: number | null;
}

/**
 * Installs the packages the project does not declare yet. Runs only when installing is allowed
 * (no --dry-run, no --no-install); otherwise reports the commands.
 */
export function runInstall(
  ctx: Context,
  pm: PackageManager,
  pkg: PackageJson | null,
  wanted: string[],
  wantedDev: string[] = [],
): InstallReport {
  const have = installedPackages(pkg);
  const packages = [...new Set(wanted)].filter((p) => !have.has(p)).sort();
  const dev = [...new Set(wantedDev)].filter((p) => !have.has(p) && !packages.includes(p)).sort();
  const cmds: string[][] = [];
  if (packages.length) cmds.push(installCommand(pm, packages));
  if (dev.length) cmds.push(installCommand(pm, dev, true));
  const report: InstallReport = { packages, dev, commands: cmds.map((c) => c.join(' ')), ran: false, exitCode: null };
  if (!cmds.length || ctx.flags.dryRun || !ctx.flags.install) return report;
  report.ran = true;
  for (const [cmd, ...args] of cmds) {
    const code = ctx.exec(cmd as string, args, { cwd: ctx.cwd, quiet: ctx.flags.json });
    report.exitCode = code;
    if (code !== 0) break;
  }
  return report;
}

export function installLines(report: InstallReport, ctx: Context): string[] {
  if (!report.commands.length) return ['Packages: already installed.'];
  const verb = report.ran ? 'Ran' : ctx.flags.dryRun ? 'Would run' : 'Run';
  const lines = report.commands.map((c) => `${verb}: ${c}`);
  if (report.ran && report.exitCode !== 0) lines.push(`Install failed (exit ${report.exitCode}).`);
  return lines;
}

/** Turns a failed install into a non-zero result that still carries the data. */
export function withInstallStatus(result: CommandResult, report: InstallReport): CommandResult {
  if (report.ran && report.exitCode !== 0) {
    return { ...result, code: 1, error: new CliError('INSTALL', `Install command failed with exit code ${report.exitCode}`) };
  }
  return result;
}
