import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { CliError } from './errors.js';
import type { ItemKind } from './registry.js';

export type Framework = 'vite' | 'next' | 'generic';
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export const CONFIG_FILE = 'gntik-ui.json';
export const SCOPE = '@gntik-ai';
export const NPM_REGISTRY = 'https://npm.pkg.github.com';

export interface GntikConfig {
  version: 1;
  framework: Framework;
  packageManager: PackageManager;
  /** Global CSS entry, project-relative. */
  css: string;
  /** Brand preset id (gntik, musematic, …). */
  brand: string;
  /** Project-relative directories that registry targets are mapped into. */
  aliases: { components: string; blocks: string; templates: string };
  /** Optional registry override (path or URL). */
  registry?: string;
}

export interface PackageJson {
  name?: string;
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ProjectInfo {
  cwd: string;
  framework: Framework;
  packageManager: PackageManager;
  /** Existing CSS entry (project-relative) or null when none was found. */
  css: string | null;
  /** Where the CSS entry would be created when none exists. */
  cssDefault: string;
  /** Uses a src/ directory. */
  src: boolean;
  /** Vite: main.tsx; Next: app/layout.tsx (existing or conventional path). */
  entry: string;
  packageJson: PackageJson | null;
}

const VITE_CONFIGS = ['ts', 'mts', 'js', 'mjs', 'cjs', 'cts'].map((e) => `vite.config.${e}`);
const NEXT_CONFIGS = ['ts', 'mjs', 'js', 'cjs'].map((e) => `next.config.${e}`);
const CSS_CANDIDATES = [
  'src/index.css',
  'src/styles.css',
  'src/globals.css',
  'src/app.css',
  'src/main.css',
  'src/styles/globals.css',
  'src/app/globals.css',
  'app/globals.css',
  'styles/globals.css',
  'styles.css',
];
const LOCKFILES: Array<[string, PackageManager]> = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
];

export function readJson<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    throw new CliError('ERROR', `${file} is not valid JSON`);
  }
}

export function detectPackageManager(cwd: string, pkg: PackageJson | null): PackageManager {
  let dir = cwd;
  for (;;) {
    for (const [file, pm] of LOCKFILES) if (existsSync(path.join(dir, file))) return pm;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const declared = pkg?.packageManager?.split('@')[0];
  if (declared === 'pnpm' || declared === 'yarn' || declared === 'bun' || declared === 'npm') return declared;
  return 'npm';
}

export function detectProject(cwd: string): ProjectInfo {
  const has = (f: string) => existsSync(path.join(cwd, f));
  const packageJson = readJson<PackageJson>(path.join(cwd, 'package.json'));
  const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
  let framework: Framework = 'generic';
  if (NEXT_CONFIGS.some(has) || 'next' in deps) framework = 'next';
  else if (VITE_CONFIGS.some(has) || 'vite' in deps) framework = 'vite';
  const src = has('src');
  const css = CSS_CANDIDATES.find(has) ?? null;
  let cssDefault = 'src/index.css';
  let entry = ['src/main.tsx', 'src/main.jsx', 'src/main.ts', 'src/main.js', 'src/index.tsx'].find(has) ?? 'src/main.tsx';
  if (framework === 'next') {
    const appDir = has('src/app') || (src && !has('app')) ? 'src/app' : 'app';
    cssDefault = `${appDir}/globals.css`;
    entry = ['tsx', 'jsx', 'js'].map((e) => `${appDir}/layout.${e}`).find(has) ?? `${appDir}/layout.tsx`;
  } else if (!src) {
    cssDefault = 'index.css';
  }
  return { cwd, framework, packageManager: detectPackageManager(cwd, packageJson), css, cssDefault, src, entry, packageJson };
}

export function defaultConfig(info: ProjectInfo, brand = 'gntik'): GntikConfig {
  const root = info.src ? 'src/' : '';
  return {
    version: 1,
    framework: info.framework,
    packageManager: info.packageManager,
    css: info.css ?? info.cssDefault,
    brand,
    aliases: { components: `${root}components`, blocks: `${root}components/blocks`, templates: `${root}components/templates` },
  };
}

export function loadConfig(cwd: string): GntikConfig | null {
  const cfg = readJson<GntikConfig>(path.join(cwd, CONFIG_FILE));
  if (!cfg) return null;
  if (!cfg.aliases?.components) throw new CliError('ERROR', `${CONFIG_FILE} is missing aliases.components`);
  return cfg;
}

/** Maps a registry target into the project via the config aliases (project-relative, posix). */
export function mapTarget(target: string, kind: ItemKind, config: GntikConfig): string {
  const { aliases } = config;
  const join = (dir: string, rest: string) => path.posix.join(dir || '.', rest);
  if (target.startsWith('components/')) return join(aliases.components, target.slice('components/'.length));
  if (target.startsWith('blocks/')) return join(aliases.blocks, target.slice('blocks/'.length));
  if (target.startsWith('templates/')) return join(aliases.templates, target.slice('templates/'.length));
  const dir = kind === 'block' ? aliases.blocks : kind === 'template' ? aliases.templates : aliases.components;
  return join(dir, target);
}

export function installedPackages(pkg: PackageJson | null): Set<string> {
  return new Set([...Object.keys(pkg?.dependencies ?? {}), ...Object.keys(pkg?.devDependencies ?? {})]);
}

export function installCommand(pm: PackageManager, packages: string[], dev = false): string[] {
  const verb = pm === 'npm' ? 'install' : 'add';
  return [pm, verb, ...(dev ? ['-D'] : []), ...packages];
}
