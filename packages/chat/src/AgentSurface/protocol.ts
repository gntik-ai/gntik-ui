/** Supported command envelope. No v0.8 adaptation is performed. */
export const A2UI_VERSION = 'v0.9' as const;
export interface AgentComponent {
  id: string;
  component: string;
  children?: string[];
  /** Catalog properties are flat, alongside id/component/children. */
  [property: string]: unknown;
}
export interface AgentAction {
  name: string;
  surfaceId: string;
  context: Record<string, unknown>;
}
export interface AgentSurfaceError {
  code: 'version' | 'message' | 'component' | 'props' | 'graph' | 'binding';
  surfaceId: string;
  componentId?: string;
  type?: string;
}
type Envelope<T> = { version: typeof A2UI_VERSION } & T;
export type A2uiMessage =
  | Envelope<{ createSurface: { surfaceId: string; catalogId?: string } }>
  | Envelope<{ updateComponents: { surfaceId: string; components: AgentComponent[] } }>
  | Envelope<{ updateDataModel: { surfaceId: string; path?: string; value: unknown } }>
  | Envelope<{ deleteSurface: { surfaceId: string } }>;

export const MAX_COMPONENTS = 256;
export const MAX_DEPTH = 32;
const commands = ['createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'] as const;
const identifier = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 128;
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** JSON-only, bounded input. In particular, reject cyclic JS objects and prototype keys. */
function validJson(value: unknown): boolean {
  let budget = 10000;
  const ancestors = new Set<object>();
  function visit(item: unknown, depth: number): boolean {
    if (--budget < 0 || depth > 64) return false;
    if (item === null || typeof item === 'boolean') return true;
    if (typeof item === 'number') return Number.isFinite(item);
    if (typeof item === 'string') return item.length <= 65536;
    if (typeof item !== 'object' || ancestors.has(item)) return false;
    if (!Array.isArray(item) && ![Object.prototype, null].includes(Object.getPrototypeOf(item))) return false;
    ancestors.add(item);
    const valid = Object.entries(item).every(
      ([key, child]) => !['__proto__', 'prototype', 'constructor'].includes(key) && visit(child, depth + 1),
    );
    ancestors.delete(item);
    return valid;
  }
  return visit(value, 0);
}

export function parseMessage(input: unknown): { message: A2uiMessage } | { error: AgentSurfaceError } {
  const source = record(input) ? input : {};
  const declared = commands.filter((key) => Object.hasOwn(source, key));
  const command = declared[0];
  const payload = command && record(source[command]) ? source[command] : {};
  const surfaceId = identifier(payload.surfaceId) ? payload.surfaceId : '';
  const error = (code: AgentSurfaceError['code']) => ({ error: { code, surfaceId } });
  if (source.version !== A2UI_VERSION) return error('version');
  if (declared.length !== 1 || !surfaceId || !validJson(input)) return error('message');
  if (command === 'createSurface') {
    if (payload.catalogId !== undefined && !identifier(payload.catalogId)) return error('message');
    return {
      message: {
        version: A2UI_VERSION,
        createSurface: {
          surfaceId,
          ...(typeof payload.catalogId === 'string' ? { catalogId: payload.catalogId } : {}),
        },
      },
    };
  }
  if (command === 'deleteSurface') return { message: { version: A2UI_VERSION, deleteSurface: { surfaceId } } };
  if (command === 'updateDataModel') {
    if (!Object.hasOwn(payload, 'value') || (payload.path !== undefined && typeof payload.path !== 'string'))
      return error('message');
    return {
      message: {
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId,
          path: typeof payload.path === 'string' ? payload.path : '',
          value: payload.value,
        },
      },
    };
  }
  if (!Array.isArray(payload.components) || payload.components.length > MAX_COMPONENTS) return error('message');
  const nodes: AgentComponent[] = [];
  const ids = new Set<string>();
  for (const node of payload.components) {
    if (!record(node) || !identifier(node.id) || !identifier(node.component) || ids.has(node.id))
      return error('message');
    if (
      node.children !== undefined &&
      (!Array.isArray(node.children) || node.children.length > MAX_COMPONENTS || !node.children.every(identifier))
    )
      return error('message');
    ids.add(node.id);
    nodes.push(node as AgentComponent);
  }
  return { message: { version: A2UI_VERSION, updateComponents: { surfaceId, components: nodes } } };
}

/** Missing children are allowed while streaming; repeated parents, cycles and deep trees are not. */
export function validGraph(nodes: ReadonlyMap<string, AgentComponent>): boolean {
  if (nodes.size > MAX_COMPONENTS) return false;
  const parents = new Set<string>();
  for (const node of nodes.values()) {
    for (const child of node.children ?? []) {
      if (parents.has(child)) return false;
      parents.add(child);
    }
  }
  const visiting = new Set<string>();
  function visit(id: string, depth: number): boolean {
    if (depth > MAX_DEPTH || visiting.has(id)) return false;
    visiting.add(id);
    const valid = (nodes.get(id)?.children ?? []).every((child) => visit(child, depth + 1));
    visiting.delete(id);
    return valid;
  }
  return [...nodes.keys()].every((id) => visit(id, 0));
}
