import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { promisify } from 'node:util';

test('Playwright readiness URL targets an emitted table labels HTML entry', async () => {
  const site = await mkdtemp(join(tmpdir(), 'gntik-table-labels-server-'));
  const previousSite = process.env.TABLE_LABELS_SITE;
  process.env.TABLE_LABELS_SITE = site;
  try {
    const { default: config } = await import('../playwright.table-labels.config.js');
    const env = { ...process.env, TABLE_LABELS_SITE: site };
    delete env.NODE_TEST_CONTEXT;
    const options = {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      env,
    };
    await promisify(execFile)(
      'pnpm',
      ['exec', 'vite', 'build', '--config', 'vite.table-labels.config.js', '--outDir', site],
      options,
    );
    const readiness = new URL(config.webServer.url);
    assert.equal(readiness.origin, new URL(config.use.baseURL).origin);
    const entry = join(site, readiness.pathname);
    assert.equal((await stat(entry)).isFile(), true, 'Playwright must probe an emitted HTML entry');
    assert.match(await readFile(entry, 'utf8'), /id="root"/, 'Readiness targets the interaction fixture');
  } finally {
    if (previousSite === undefined) delete process.env.TABLE_LABELS_SITE;
    else process.env.TABLE_LABELS_SITE = previousSite;
    await rm(site, { recursive: true, force: true });
  }
});
