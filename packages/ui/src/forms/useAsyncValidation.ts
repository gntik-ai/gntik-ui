import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useFormContext, type FieldPath, type FieldPathValue, type FieldValues } from 'react-hook-form';
import { useI18n } from '../i18n/I18nProvider';
import { isEqualValue } from './serverErrors';

export type AsyncValidate<TValues extends FieldValues, TName extends FieldPath<TValues>> = (
  value: FieldPathValue<TValues, TName>,
  context: { signal: AbortSignal; values: TValues },
) => Promise<string | null | undefined>;

export interface AsyncField {
  name: string;
  root: { current: HTMLElement | null };
  run: () => Promise<boolean>;
}
export const AsyncValidationContext = createContext<Map<string, AsyncField> | null>(null);

/** Await every mounted validator; Form owns error focus in document order. */
export async function validateAsyncFields(fields: Map<string, AsyncField>): Promise<boolean> {
  const mounted = [...fields.values()];
  const results = await Promise.all(mounted.map((field) => field.run()));
  return results.every(Boolean);
}

/** Snapshot mutable nested form data while retaining opaque values such as File by identity. */
export function snapshotFormValues<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) return value.map(snapshotFormValues) as T;
  if (
    value &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  ) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshotFormValues(item)])) as T;
  }
  return value;
}

interface Run<TValues> {
  controller: AbortController;
  values: TValues;
  promise: Promise<boolean>;
}

/** Debounced edit checks and submit checks share one abortable run per field. */
export function useAsyncValidation<TValues extends FieldValues, TName extends FieldPath<TValues>>(
  name: TName,
  value: FieldPathValue<TValues, TName>,
  validate: AsyncValidate<TValues, TName> | undefined,
  debounceMs: number,
  disabled: boolean | undefined,
) {
  const form = useFormContext<TValues>();
  const registry = useContext(AsyncValidationContext);
  const { t } = useI18n();
  const { getValues, getFieldState, setError, clearErrors } = form ?? {};
  const config = useRef({ validate, disabled });
  const active = useRef<Run<TValues> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLElement | null>(null);
  const [result, setResult] = useState<{ value: unknown; status: 'idle' | 'validating' | 'success' }>({
    value,
    status: 'idle',
  });
  const enabled = !!validate && !disabled;
  useEffect(() => {
    config.current = { validate, disabled };
  });
  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    active.current?.controller.abort();
    active.current = null;
  }, []);
  const run = useCallback((): Promise<boolean> => {
    const validator = config.current.validate;
    if (!validator || config.current.disabled || !getValues || !getFieldState || !setError || !clearErrors) {
      return Promise.resolve(true);
    }
    clearTimeout(timer.current);
    const values = snapshotFormValues(getValues());
    const running = active.current;
    if (running && !running.controller.signal.aborted && isEqualValue(running.values, values)) return running.promise;
    cancel();
    const controller = new AbortController();
    const currentValue = getValues(name);
    setResult({ value: currentValue, status: 'validating' });
    const aborted = new Promise<false>((resolve) => {
      controller.signal.addEventListener('abort', () => resolve(false), { once: true });
    });
    const check = Promise.resolve()
      .then(() =>
        controller.signal.aborted ? undefined : validator(currentValue, { signal: controller.signal, values }),
      )
      .catch(() => t('field.validationFailed'))
      .then((message) => {
        if (controller.signal.aborted || !isEqualValue(getValues(name), currentValue)) return false;
        const error = getFieldState(name).error;
        // Schema and manually applied errors belong to their owner. Never erase or replace them.
        if (!error || error.type === 'async') {
          if (message) setError(name, { type: 'async', message });
          else if (error?.type === 'async') clearErrors(name);
        }
        setResult({ value: currentValue, status: message ? 'idle' : 'success' });
        return !message && (!error || error.type === 'async');
      });
    const promise = Promise.race([check, aborted]).finally(() => {
      if (active.current?.controller === controller) active.current = null;
    });
    active.current = { controller, values, promise };
    return promise;
  }, [cancel, getValues, getFieldState, setError, clearErrors, name, t]);

  useEffect(() => {
    if (!enabled) return;
    timer.current = setTimeout(() => {
      void run();
    }, debounceMs);
    return cancel;
  }, [value, enabled, debounceMs, run, cancel]);
  useEffect(() => {
    if (!enabled || !registry) return;
    const entry = { name, root, run };
    registry.set(name, entry);
    return () => {
      if (registry.get(name) === entry) registry.delete(name);
    };
  }, [enabled, registry, name, run]);
  const rootRef = useCallback((element: HTMLElement | null) => {
    root.current = element;
  }, []);
  return {
    rootRef,
    status: enabled && isEqualValue(result.value, value) ? result.status : 'idle',
  };
}
