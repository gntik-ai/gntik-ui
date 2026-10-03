/* ============================================================================
   gntik-ui-mcp · build-registry.ts — genera registry.json en la raíz del repo
   ----------------------------------------------------------------------------
   registry.json es el contrato entre el catálogo y sus consumidores (este MCP,
   y más adelante la CLI y el sitio de docs). Uso:
     node dist/build-registry.js          → escribe registry.json
     node dist/build-registry.js --check  → falla si está desactualizado (CI)
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, PATHS, serializeIndex } from './indexer.js';

const root = process.env.GNTIK_UI_DIR
  ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const target = path.join(root, PATHS.registryJson);
const next = serializeIndex(buildIndex(root));

if (process.argv.includes('--check')) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current !== next) {
    process.stderr.write('registry.json is out of date: run `pnpm registry` and commit it.\n');
    process.exit(1);
  }
  process.stderr.write('registry.json is up to date.\n');
} else {
  fs.writeFileSync(target, next);
  process.stderr.write(`registry.json written (${Buffer.byteLength(next)} bytes).\n`);
}
