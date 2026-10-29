import { useCallback, useMemo, useRef, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';

interface StorageStore {
  raw: string | null | undefined;
  documentRaw: string | null | undefined;
  listeners: Map<() => void, boolean>;
}

type StorageKind = 'localStorage' | 'sessionStorage';
const stores: Record<StorageKind, Map<string, StorageStore>> = {
  localStorage: new Map(),
  sessionStorage: new Map(),
};

function createStore(): StorageStore {
  return { raw: undefined, documentRaw: undefined, listeners: new Map() };
}

let syncedListeners = 0;

function onStorage(event: StorageEvent) {
  if (typeof window === 'undefined') return;
  try {
    if (event.storageArea !== null && event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  stores.localStorage.forEach((store, key) => {
    if (event.key !== null && event.key !== key) return;
    store.raw = event.key === null ? null : event.newValue;
    store.listeners.forEach((sync, listener) => {
      if (sync) listener();
    });
  });
}

function getStore(kind: StorageKind, key: string): StorageStore {
  let store = stores[kind].get(key);
  if (!store) {
    store = createStore();
    stores[kind].set(key, store);
  }
  return store;
}

/** Storage codecs and optional validation for persisted state. */
export interface UseStorageOptions<T> {
  /** Defaults to JSON.stringify. Use a matching deserialize function for custom formats. */
  serialize?: (value: T) => string;
  /** Defaults to JSON.parse. Invalid data falls back without modifying storage. */
  deserialize?: (raw: string) => T;
  /** Reject incompatible stored data without overwriting it. */
  validate?: (value: unknown) => value is T;
  /** Apply localStorage events from other documents (default true). Same-document updates always sync. */
  sync?: boolean;
  /** Receives storage access and decoding errors. Failed storage writes stay in memory. */
  onError?: (error: unknown) => void;
}

function readRaw(kind: StorageKind, key: string | undefined, onError?: (error: unknown) => void): string | null {
  if (key === undefined || typeof window === 'undefined') return null;
  try {
    return window[kind].getItem(key);
  } catch (error) {
    onError?.(error);
    return null;
  }
}

function decode<T>(raw: string | null, defaultValue: T, options: UseStorageOptions<T>): T {
  if (raw === null) return defaultValue;
  try {
    const parsed: T = (options.deserialize ?? JSON.parse)(raw);
    return !options.validate || options.validate(parsed) ? parsed : defaultValue;
  } catch (error) {
    options.onError?.(error);
    return defaultValue;
  }
}

/** Read localStorage once outside React, returning the default on the server or invalid data. Never writes. */
export function readLocalStorageValue<T>(key: string, defaultValue: T, options: UseStorageOptions<T> = {}): T {
  return decode(readRaw('localStorage', key, options.onError), defaultValue, options);
}

/**
 * State backed by localStorage. Returns the default on the server and during
 * hydration, then reads storage. An undefined key keeps state in memory only.
 * @returns [value, setValue, remove]. The setter accepts a value or updater;
 * remove deletes the key and restores the default. Use consistent codecs and
 * types for each prefixed key (for example app:area:name).
 */
export function useLocalStorage<T>(key: string | undefined, defaultValue: T, options: UseStorageOptions<T> = {}) {
  return useStorage('localStorage', key, defaultValue, options);
}

/** Session storage state, synchronized only with hooks in this document. SSR uses the default. */
export function useSessionStorage<T>(key: string | undefined, defaultValue: T, options: UseStorageOptions<T> = {}) {
  return useStorage('sessionStorage', key, defaultValue, options);
}

function useStorage<T>(kind: StorageKind, key: string | undefined, defaultValue: T, options: UseStorageOptions<T>) {
  const { serialize = JSON.stringify, deserialize = JSON.parse, validate, sync = true, onError } = options;
  const memory = useMemo(() => createStore(), []);
  const storeForKey = useCallback(() => (key === undefined ? memory : getStore(kind, key)), [kind, key, memory]);
  const snapshots = useRef(new WeakMap<StorageStore, { raw: string | null | undefined; value: T }>());
  const getSnapshot = useCallback(() => {
    const store = storeForKey();
    if (store.raw === undefined) {
      store.raw = readRaw(kind, key, onError);
      store.documentRaw = store.raw;
    }
    const raw = sync ? store.raw : store.documentRaw;
    const cached = snapshots.current.get(store);
    if (!cached || cached.raw !== raw) {
      const parsedValue = decode(raw ?? null, defaultValue, { deserialize, validate, onError });
      snapshots.current.set(store, { raw, value: parsedValue });
      return parsedValue;
    }
    return cached.value;
  }, [kind, key, storeForKey, defaultValue, deserialize, validate, sync, onError]);
  const subscribe = useCallback(
    (listener: () => void) => {
      const store = storeForKey();
      store.listeners.set(listener, sync);
      if (
        kind === 'localStorage' &&
        sync &&
        key !== undefined &&
        typeof window !== 'undefined' &&
        syncedListeners++ === 0
      ) {
        window.addEventListener('storage', onStorage);
      }
      return () => {
        store.listeners.delete(listener);
        if (
          kind === 'localStorage' &&
          sync &&
          key !== undefined &&
          typeof window !== 'undefined' &&
          --syncedListeners === 0
        ) {
          window.removeEventListener('storage', onStorage);
        }
        if (store.listeners.size === 0 && key !== undefined) stores[kind].delete(key);
      };
    },
    [kind, key, storeForKey, sync],
  );
  const value = useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      const store = storeForKey();
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(getSnapshot()) : next;
      const raw = serialize(resolved);
      if (key !== undefined && typeof window !== 'undefined') {
        try {
          window[kind].setItem(key, raw);
        } catch (error) {
          onError?.(error);
        }
      }
      store.raw = raw;
      store.documentRaw = raw;
      store.listeners.forEach((_, listener) => listener());
    },
    [kind, key, storeForKey, serialize, getSnapshot, onError],
  );
  const remove = useCallback(() => {
    const store = storeForKey();
    if (key !== undefined && typeof window !== 'undefined') {
      try {
        window[kind].removeItem(key);
      } catch (error) {
        onError?.(error);
      }
    }
    store.raw = null;
    store.documentRaw = null;
    store.listeners.forEach((_, listener) => listener());
  }, [kind, key, storeForKey, onError]);
  return [value, setValue, remove] as const;
}
