import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { CliError } from './errors.js';

/** Default registry base: the main branch of the kit repository. */
export const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/gntik-ai/gntik-ui/main/';
export const REGISTRY_FILE = 'kit-registry.json';

export type ItemKind = 'component' | 'layout' | 'block' | 'template';
export const ITEM_KINDS: readonly ItemKind[] = ['component', 'layout', 'block', 'template'];

export interface RegistryFile {
  /** Repo-relative source path, e.g. packages/ui/src/components/Button/Button.tsx */
  path: string;
  /** Install target, e.g. components/ui/button/Button.tsx (mapped through the config aliases). */
  target: string;
}

export interface RegistryItem {
  id: string;
  kind: ItemKind;
  name: string;
  package: string;
  group: string;
  status: string;
  description: string;
  files: RegistryFile[];
  /** npm packages the item's files import. */
  dependencies: string[];
  /** Other registry item ids this item needs. */
  registryDependencies: string[];
  /** Repo-relative path of the *.doc.ts file, when there is one. */
  docs?: string;
}

export interface KitRegistry {
  version: 1;
  items: RegistryItem[];
}

export interface RegistrySource {
  type: 'local' | 'url';
  /** Directory (local) or base URL with a trailing slash (url). */
  base: string;
}

/** Copy-in kinds: their source is copied into the project. Components and layouts install from npm. */
export const isCopyIn = (kind: ItemKind) => kind === 'block' || kind === 'template';

export class Registry {
  readonly byId = new Map<string, RegistryItem>();

  constructor(
    readonly data: KitRegistry,
    readonly source: RegistrySource,
  ) {
    for (const item of data.items) this.byId.set(item.id, item);
  }

  get items() {
    return this.data.items;
  }

  get(id: string) {
    return this.byId.get(id);
  }

  /** Reads a repo-relative file from the registry source. */
  async read(file: string): Promise<string> {
    if (this.source.type === 'local') {
      try {
        return await readFile(path.join(this.source.base, file), 'utf8');
      } catch {
        throw new CliError('REGISTRY', `Cannot read ${file} from ${this.source.base}`);
      }
    }
    return fetchText(new URL(file, this.source.base).href);
  }

  /**
   * Requested ids plus their registryDependencies, recursively; dependencies come before
   * the items that need them. Unknown ids throw NOT_FOUND.
   */
  closure(ids: string[]): RegistryItem[] {
    const out: RegistryItem[] = [];
    const seen = new Set<string>();
    const visit = (id: string, from?: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      const item = this.get(id);
      if (!item) {
        throw new CliError('NOT_FOUND', from ? `Unknown registry dependency "${id}" (needed by ${from})` : `Unknown item "${id}"`);
      }
      for (const dep of item.registryDependencies) visit(dep, id);
      out.push(item);
    };
    for (const id of ids) visit(id);
    return out;
  }
}

async function fetchText(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new CliError('REGISTRY', `Cannot fetch ${url}: ${(e as Error).message}`);
  }
  if (!res.ok) throw new CliError('REGISTRY', `Cannot fetch ${url}: HTTP ${res.status}`);
  return res.text();
}

const isUrl = (s: string) => /^https?:\/\//i.test(s);

/** Resolves `--registry` (a checkout dir, a kit-registry.json path or a base URL) to a source. */
export async function resolveSource(spec: string, cwd: string): Promise<{ source: RegistrySource; file: string }> {
  if (isUrl(spec)) {
    if (spec.endsWith('.json')) {
      const u = new URL(spec);
      return { source: { type: 'url', base: new URL('./', u).href }, file: u.href };
    }
    const base = spec.endsWith('/') ? spec : `${spec}/`;
    return { source: { type: 'url', base }, file: new URL(REGISTRY_FILE, base).href };
  }
  const abs = path.resolve(cwd, spec);
  const st = await stat(abs).catch(() => null);
  if (!st) throw new CliError('REGISTRY', `Registry path not found: ${abs}`);
  if (st.isFile()) return { source: { type: 'local', base: path.dirname(abs) }, file: abs };
  return { source: { type: 'local', base: abs }, file: path.join(abs, REGISTRY_FILE) };
}

export function validateRegistry(data: unknown, where: string): KitRegistry {
  const fail = (msg: string): never => {
    throw new CliError('REGISTRY', `Invalid registry ${where}: ${msg}`);
  };
  if (!data || typeof data !== 'object') fail('not an object');
  const d = data as Partial<KitRegistry>;
  if (d.version !== 1) fail(`unsupported version ${String(d.version)}`);
  if (!Array.isArray(d.items)) fail('"items" must be an array');
  for (const [i, item] of (d.items as RegistryItem[]).entries()) {
    if (!item || typeof item.id !== 'string') fail(`items[${i}].id missing`);
    if (!ITEM_KINDS.includes(item.kind)) fail(`items[${i}] (${item.id}) has unknown kind "${String(item.kind)}"`);
    if (!Array.isArray(item.files)) fail(`items[${i}] (${item.id}) has no files array`);
    item.dependencies ??= [];
    item.registryDependencies ??= [];
    item.group ??= '';
    item.status ??= 'stable';
    item.description ??= '';
  }
  return d as KitRegistry;
}

export async function loadRegistry(spec: string, cwd: string): Promise<Registry> {
  const { source, file } = await resolveSource(spec, cwd);
  let text: string;
  if (source.type === 'local') {
    text = await readFile(file, 'utf8').catch(() => {
      throw new CliError('REGISTRY', `No ${REGISTRY_FILE} at ${file}`);
    });
  } else {
    text = await fetchText(file);
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new CliError('REGISTRY', `${file} is not valid JSON`);
  }
  return new Registry(validateRegistry(json, file), source);
}

/** Short, stable item summary used by list/search JSON. */
export function summary(item: RegistryItem) {
  return {
    id: item.id,
    kind: item.kind,
    name: item.name,
    package: item.package,
    group: item.group,
    status: item.status,
    description: item.description,
  };
}
