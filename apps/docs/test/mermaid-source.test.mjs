import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

test('Mermaid live examples resolve the subpath to source without a library build', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    configLoader: 'runner',
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    for (const name of ['MermaidDiagramReply', 'MermaidDiagramStates']) {
      const importer = fileURLToPath(
        new URL(`../../../packages/chat/src/MermaidDiagram/examples/${name}.tsx`, import.meta.url),
      );
      const resolved = await server.environments.client.pluginContainer.resolveId('@gntik-ai/chat/mermaid', importer);
      assert.equal(resolved?.id, fileURLToPath(new URL('../../../packages/chat/src/mermaid.ts', import.meta.url)));
    }
  } finally {
    await server.close();
  }
});
