import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads the options for a query. Receives an `AbortSignal` that fires when the request goes stale
 * (the query changed, the popup closed or the component unmounted): pass it to `fetch`.
 */
export type LoadOptions<Item> = (query: string, context: { signal: AbortSignal }) => Promise<readonly Item[]>;

export interface UseAsyncOptionsConfig<Item> {
  /** Wait this long (ms) after the last keystroke before loading. Default 250; an empty query loads at once. */
  debounceMs?: number;
  /** Load only while true (e.g. while the popup is open). Results are kept when it turns false. */
  enabled?: boolean;
  /** Called with every successful result (e.g. to remember the labels of loaded options). */
  onResult?: (items: readonly Item[], query: string) => void;
}

export interface AsyncOptionsState<Item> {
  /** The latest loaded options (kept while a newer query loads). */
  items: readonly Item[];
  /** True from the moment the query changes until its result (or error) arrives. */
  loading: boolean;
  /** The last request's error, or `null`. */
  error: unknown;
  /** Runs the current query again (e.g. after an error). */
  reload: () => void;
}

interface Loaded<Item> {
  query: string | null;
  items: readonly Item[];
  error: unknown;
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

/**
 * Debounced, abortable option loading shared by Combobox, MultiSelect and SimpleSelect.
 * Without `loadOptions` it is inert (`loading` false, no items).
 */
export function useAsyncOptions<Item>(
  loadOptions: LoadOptions<Item> | undefined,
  query: string,
  { debounceMs = 250, enabled = true, onResult }: UseAsyncOptionsConfig<Item> = {},
): AsyncOptionsState<Item> {
  const [loaded, setLoaded] = useState<Loaded<Item>>({ query: null, items: [], error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const loadRef = useRef(loadOptions);
  const onResultRef = useRef(onResult);
  useEffect(() => {
    loadRef.current = loadOptions;
    onResultRef.current = onResult;
  });

  const active = !!loadOptions && enabled;
  const stale = loaded.query !== query;

  useEffect(() => {
    const load = loadRef.current;
    if (!active || !load || !stale) return;
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => {
        let request: Promise<readonly Item[]>;
        try {
          request = load(query, { signal: controller.signal });
        } catch (error) {
          request = Promise.reject(error);
        }
        request.then(
          (items) => {
            if (controller.signal.aborted) return;
            setLoaded({ query, items, error: null });
            onResultRef.current?.(items, query);
          },
          (error: unknown) => {
            if (controller.signal.aborted || isAbort(error)) return;
            setLoaded((prev) => ({ query, items: prev.items, error: error ?? new Error('Failed to load options') }));
          },
        );
      },
      query === '' ? 0 : debounceMs,
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, stale, query, debounceMs, reloadKey]);

  const reload = useCallback(() => {
    setLoaded((prev) => ({ ...prev, query: null, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return {
    items: loaded.items,
    loading: active && stale,
    error: !stale ? loaded.error : null,
    reload,
  };
}
