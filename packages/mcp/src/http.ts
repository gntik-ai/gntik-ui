/* ============================================================================
   gntik-ui-mcp · http.ts — transporte Streamable HTTP (stateless) para k8s
   ----------------------------------------------------------------------------
   POST /mcp    endpoint MCP (sin sesión: server nuevo por petición → escala
                horizontal sin sticky sessions)
   GET  /healthz  liveness  · GET /readyz  readiness (índice cargado)
   ============================================================================ */
import express from 'express';
import type { Server as HttpServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildServer, SERVER_VERSION, type ServerContext } from './server.js';

export function startHttp(ctx: ServerContext, port: number): Promise<HttpServer> {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, service: 'gntik-ui-mcp', version: SERVER_VERSION });
  });

  app.get('/readyz', (_req, res) => {
    try {
      const index = ctx.getIndex();
      if (index && index.stats.components > 0) {
        res.json({ ready: true, loadedAt: index.loadedAt, gitHead: index.gitHead, ...index.stats });
        return;
      }
    } catch { /* not ready */ }
    res.status(503).json({ ready: false });
  });

  app.post('/mcp', async (req, res) => {
    // Stateless: instancia nueva por petición; el índice compartido vive en ctx.
    const server = buildServer(ctx);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[gntik-ui-mcp] error en /mcp:', err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  const methodNotAllowed = (_req: express.Request, res: express.Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Método no permitido — server stateless: usa POST /mcp' },
      id: null,
    });
  };
  app.get('/mcp', methodNotAllowed);
  app.delete('/mcp', methodNotAllowed);

  return new Promise((resolve) => {
    const httpServer = app.listen(port, () => {
      console.error(`[gntik-ui-mcp] HTTP en :${port} — POST /mcp · GET /healthz · GET /readyz`);
      resolve(httpServer);
    });
  });
}
