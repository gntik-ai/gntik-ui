#!/usr/bin/env node
/* ============================================================================
   gntik-ui-mcp · index.ts — CLI entry
   ----------------------------------------------------------------------------
   stdio (default): local Claude Code →  claude mcp add gntik-ui -- node …
   http  (--http):  Kubernetes        →  POST /mcp (+ /healthz /readyz)
   IMPORTANT: on stdio, stdout belongs to the protocol → logs ALWAYS to stderr.
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
  log(`design system: ${resolved.root} (${resolved.source})${index.gitHead ? ` · HEAD ${index.gitHead}` : ''}`);
  log(`index: ${index.stats.components} catalog entries · ${index.stats.snippets} snippets · ${index.stats.tokens} tokens`);

  const ctx: ServerContext = {
    getIndex: () => index,
    async sync(): Promise<SyncResult> {
      let updated: boolean | undefined;
      if (resolved.source === 'git') {
        try {
          updated = (await pullClone(resolved.root, cfg)).updated;
        } catch (err) {
          log('sync: git pull failed, re-indexing the current state —', (err as Error).message);
        }
      }
      index = loadIndex(resolved.root, {
        source: resolved.source,
        gitHead: await gitHead(resolved.root),
      });
      return { root: resolved.root, source: resolved.source, gitHead: index.gitHead, updated, stats: index.stats };
    },
  };

  // optional auto-sync (only meaningful when following a repo)
  if (cfg.syncMinutes > 0) {
    const timer = setInterval(() => {
      ctx.sync().then(
        (r) => log(`auto-sync ok${r.gitHead ? ` · HEAD ${r.gitHead}` : ''}`),
        (err) => log('auto-sync error:', (err as Error).message),
      );
    }, cfg.syncMinutes * 60_000);
    timer.unref();
    log(`auto-sync every ${cfg.syncMinutes} min`);
  }

  if (cfg.transport === 'http') {
    const httpServer = await startHttp(ctx, cfg.port);
    const shutdown = (signal: string) => {
      log(`${signal} → shutting down`);
      httpServer.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 5_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } else {
    const server = buildServer(ctx);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log('stdio ready');
  }
}

main().catch((err) => {
  console.error('[gntik-ui-mcp] failed to start:', err instanceof Error ? err.message : err);
  process.exit(1);
});
