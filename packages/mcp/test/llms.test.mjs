import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

test('generated llms docs direct consumers to the public npm registry', async () => {
  await tsImport(path.join(ROOT, 'packages/mcp/scripts/build-llms.ts'), import.meta.url);
  for (const file of ['llms.txt', 'llms-full.txt']) {
    const text = fs.readFileSync(path.join(ROOT, 'apps/docs/public', file), 'utf8');
    assert.match(text, /Packages are published as `@gntik-ai\/\*` on npmjs\.org/, file);
    assert.doesNotMatch(text, /GitHub Packages|@gntik-ai:registry|read:packages/, file);
  }
});
