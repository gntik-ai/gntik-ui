/* ============================================================================
   gntik-ui-mcp · config.ts — configuración por entorno + flags CLI
   ----------------------------------------------------------------------------
   Variables de entorno:
     MCP_TRANSPORT          stdio | http           (defecto: stdio)
     PORT                   puerto HTTP            (defecto: 8080)
     GNTIK_UI_DIR           checkout local del catálogo gntik-ui
     GNTIK_UI_REPO          URL git del catálogo (si no hay checkout local)
     GNTIK_UI_REF           rama/tag a seguir      (defecto: main)
     GNTIK_UI_TOKEN | GITHUB_TOKEN   token para clonar repos privados
     GNTIK_UI_CACHE         directorio de clonado  (defecto: $TMPDIR/gntik-ui-mcp)
     GNTIK_UI_SYNC_MINUTES  auto-sync en modo git  (defecto: 0 = off)
   Flags CLI: --stdio · --http · --port <n>   (tienen prioridad sobre el entorno)
   ============================================================================ */
import path from 'node:path';
import os from 'node:os';

export interface Config {
  transport: 'stdio' | 'http';
  port: number;
  dir?: string;
  repo?: string;
  ref: string;
  token?: string;
  cacheDir: string;
  syncMinutes: number;
}

export function resolveConfig(
  argv: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
): Config {
  let transport: 'stdio' | 'http' = env.MCP_TRANSPORT === 'http' ? 'http' : 'stdio';
  if (argv.includes('--http')) transport = 'http';
  if (argv.includes('--stdio')) transport = 'stdio';

  let port = Number(env.PORT || 8080);
  const portIdx = argv.indexOf('--port');
  if (portIdx >= 0 && argv[portIdx + 1]) port = Number(argv[portIdx + 1]);
  if (!Number.isFinite(port) || port <= 0) port = 8080;

  return {
    transport,
    port,
    dir: env.GNTIK_UI_DIR || undefined,
    repo: env.GNTIK_UI_REPO || undefined,
    ref: env.GNTIK_UI_REF || 'main',
    token: env.GNTIK_UI_TOKEN || env.GITHUB_TOKEN || undefined,
    cacheDir: env.GNTIK_UI_CACHE || path.join(os.tmpdir(), 'gntik-ui-mcp'),
    syncMinutes: Number(env.GNTIK_UI_SYNC_MINUTES || 0) || 0,
  };
}
