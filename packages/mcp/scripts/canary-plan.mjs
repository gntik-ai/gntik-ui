import { globSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function workspacePackages(root) {
  // Only the packages list is relevant; other pnpm workspace settings are not YAML inputs here.
  const workspace = readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
  const list = workspace.match(/^packages:\s*\n((?:[ \t]+[^\n]*\n|\s*\n)*)/m)?.[1];
  const patterns = [...(list ?? '').matchAll(/^\s+-\s+['"]?([^'"\s]+)['"]?\s*$/gm)].map((m) => m[1]);
  if (patterns.length === 0) throw new Error('No workspace package patterns found');
  return globSync(
    patterns.map((pattern) => `${pattern}/package.json`),
    { cwd: root },
  )
    .sort()
    .map((file) => readJson(path.join(root, file)));
}

function pendingChangesets(root) {
  return readdirSync(path.join(root, '.changeset'))
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .sort()
    .map((file) => {
      const lines = readFileSync(path.join(root, '.changeset', file), 'utf8').split(/\r?\n/);
      const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
      if (lines[0]?.trim() !== '---' || end < 0) throw new Error(`Invalid front matter: ${file}`);
      const packages = lines.slice(1, end).flatMap((line) => {
        if (!line.trim() || line.trim().startsWith('#')) return [];
        const match = line.trim().match(/^(?:'([^']+)'|"([^"]+)"|([^'"\s:]+))\s*:\s*(patch|minor|major)\s*(?:#.*)?$/);
        if (!match) throw new Error(`Invalid package entry in ${file}`);
        return [match[1] ?? match[2] ?? match[3]];
      });
      return { file, packages };
    });
}

function changesetEligibility(root) {
  const manifests = new Map(workspacePackages(root).map((pkg) => [pkg.name, pkg]));
  const ignored = new Set(readJson(path.join(root, '.changeset/config.json')).ignore ?? []);
  return pendingChangesets(root).map((changeset) => ({
    ...changeset,
    public: changeset.packages.some((name) => {
      const pkg = manifests.get(name);
      if (!pkg) throw new Error(`Unknown workspace package ${name} in ${changeset.file}`);
      return !pkg.private && !ignored.has(name);
    }),
  }));
}

export function planCanary(root) {
  const changesets = changesetEligibility(root);
  const count = changesets.filter((changeset) => changeset.public).length;
  const reason =
    count > 0
      ? undefined
      : changesets.length === 0
        ? 'No pending changesets.'
        : `Only private/ignored changesets: ${changesets.map(({ file, packages }) => `${JSON.stringify(file)} (${packages.map((name) => JSON.stringify(name)).join(', ')})`).join('; ')}.`;
  return { count, reason };
}

export function checkChangesetHygiene(root) {
  const invalid = changesetEligibility(root).filter((row) => row.packages.length > 0 && !row.public);
  if (invalid.length > 0) {
    throw new Error(
      invalid
        .map(
          ({ file, packages }) =>
            `Drop ${JSON.stringify(file)} (${packages.join(', ')}): it names only private/ignored packages; privatePackages.version is false and ignored packages are not versioned.`,
        )
        .join('\n'),
    );
  }
}

export async function lookupNpm(name, version, execute = promisify(execFile)) {
  let stdout;
  try {
    ({ stdout } = await execute(
      'npm',
      [
        'view',
        `${name}@${version}`,
        'version',
        '--json',
        '--registry=https://registry.npmjs.org',
        '--fetch-retries=0',
        '--fetch-timeout=10000',
      ],
      { encoding: 'utf8', shell: false, timeout: 30000, maxBuffer: 1024 * 1024 },
    ));
  } catch (error) {
    let response;
    try {
      response = JSON.parse(error.stdout);
    } catch {
      // Non-JSON errors, including network failures, cannot establish publication status.
    }
    if (error.code === 1 && !error.killed && !error.signal && response?.error?.code === 'E404') return false;
    throw new Error(`npm view failed for ${name}@${version}`, { cause: error });
  }
  if (JSON.parse(stdout) !== version) throw new Error('Unexpected npm view response');
  return true;
}

export async function verifySnapshot(root, lookup = lookupNpm) {
  for (const pkg of workspacePackages(root).filter((pkg) => !pkg.private)) {
    let published;
    try {
      published = await lookup(pkg.name, pkg.version);
      if (typeof published !== 'boolean') throw new Error('Invalid registry response');
    } catch {
      throw new Error(`Registry lookup failed for ${pkg.name}@${pkg.version}; refusing canary publication.`);
    }
    if (!published && !pkg.version?.includes('-canary-')) {
      throw new Error(
        `${pkg.name}@${pkg.version} is unpublished and not a -canary- snapshot; refusing canary publication.`,
      );
    }
  }
}

export async function runCanaryPlan(root, args = [], lookup = lookupNpm) {
  try {
    if (args.length === 1 && args[0] === '--verify-snapshot') {
      await verifySnapshot(root, lookup);
      return { exitCode: 0, stdout: '', stderr: '' };
    }
    if (args.length > 0) throw new Error('Usage: canary:plan [--verify-snapshot]');
    const { count, reason } = planCanary(root);
    return { exitCode: 0, stdout: `count=${count}\n${reason ? `reason=${reason}\n` : ''}`, stderr: '' };
  } catch (error) {
    return { exitCode: 1, stdout: '', stderr: `${error.message}\n` };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runCanaryPlan(process.cwd(), process.argv.slice(2));
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}
