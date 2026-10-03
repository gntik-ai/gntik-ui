import { useState } from 'react';

function read(storageKey: string | undefined): boolean | undefined {
  if (!storageKey || typeof window === 'undefined') return undefined;
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === null ? undefined : value === 'true';
  } catch {
    return undefined;
  }
}

function write(storageKey: string | undefined, value: boolean) {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, String(value));
  } catch {}
}

/** Controlled / uncontrolled boolean whose uncontrolled value survives reloads under `storageKey`. */
export function usePersistedCollapse(
  controlled: boolean | undefined,
  defaultValue: boolean,
  storageKey: string | undefined,
  onChange: ((value: boolean) => void) | undefined,
) {
  const [state, setState] = useState(() => read(storageKey) ?? defaultValue);
  const value = controlled ?? state;
  const set = (next: boolean) => {
    setState(next);
    write(storageKey, next);
    onChange?.(next);
  };
  return [value, set] as const;
}
