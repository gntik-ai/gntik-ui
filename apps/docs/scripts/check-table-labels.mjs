import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Capture and compare in one invocation, with one toolchain and browser. Nothing is
// installed and screenshots never enter the source tree or its visual-update job.
const base = 'dde54ce4a82f122f5c0c10bc6e8e300f72484c8c';
const docs = fileURLToPath(new URL('../', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'gntik-table-labels-'));
const run = (command, args, cwd = docs, env = process.env, quiet = false) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: quiet ? 'ignore' : 'inherit' });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(Object.assign(new Error(`${command} exited with ${signal ?? code}`), { exitCode: code }));
    });
  });

try {
  let sourceRepo = repo;
  const git = ['-c', `safe.directory=${repo}`];
  try {
    await run('git', [...git, 'cat-file', '-e', `${base}^{commit}`], repo, process.env, true);
  } catch (error) {
    if (error.exitCode !== 128) throw error;
    // actions/checkout is shallow. Fetch only the immutable public source into a
    // temporary repository, with credential helpers and interactive prompts disabled.
    sourceRepo = join(scratch, 'git');
    mkdirSync(sourceRepo);
    await run('git', ['init', '--quiet'], sourceRepo);
    await run(
      'git',
      [
        '-c',
        'credential.helper=',
        'fetch',
        '--quiet',
        '--depth=1',
        '--no-tags',
        'https://github.com/gntik-ai/gntik-ui.git',
        base,
      ],
      sourceRepo,
      { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    );
  }
  const source = join(scratch, 'source');
  mkdirSync(source);
  const archive = join(scratch, 'base.tar');
  await run('git', [...git, 'archive', '-o', archive, base, 'packages/blocks/src'], sourceRepo);
  await run('tar', ['-xf', archive, '-C', source]);
  symlinkSync(join(repo, 'packages/blocks/node_modules'), join(source, 'packages/blocks/node_modules'), 'dir');

  const snapshots = join(scratch, 'snapshots');
  for (const phase of ['baseline', 'current']) {
    const site = join(scratch, phase);
    const env = {
      ...process.env,
      TABLE_LABELS_SITE: site,
      TABLE_LABELS_SNAPSHOT_DIR: snapshots,
      TABLE_LABELS_BASELINE_SOURCE: phase === 'baseline' ? join(source, 'packages/blocks/src/index.ts') : '',
    };
    await run(
      'pnpm',
      ['exec', 'vite', 'build', '--config', 'vite.table-labels.config.js', '--outDir', site],
      docs,
      env,
    );
    const args = ['exec', 'playwright', 'test', '--config', 'playwright.table-labels.config.js'];
    if (phase === 'baseline') args.push('--grep', 'default/', '--update-snapshots=all');
    else args.push('--update-snapshots=none');
    await run('pnpm', args, docs, env);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
