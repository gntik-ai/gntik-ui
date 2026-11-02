import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

test('Inter assets can be reproduced from the installed font dependency without network', async (t) => {
  const output = mkdtempSync(join(tmpdir(), 'inter-sync-'));
  t.after(() => rmSync(output, { recursive: true, force: true }));
  await promisify(execFile)(process.execPath, [
    fileURLToPath(new URL('../scripts/sync-inter.mjs', import.meta.url)),
    output,
  ]);
  const shipped = new URL('../fonts/', import.meta.url);
  for (const file of ['inter.css', 'OFL.txt']) {
    assert.deepEqual(readFileSync(join(output, file)), readFileSync(new URL(file, shipped)), file);
  }
  const files = readdirSync(join(output, 'files')).sort();
  assert.deepEqual(files, readdirSync(new URL('files/', shipped)).sort());
  assert.equal(files.length, 7);
  for (const file of files) {
    assert.match(file, /-wght-normal\.woff2$/);
    assert.deepEqual(readFileSync(join(output, 'files', file)), readFileSync(new URL('files/' + file, shipped)), file);
  }
});
