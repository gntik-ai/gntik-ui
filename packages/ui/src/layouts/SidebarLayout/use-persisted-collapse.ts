import { useLocalStorage } from '../../hooks/useLocalStorage';

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/** Controlled / uncontrolled boolean whose uncontrolled value survives reloads under `storageKey`. */
export function usePersistedCollapse(
  controlled: boolean | undefined,
  defaultValue: boolean,
  storageKey: string | undefined,
  onChange: ((value: boolean) => void) | undefined,
) {
  const [state, setState] = useLocalStorage(storageKey || undefined, defaultValue, { validate: isBoolean });
  const value = controlled ?? state;
  const set = (next: boolean) => {
    setState(next);
    onChange?.(next);
  };
  return [value, set] as const;
}
