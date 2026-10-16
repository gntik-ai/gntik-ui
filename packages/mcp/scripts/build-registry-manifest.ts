/** Offline inventory gate. Discovery, not the committed manifest, defines the item set. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectSources, idOf } from './build-kit-registry.js';

export const ROOT = path.resolve(import.meta.dirname, '../../..');
export const RELEASE_COMMIT = 'b464709587664cf6588df02504fc88c02a7751c5';
export const PINNED_VERSIONS: Record<string, string> = {
  '@gntik-ai/blocks': '0.6.0',
  '@gntik-ai/templates': '0.6.0',
  '@gntik-ai/ui': '0.5.0',
  '@gntik-ai/chat': '0.5.0',
  '@gntik-ai/tokens': '0.2.1',
};
export interface ManifestRow {
  id: string;
  name: string;
  package: string;
  version: string;
  url: string;
  releaseCommit: string;
}
export interface Manifest {
  releaseCommit: string;
  pinnedVersions: Record<string, string>;
  missingComponents: string[];
  items: ManifestRow[];
}
export function gitFile(ref: string, file: string): Buffer {
  return execFileSync('git', ['-c', `safe.directory=${ROOT}`, 'show', `${ref}:${file}`], {
    cwd: ROOT,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
export function buildManifest(): Manifest {
  const sources = collectSources().map((s) => ({ id: idOf(s), package: s.pkg }));
  sources.push({ id: 'gntik-tokens', package: '@gntik-ai/tokens' });
  const snapshot = JSON.parse(gitFile(RELEASE_COMMIT, 'apps/docs/public/r/registry.json').toString()) as {
    items: { name: string }[];
  };
  const names = new Set(snapshot.items.map((item) => item.name));
  const items = sources
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => {
      const version = PINNED_VERSIONS[s.package];
      if (!version) throw new Error(`${s.id}: no pinned version for ${s.package}`);
      return { ...s, name: s.id, version, url: `https://ui.gntik.ai/r/${s.id}.json`, releaseCommit: RELEASE_COMMIT };
    });
  return {
    releaseCommit: RELEASE_COMMIT,
    pinnedVersions: PINNED_VERSIONS,
    missingComponents: items.filter((i) => !names.has(i.id)).map((i) => i.id),
    items,
  };
}

/** Inspect distribution fields only; source code and prose can legitimately mention .invalid. */
function invalidHosts(value: unknown, field = ''): string[] {
  if (typeof value === 'string') {
    if (!/(dependencies|registryDependencies|url|homepage)/i.test(field)) return [];
    return [...value.matchAll(/(?:https?:)?\/\/[^\s"'<>]+/g)].flatMap(([url]) => {
      try {
        const host = new URL(url.startsWith('//') ? `https:${url}` : url).hostname.toLowerCase().replace(/\.$/, '');
        return host === 'invalid' || host.endsWith('.invalid') ? [url] : [];
      } catch {
        return [];
      }
    });
  }
  if (Array.isArray(value)) return value.flatMap((v) => invalidHosts(v, field));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, v]) => invalidHosts(v, key));
  return [];
}

export function validateManifest(manifest: Manifest, files: Map<string, string>): string[] {
  const expected = buildManifest();
  const errors: string[] = [];
  const byId = new Map(manifest.items.map((row) => [row.id, row]));
  for (const row of expected.items) {
    const actual = byId.get(row.id);
    if (!actual) errors.push(`${row.id}: missing manifest row`);
    else if (JSON.stringify(actual) !== JSON.stringify(row))
      errors.push(`${row.id}: manifest row differs from discovery/pins`);
    if (!files.has(`${row.id}.json`)) errors.push(`${row.id}: missing generated item`);
  }
  const expectedIds = new Set(expected.items.map((row) => row.id));
  const seen = new Set<string>();
  for (const row of manifest.items) {
    if (seen.has(row.id)) errors.push(`${row.id}: duplicate manifest row`);
    seen.add(row.id);
    if (!expectedIds.has(row.id)) errors.push(`${row.id}: unexpected manifest row`);
    for (const url of invalidHosts(row)) errors.push(`${row.id}: invalid host ${url}`);
  }
  for (const [file, content] of files) {
    if (file === 'registry.json') continue;
    const id = file.replace(/\.json$/, '');
    if (!expectedIds.has(id)) errors.push(`${id}: unexpected generated item`);
    try {
      const item = JSON.parse(content) as { name: string };
      if (item.name !== id) errors.push(`${id}: generated item has name ${item.name}`);
      for (const url of invalidHosts(item)) errors.push(`${id}: invalid host ${url}`);
    } catch {
      errors.push(`${id}: invalid item JSON`);
    }
  }
  if (
    manifest.releaseCommit !== expected.releaseCommit ||
    JSON.stringify(manifest.pinnedVersions) !== JSON.stringify(expected.pinnedVersions) ||
    JSON.stringify(manifest.missingComponents) !== JSON.stringify(expected.missingComponents)
  )
    errors.push('manifest: release metadata differs from pinned snapshot');
  return errors;
}

// One row per line keeps the generated inventory readable and below 1000 lines.
export function serializeManifest(manifest: Manifest): string {
  const { items, ...metadata } = manifest;
  return `${JSON.stringify(metadata, null, 2).slice(0, -2)},\n  "items": [\n${items.map((row) => `    ${JSON.stringify(row)}`).join(',\n')}\n  ]\n}\n`;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(import.meta.filename)) {
  try {
    const out = path.join(ROOT, 'packages/mcp/registry-manifest.json');
    const expected = buildManifest();
    const json = serializeManifest(expected);
    if (process.argv.includes('--check')) {
      if (!fs.existsSync(out)) throw new Error('manifest: missing — run `pnpm registry`');
      const manifest = JSON.parse(fs.readFileSync(out, 'utf8')) as Manifest;
      const dir = path.join(ROOT, 'apps/docs/public/r');
      const files = new Map(
        fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.json'))
          .map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]),
      );
      const errors = validateManifest(manifest, files);
      if (fs.readFileSync(out, 'utf8') !== json) errors.push('manifest: stale — run `pnpm registry`');
      if (errors.length) throw new Error(errors.join('\n'));
      console.log(`registry manifest is up to date (${expected.items.length} rows).`);
    } else {
      fs.writeFileSync(out, json);
      console.log(`registry manifest written (${expected.items.length} rows).`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
