import { createContext, useContext, useEffect, useState, useSyncExternalStore, type RefCallback } from 'react';

/** Field path to message(s). Arrays show their first entry; null, undefined and '' apply nothing. */
export type FormServerErrors = Record<string, string | readonly string[] | null | undefined>;

interface ServerErrorEntry {
  message: string;
  /** The field's value when the error was applied; any difference clears the error for good. */
  snapshot: unknown;
  generation: number;
}

/** A mounted FormField (or useFieldProps) as the store sees it. */
interface RegisteredField {
  name: string;
  /** The Field root, used to order fields in the document. */
  root: HTMLElement | null;
  /** Focuses the registered control ref. */
  focus: (() => void) | null;
  /** The field's current value from useController. */
  value: unknown;
}

/** What one field hands the store: its root and control ref, and its latest name and value. */
export interface ServerFieldHandle {
  /** Spread on the Field root; gives the store the document order of fields. */
  rootRef: RefCallback<HTMLElement>;
  /** Pass the control ref's argument through this to capture what the field focuses. */
  captureFocus: (instance: { focus: () => void } | null) => void;
  update: (name: string, value: unknown) => void;
  /** Registers the field with the store; returns the unregister function. */
  mount: () => () => void;
}

/**
 * Server errors live here, apart from react-hook-form's error state. They change only when a field's
 * value differs from its snapshot, a new errors object is applied, or the form submits or resets.
 * Validation results never reach this store.
 */
export interface ServerErrorStore {
  subscribe: (listener: () => void) => () => void;
  /** Counts applied errors objects that reached a field, so Form can focus after they commit. */
  getFocusTicket: () => number;
  createField: (name: string, value: unknown) => ServerFieldHandle;
  /** Replaces all server errors with the entries of `errors`. */
  apply: (errors: FormServerErrors) => void;
  /** Submit and every reset path: bump the generation and drop all server errors. */
  reset: () => void;
  /** The active message for a field, or undefined once its value left the snapshot. */
  messageFor: (name: string, value: unknown) => string | undefined;
  /** Drops a field's error when its value differs from the snapshot. */
  clearIfEdited: (name: string, value: unknown) => void;
  rootMessage: () => string | undefined;
  /** Focuses the first errored field in document order, unless focus is outside `container`. */
  focusFirst: (container: HTMLElement | null) => void;
}

export function createServerErrorStore(): ServerErrorStore {
  let generation = 0;
  let focusTicket = 0;
  let root: string | undefined;
  const entries = new Map<string, ServerErrorEntry>();
  const fields = new Set<RegisteredField>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const active = (name: string, value: unknown) => {
    const entry = entries.get(name);
    return entry && entry.generation === generation && isEqualValue(value, entry.snapshot) ? entry : undefined;
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    getFocusTicket: () => focusTicket,
    createField(name, value) {
      const field: RegisteredField = { name, root: null, focus: null, value };
      return {
        rootRef: (element) => {
          field.root = element;
        },
        captureFocus: (instance) => {
          field.focus = instance ? () => instance.focus() : null;
        },
        update: (nextName, nextValue) => {
          field.name = nextName;
          field.value = nextValue;
        },
        mount: () => {
          fields.add(field);
          return () => void fields.delete(field);
        },
      };
    },
    apply(errors) {
      generation += 1;
      entries.clear();
      root = undefined;
      for (const [path, input] of Object.entries(errors)) {
        const message = firstMessage(input);
        if (message === undefined) continue;
        const field = path === '' ? undefined : [...fields].find((candidate) => candidate.name === path);
        if (!field) root ??= message;
        else entries.set(path, { message, snapshot: field.value, generation });
      }
      if (entries.size > 0) focusTicket += 1;
      emit();
    },
    reset() {
      generation += 1;
      if (entries.size === 0 && root === undefined) return;
      entries.clear();
      root = undefined;
      emit();
    },
    messageFor: (name, value) => active(name, value)?.message,
    clearIfEdited(name, value) {
      if (!entries.has(name) || active(name, value)) return;
      entries.delete(name);
      emit();
    },
    rootMessage: () => root,
    focusFirst(container) {
      const focused = document.activeElement;
      if (focused && focused !== document.body && !container?.contains(focused)) return;
      const errored = [...fields]
        .filter((field) => field.focus && active(field.name, field.value))
        .sort((a, b) => {
          if (!a.root || !b.root) return 0;
          return a.root.compareDocumentPosition(b.root) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
      errored[0]?.focus?.();
    },
  };
}

/** A string is kept unless empty. An array contributes its first entry as given, even when empty. */
function firstMessage(input: FormServerErrors[string]): string | undefined {
  if (typeof input === 'string') return input === '' ? undefined : input;
  if (Array.isArray(input)) {
    const first: unknown = input[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
}

/** Structural equality for form values: primitives, dates, arrays and plain objects. */
export function isEqualValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => isEqualValue(item, b[i]))
    );
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => key in right && isEqualValue(left[key], right[key]))
  );
}

export const ServerErrorsContext = createContext<ServerErrorStore | null>(null);

const noopSubscribe = () => () => undefined;

/** The active server message for one field (undefined when none); an edit clears it for good. */
export function useServerFieldError(name: string, value: unknown): string | undefined {
  const store = useContext(ServerErrorsContext);
  const message = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    () => store?.messageFor(name, value),
    () => undefined,
  );
  useEffect(() => {
    store?.clearIfEdited(name, value);
  }, [store, name, value]);
  return message;
}

const detachedField: ServerFieldHandle = {
  rootRef: () => undefined,
  captureFocus: () => undefined,
  update: () => undefined,
  mount: () => () => undefined,
};

/** Registers one field's name, root, control ref and latest value with the enclosing Form's store. */
export function useServerFieldRegistration(name: string, value: unknown): ServerFieldHandle {
  const store = useContext(ServerErrorsContext);
  const [handle] = useState(() => store?.createField(name, value) ?? detachedField);
  useEffect(() => handle.update(name, value));
  useEffect(() => handle.mount(), [handle]);
  return handle;
}

/** The root server message, for FormRootError. */
export function useServerRootMessage(): string | undefined {
  const store = useContext(ServerErrorsContext);
  return useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    () => store?.rootMessage(),
    () => undefined,
  );
}
