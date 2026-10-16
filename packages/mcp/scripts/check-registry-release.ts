/** Release-only fidelity gate. This is the only registry check that accesses public npm. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ROOT, gitFile, validateManifest, type Manifest, type ManifestRow } from './build-registry-manifest.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
interface RegistryItem {
  name: string;
  files: { path: string; content?: string }[];
  dependencies: string[];
}
interface Published {
  packageJson: PackageJson;
  file: (name: string) => Buffer;
}
interface Boundary {
  published: (row: ManifestRow) => Promise<Published>;
  source?: (file: string) => Buffer;
}
const tarballPackage = (row: ManifestRow) => ['@gntik-ai/blocks', '@gntik-ai/templates'].includes(row.package);

export async function checkRelease(manifest: Manifest, items: Map<string, RegistryItem>, boundary: Boundary) {
  const errors: string[] = [];
  let sourceFiles = 0;
  let tarballFiles = 0;
  let dependencyRanges = 0;
  const packages = new Map<string, Promise<Published>>();
  const tagged = new Map<string, Buffer>();
  const source = boundary.source ?? ((file: string) => fs.readFileSync(path.join(ROOT, file)));
  for (const row of manifest.items) {
    const item = items.get(row.id);
    if (!item) {
      errors.push(`${row.id}: ${row.id}.json: missing item`);
      continue;
    }
    const tag = `${row.package}@${row.version}`;
    const pkgPath = `packages/${row.package.split('/')[1]}`;
    const fail = (file: string, message: string) => errors.push(`${row.id}: ${file}: ${message}`);
    let published: Published;
    try {
      if (!packages.has(tag)) packages.set(tag, boundary.published(row));
      published = await packages.get(tag)!;
      // Require the version tag even for support items with no source files.
      const taggedPackage = JSON.parse(gitFile(tag, `${pkgPath}/package.json`).toString()) as PackageJson;
      if (taggedPackage.version !== row.version) fail(`${pkgPath}/package.json`, `tag ${tag} has a different version`);
    } catch (error) {
      fail(`${pkgPath}/package.json`, `cannot load ${tag}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const file of item.files) {
      try {
        if (!file.path.startsWith('packages/') || file.path.split('/').includes('..'))
          throw new Error('unsafe source path');
        const bytes = source(file.path);
        const key = `${tag}:${file.path}`;
        if (!tagged.has(key)) tagged.set(key, gitFile(tag, file.path));
        sourceFiles++;
        if (!bytes.equals(tagged.get(key)!)) fail(file.path, `source differs from ${tag}`);
        if (tarballPackage(row)) {
          if (!file.path.startsWith(`${pkgPath}/`)) throw new Error(`source outside ${pkgPath}`);
          const packed = published.file(file.path.slice(pkgPath.length + 1));
          tarballFiles++;
          if (!bytes.equals(packed)) fail(file.path, `source differs from npm tarball ${tag}`);
        }
      } catch (error) {
        fail(file.path, error instanceof Error ? error.message : String(error));
      }
    }
    const ranges = { ...published.packageJson.peerDependencies, ...published.packageJson.dependencies };
    for (const spec of item.dependencies) {
      const file = `${row.id}.json dependencies (${pkgPath}/package.json)`;
      const match = /^(@[^/]+\/[^@]+|[^@]+)(?:@(.+))?$/.exec(spec);
      if (!match || spec.startsWith('node:')) {
        fail(file, `disallowed dependency ${spec}`);
        continue;
      }
      const [, name, range] = match;
      if (name!.startsWith('@gntik-ai/')) {
        if (range) fail(file, `kit dependency must stay bare: ${spec}`);
        continue;
      }
      if (!range) {
        if (row.id !== 'gntik-tokens' || !['@fontsource/geist', '@fontsource/geist-mono'].includes(name!))
          fail(file, `disallowed bare dependency ${spec}`);
        continue;
      }
      dependencyRanges++;
      if (ranges[name!] !== range) fail(file, `${spec} differs from published range ${ranges[name!] ?? '(missing)'}`);
    }
  }
  return { errors, sourceFiles, tarballFiles, dependencyRanges };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}
function publicNpmUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'registry.npmjs.org')
    throw new Error(`expected public npm URL: ${url}`);
  return url;
}
async function downloadPackage(row: ManifestRow, dir: string): Promise<Published> {
  const metadata = (await fetchJson(
    `https://registry.npmjs.org/${encodeURIComponent(row.package)}/${row.version}`,
  )) as PackageJson & { dist: { tarball: string; integrity: string } };
  if (metadata.name !== row.package || metadata.version !== row.version)
    throw new Error('npm package identity mismatch');
  if (!tarballPackage(row))
    return {
      packageJson: metadata,
      file: () => {
        throw new Error('no tarball requested');
      },
    };
  const response = await fetch(publicNpmUrl(metadata.dist.tarball), { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`tarball: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (integrity !== metadata.dist.integrity) throw new Error('npm tarball integrity mismatch');
  const archive = path.join(dir, `${row.package.split('/')[1]}.tgz`);
  fs.writeFileSync(archive, bytes);
  const file = (name: string) =>
    execFileSync('tar', ['-xOf', archive, `package/${name}`], {
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const packageJson = JSON.parse(file('package.json').toString()) as PackageJson;
  if (packageJson.name !== row.package || packageJson.version !== row.version)
    throw new Error('tarball package identity mismatch');
  return { packageJson, file };
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(import.meta.filename)) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gntik-release-'));
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/mcp/registry-manifest.json'), 'utf8'),
    ) as Manifest;
    const itemDir = path.join(ROOT, 'apps/docs/public/r');
    const files = new Map(
      fs
        .readdirSync(itemDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f, fs.readFileSync(path.join(itemDir, f), 'utf8')]),
    );
    const errors = validateManifest(manifest, files);
    if (errors.length) throw new Error(errors.join('\n'));
    const items = new Map(
      manifest.items.map((row) => [row.id, JSON.parse(files.get(`${row.id}.json`)!) as RegistryItem]),
    );
    const result = await checkRelease(manifest, items, { published: (row) => downloadPackage(row, dir) });
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    console.log(
      `0 differences across ${result.sourceFiles} source files, ${result.tarballFiles} tarball files and ${result.dependencyRanges} dependency ranges; no disallowed bare entry.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
