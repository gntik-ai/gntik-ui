import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { UrlHistoryMode, UrlParam } from './url-param';
import { browserAdapter, getUrlStore, type UrlStateAdapter } from './url-state-store';
export { urlParam } from './url-param';
export type { UrlParam, UrlParamOptions, UrlHistoryMode } from './url-param';
export type { UrlStateAdapter } from './url-state-store';

/** Schema codecs must stay consistent for each shared, prefixed key. */
export type UrlStateSchema = Record<string, UrlParam<unknown>>;
export type UrlStateValues<S extends UrlStateSchema> = { [K in keyof S]: S[K]['default'] };
export interface UseUrlStateOptions {
  adapter?: UrlStateAdapter;
  prefix?: string;
  /** Coalesce writes in this interval; default 50 ms. Values update immediately. */
  throttleMs?: number;
}
export interface SetUrlStateOptions {
  history?: UrlHistoryMode;
}
export type SetUrlState<S extends UrlStateSchema> = (
  patch: Partial<UrlStateValues<S>> | ((previous: UrlStateValues<S>) => Partial<UrlStateValues<S>>),
  options?: SetUrlStateOptions,
) => void;
const AdapterContext = createContext<UrlStateAdapter>(browserAdapter);
/** Supply a memoized router or memory adapter to descendant hooks. An explicit hook adapter wins. */
export function UrlStateProvider({ adapter, children }: { adapter: UrlStateAdapter; children: ReactNode }) {
  return createElement(AdapterContext.Provider, { value: adapter }, children);
}
function readValues<S extends UrlStateSchema>(schema: S, search: string, prefix: string): UrlStateValues<S> {
  const params = new URLSearchParams(search);
  return Object.fromEntries(
    Object.entries(schema).map(([key, param]) => {
      let value = param.default;
      if (params.has(prefix + key)) {
        try {
          value = param.parse(params.getAll(prefix + key));
        } catch {
          /* Preserve invalid links. */
        }
      }
      return [key, value];
    }),
  ) as UrlStateValues<S>;
}
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * Typed URL query state, shared per adapter. Returns [values, setValues]; the setter merges a
 * patch or updater. Defaults are omitted, foreign keys and hashes survive. Use a memoized router
 * adapter with a router. SSR and initial hydration use defaults with the browser adapter.
 */
export function useUrlState<S extends UrlStateSchema>(schema: S, options: UseUrlStateOptions = {}) {
  const inherited = useContext(AdapterContext);
  const adapter = options.adapter ?? inherited;
  const store = getUrlStore(adapter);
  const prefix = options.prefix ?? '';
  const snapshot = useRef<
    { store: typeof store; prefix: string; search: string; values: UrlStateValues<S> } | undefined
  >(undefined);
  const decode = useCallback(
    (search: string) => {
      const cached = snapshot.current;
      if (cached && cached.store === store && cached.prefix === prefix && cached.search === search)
        return cached.values;
      const values = readValues(schema, search, prefix);
      snapshot.current = { store, prefix, search, values };
      return values;
    },
    [store, prefix, schema],
  );
  const getSnapshot = useCallback(() => decode(store.getSearch()), [decode, store]);
  const getServerSnapshot = useCallback(
    () => decode(adapter === browserAdapter ? '' : adapter.getSearch()),
    [decode, adapter],
  );
  const values = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
  const setValues: SetUrlState<S> = useCallback(
    (patch, setOptions = {}) => {
      const current = store.getSearch();
      const resolved = typeof patch === 'function' ? patch(readValues(schema, current, prefix)) : patch;
      const params = new URLSearchParams(current);
      let mode: UrlHistoryMode = 'replace';
      let changed = false;
      for (const [key, value] of Object.entries(resolved)) {
        const param = schema[key];
        if (!param) continue;
        const serialized = param.serialize(value);
        const next = same(serialized, param.serialize(param.default)) ? [] : serialized;
        const name = prefix + key;
        if (same(next, params.getAll(name))) continue;
        changed = true;
        params.delete(name);
        next.forEach((raw) => params.append(name, raw));
        if ((setOptions.history ?? param.history) === 'push') mode = 'push';
      }
      if (!changed) return;
      const raw = params.toString();
      const next = raw ? `?${raw}` : '';
      if (next !== current) store.setSearch(next, mode, options.throttleMs ?? 50);
    },
    [store, schema, prefix, options.throttleMs],
  );
  return [values, setValues] as const;
}
