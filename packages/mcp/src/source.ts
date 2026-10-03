/* ============================================================================
   gntik-ui-mcp · source.ts — localizar (o clonar) el catálogo gntik-ui
   ----------------------------------------------------------------------------
   Orden de resolución:
     1. GNTIK_UI_DIR (checkout local explícito)
     2. Autodetección: el server vive en gntik-ui/mcp → la raíz del repo es ../
     3. GNTIK_UI_REPO → clon shallow en GNTIK_UI_CACHE (con token si es privado)
   El pull automático solo se hace sobre el clon propio (source === 'git');
   un checkout local del usuario JAMÁS se toca.
   ============================================================================ */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from './config.js';

const run = promisify(execFile);

export interface ResolvedRoot {
  root: string;
  source: 'dir' | 'git';
}

/** Un checkout válido trae registry.json o el catálogo fuente. */
export function isDesignSystemRoot(dir: string): boolean {
  try {
    return fs.existsSync(path.join(dir, 'registry.json'))
      || fs.existsSync(path.join(dir, 'apps', 'docs', 'src', 'catalog', 'registry.jsx'));
  } catch {
    return false;
  }
}

function authUrl(repo: string, token?: string): string {
  if (!token || !repo.startsWith('https://')) return repo;
  try {
    const u = new URL(repo);
    u.username = 'x-access-token';
    u.password = token;
    return u.toString();
  } catch {
    return repo;
  }
}

export async function gitHead(root: string): Promise<string | undefined> {
  try {
    const { stdout } = await run('git', ['-C', root, 'rev-parse', '--short', 'HEAD']);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export async function resolveRoot(cfg: Config): Promise<ResolvedRoot> {
  // 1 · directorio explícito
  if (cfg.dir) {
    const dir = path.resolve(cfg.dir);
    if (!isDesignSystemRoot(dir)) {
      throw new Error(
        `GNTIK_UI_DIR=${dir} no parece un checkout de gntik-ui (falta registry.json o apps/docs/src/catalog/registry.jsx)`,
      );
    }
    return { root: dir, source: 'dir' };
  }

  // 2 · autodetección relativa al server (gntik-ui/packages/mcp/dist → ../../..) y al cwd
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, '..', '..'),
    path.resolve(here, '..', '..', '..'),
    process.cwd(),
    path.resolve(process.cwd(), 'gntik-ui'),
  ];
  for (const c of candidates) {
    if (isDesignSystemRoot(c)) return { root: c, source: 'dir' };
  }

  // 3 · clon desde git
  if (cfg.repo) {
    const dest = path.join(cfg.cacheDir, 'checkout');
    if (isDesignSystemRoot(dest)) {
      await pullClone(dest, cfg).catch(() => undefined); // best effort
      return { root: dest, source: 'git' };
    }
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(cfg.cacheDir, { recursive: true });
    await run('git', [
      'clone', '--depth', '1', '--branch', cfg.ref, authUrl(cfg.repo, cfg.token), dest,
    ]);
    if (!isDesignSystemRoot(dest)) {
      throw new Error(`El repo clonado (${cfg.repo}) no contiene el catálogo gntik-ui`);
    }
    return { root: dest, source: 'git' };
  }

  throw new Error(
    'No encuentro el catálogo gntik-ui. Define GNTIK_UI_DIR (checkout local) o GNTIK_UI_REPO (URL git).',
  );
}

/** Actualiza el clon propio a origin/<ref>. Solo para source === 'git'. */
export async function pullClone(root: string, cfg: Config): Promise<{ updated: boolean; head?: string }> {
  const before = await gitHead(root);
  await run('git', ['-C', root, 'fetch', '--depth', '1', 'origin', cfg.ref]);
  await run('git', ['-C', root, 'reset', '--hard', `origin/${cfg.ref}`]);
  const after = await gitHead(root);
  return { updated: before !== after, head: after };
}
