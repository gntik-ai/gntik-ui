import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { checkChangesetHygiene } from '../scripts/canary-plan.mjs';

const fixtures = path.join(import.meta.dirname, 'fixtures/canary-plan');
const repo = path.resolve(import.meta.dirname, '../../..');

test('hygiene rejects a private-only changeset with instructions to drop it', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'changeset-hygiene-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(path.join(fixtures, 'workspace'), root, { recursive: true });
  cpSync(path.join(fixtures, 'private-only'), root, { recursive: true });
  assert.throws(
    () => checkChangesetHygiene(root),
    (error) => {
      assert.match(error.message, /private-only\.md/);
      assert.match(error.message, /[Dd]rop/);
      assert.match(error.message, /privatePackages\.version is false/);
      assert.doesNotMatch(error.message, /BODY_MUST_NEVER_APPEAR/);
      return true;
    },
  );
});

test('the current repository has no private-only or ignored-only changesets', () => {
  assert.doesNotThrow(() => checkChangesetHygiene(repo));
});

test('hygiene also rejects ignored-only changesets', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'changeset-hygiene-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(path.join(fixtures, 'workspace'), root, { recursive: true });
  cpSync(path.join(fixtures, 'ignored'), root, { recursive: true });
  assert.throws(() => checkChangesetHygiene(root), /Drop "ignored\.md"/);
});
