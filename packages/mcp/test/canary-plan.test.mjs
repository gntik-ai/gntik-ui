import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { planCanary, runCanaryPlan, lookupNpm } from '../scripts/canary-plan.mjs';

const fixtures = path.join(import.meta.dirname, 'fixtures/canary-plan');

function fixture(t, scenario) {
  const root = mkdtempSync(path.join(tmpdir(), 'canary-plan-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(path.join(fixtures, 'workspace'), root, { recursive: true });
  if (scenario) cpSync(path.join(fixtures, scenario), root, { recursive: true });
  return root;
}

test('a private-only changeset does not trigger a canary publication', (t) => {
  assert.equal(planCanary(fixture(t, 'private-only')).count, 0);
});

const script = path.resolve(import.meta.dirname, '../scripts/canary-plan.mjs');
const exec = promisify(execFile);
const probe = await exec(process.execPath, ['-p', '"canary-cli-probe"']);
const cliSkip =
  probe.stdout === 'canary-cli-probe\n'
    ? false
    : 'sandbox child-process stdout is unavailable (Node print probe returned empty output)';

for (const [scenario, count, expectedStdout] of [
  [undefined, 0, 'count=0\nreason=No pending changesets.\n'],
  ['public', 1, 'count=1\n'],
  [
    'private-only',
    0,
    'count=0\nreason=Only private/ignored changesets: "private-only.md" ("@gntik-ai/gntik-ui-mcp").\n',
  ],
  ['mixed', 1, 'count=1\n'],
  ['ignored', 0, 'count=0\nreason=Only private/ignored changesets: "ignored.md" ("@gntik-ai/docs").\n'],
]) {
  test(`plan and CLI output for ${scenario ?? 'no changesets'}`, async (t) => {
    const root = fixture(t, scenario);
    assert.equal(planCanary(root).count, count);
    assert.deepEqual(await runCanaryPlan(root), { exitCode: 0, stdout: expectedStdout, stderr: '' });
  });
  test(`spawned CLI output for ${scenario ?? 'no changesets'}`, { skip: cliSkip }, async (t) => {
    const { stdout, stderr } = await exec(process.execPath, [script], { cwd: fixture(t, scenario) });
    assert.equal(stdout, expectedStdout);
    assert.equal(stderr, '');
  });
}

test('double-quoted front matter is supported without parsing package-looking body text', (t) => {
  const root = fixture(t);
  writeFileSync(
    path.join(root, '.changeset/double.md'),
    '---\n"@gntik-ai/public": patch\n---\nnot front matter: "@gntik-ai/unknown": major\n',
  );
  assert.equal(planCanary(root).count, 1);
});

test('the snapshot guard rejects an unpublished plain version and names the package and version', async (t) => {
  const result = await runCanaryPlan(fixture(t), ['--verify-snapshot'], async (name) => name !== '@gntik-ai/public');
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /@gntik-ai\/public@1\.2\.3/);
  assert.match(result.stderr, /not a -canary- snapshot/);
});

test('all public canary snapshots pass, and private plain versions are never looked up', async (t) => {
  const result = await runCanaryPlan(fixture(t, 'all-canary'), ['--verify-snapshot'], async (name) => {
    assert.notEqual(name, '@gntik-ai/gntik-ui-mcp');
    return false;
  });
  assert.deepEqual(result, { exitCode: 0, stdout: '', stderr: '' });
});

test('already-published plain versions pass because there is nothing to publish', async (t) => {
  const result = await runCanaryPlan(fixture(t), ['--verify-snapshot'], async (name, version) => {
    return new Set(['@gntik-ai/public@1.2.3', '@gntik-ai/docs@2.0.0']).has(`${name}@${version}`);
  });
  assert.equal(result.exitCode, 0);
});

test('the guard includes ignored non-private workspace packages', async (t) => {
  const result = await runCanaryPlan(fixture(t), ['--verify-snapshot'], async (name) => name !== '@gntik-ai/docs');
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /@gntik-ai\/docs@2\.0\.0/);
  assert.match(result.stderr, /not a -canary- snapshot/);
});

for (const failure of ['registry unavailable', 'ETIMEDOUT']) {
  test(`registry failure ${failure} fails closed even for a canary version`, async (t) => {
    const result = await runCanaryPlan(fixture(t, 'all-canary'), ['--verify-snapshot'], async () => {
      throw new Error(failure);
    });
    assert.equal(result.exitCode, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Registry lookup failed for @gntik-ai\/docs@0\.0\.0-canary-20261112010101/);
  });
}

test('the npm boundary queries the exact public registry version without a shell and with a timeout', async () => {
  const published = await lookupNpm('@gntik-ai/public', '1.2.3', async (command, args, options) => {
    assert.equal(command, 'npm');
    assert.deepEqual(args, [
      'view',
      '@gntik-ai/public@1.2.3',
      'version',
      '--json',
      '--registry=https://registry.npmjs.org',
      '--fetch-retries=0',
      '--fetch-timeout=10000',
    ]);
    assert.equal(options.shell, false);
    assert.ok(options.timeout > 0 && options.timeout <= 60000);
    return { stdout: '"1.2.3"\n' };
  });
  assert.equal(published, true);
});

test('only an npm E404 is treated as an unpublished version', async () => {
  assert.equal(
    await lookupNpm('@gntik-ai/public', '1.2.3', async () => {
      throw Object.assign(new Error('npm view exited'), {
        code: 1,
        stdout: JSON.stringify({ error: { code: 'E404' } }),
      });
    }),
    false,
  );
});

for (const failure of [
  { code: 1, stdout: '{"error":{"code":"E401"}}' },
  { code: 1, stdout: '{"error":{"code":"E500"}}' },
  { code: 1, stdout: 'E404 in an unrelated error message' },
  { code: 'ETIMEDOUT', stdout: '' },
  { code: 1, killed: true, signal: 'SIGTERM', stdout: '{"error":{"code":"E404"}}' },
]) {
  test(`npm errors fail closed: ${JSON.stringify(failure)}`, async () => {
    await assert.rejects(
      () =>
        lookupNpm('@gntik-ai/public', '1.2.3', async () => {
          throw Object.assign(new Error('registry failure'), failure);
        }),
      /npm view failed for @gntik-ai\/public@1\.2\.3/,
    );
  });
}

for (const stdout of ['', 'null', '"1.2.4"', '{"error":{"code":"E404"}}']) {
  test(`unexpected successful npm output fails closed: ${JSON.stringify(stdout)}`, async () => {
    await assert.rejects(() => lookupNpm('@gntik-ai/public', '1.2.3', async () => ({ stdout })));
  });
}
