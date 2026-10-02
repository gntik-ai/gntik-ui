#!/usr/bin/env node
/* ============================================================================
   gntik-ui-mcp · index.ts — entrada CLI
   ----------------------------------------------------------------------------
   stdio (defecto): para Claude Code local →  claude mcp add gntik-ui -- node …
   http  (--http):  para Kubernetes        →  POST /mcp (+ /healthz /readyz)
   IMPORTANTE: en stdio, stdout es del protocolo → logs SIEMPRE a stderr.
   ============================================================================ */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolveConfig } from './config.js';
import { resolveRoot, pullClone, gitHead } from './source.js';
import { loadIndex } from './indexer.js';
import { buildServer, type ServerContext, type SyncResult } from './server.js';
import { startHttp } from './http.js';
import type { DesignSystemIndex } from './types.js';

const log = (...args: unknown[]) => console.error('[gntik-ui-mcp]', ...args);

async function main(): Promise<void> {
  const cfg = resolveConfig();
  const resolved = await resolveRoot(cfg);
  let index: DesignSystemIndex = loadIndex(resolved.root, {
    source: resolved.source,
    gitHead: await gitHead(resolved.root),
  });
  log(`catálogo: ${resolved.root} (${resolved.source})${index.gitHead ? ` · HEAD ${index.gitHead}` : ''}`);
  log(`índice: ${index.stats.components} componentes · ${index.stats.snippets} snippets · ${index.stats.tokens} tokens`);

  const ctx: ServerContext = {
    getIndex: () => index,
    async sync(): Promise<SyncResult> {
      let updated: boolean | undefined;
      if (resolved.source === 'git') {
        try {
          updated = (await pullClone(resolved.root, cfg)).updated;
        } catch (err) {
          log('sync: git pull falló, re-indexo el estado actual —', (err as Error).message);
        }
      }
      index = loadIndex(resolved.root, {
        source: resolved.source,
        gitHead: await gitHead(resolved.root),
      });
      return { root: resolved.root, source: resolved.source, gitHead: index.gitHead, updated, stats: index.stats };
    },
  };

  // auto-sync opcional (solo tiene sentido siguiendo un repo)
  if (cfg.syncMinutes > 0) {
    const timer = setInterval(() => {
      ctx.sync().then(
        (r) => log(`auto-sync ok${r.gitHead ? ` · HEAD ${r.gitHead}` : ''}`),
        (err) => log('auto-sync error:', (err as Error).message),
      );
    }, cfg.syncMinutes * 60_000);
    timer.unref();
    log(`auto-sync cada ${cfg.syncMinutes} min`);
  }

  if (cfg.transport === 'http') {
    const httpServer = await startHttp(ctx, cfg.port);
    const shutdown = (signal: string) => {
      log(`${signal} → cerrando`);
      httpServer.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 5_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } else {
    const server = buildServer(ctx);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log('stdio listo');
  }
}

main().catch((err) => {
  console.error('[gntik-ui-mcp] fallo al arrancar:', err instanceof Error ? err.message : err);
  process.exit(1);
});
