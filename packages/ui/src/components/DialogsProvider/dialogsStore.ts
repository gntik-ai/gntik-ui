import type { ComponentType, ReactNode } from 'react';
import { captureFocus, resolveFinalFocus, type CapturedFocus } from './dialogsFocus';
import type { AlertOptions, ConfirmOptions, DialogComponentProps, PromptOptions } from './types';

export type EntrySpec =
  | { kind: 'confirm'; message: ReactNode; options: ConfirmOptions }
  | { kind: 'alert'; message: ReactNode; options: AlertOptions }
  | { kind: 'prompt'; message: ReactNode; options: PromptOptions }
  | { kind: 'custom'; Component: ComponentType<DialogComponentProps<unknown, unknown>>; payload: unknown };

/** One open dialog: what to render plus the focus facts recorded when it was requested. */
export interface DialogEntry extends CapturedFocus {
  id: string;
  spec: EntrySpec;
  returnFocus: HTMLElement | null | undefined;
  /** Settle value for Cancel, Escape and `closeAll()`: `false`, `null` or `undefined`. */
  cancelValue: unknown;
}

interface Pending {
  resolve: (value: unknown) => void;
  /** What the promise resolves with when the dialog is dismissed or force-closed. */
  cancelValue: unknown;
}

/**
 * The single source of truth for open dialogs. The entry list and the pending promise records
 * change together: every settle removes the entry in the same commit, even when the pending
 * record is already gone, so a replayed effect (StrictMode) can never leave an orphan dialog.
 */
export function createDialogsStore() {
  let entries: readonly DialogEntry[] = [];
  let sequence = 0;
  let root: CapturedFocus | null = null;
  const pending = new Map<string, Pending>();
  const handles = new WeakMap<Promise<unknown>, string>();
  const skipRestore = new Set<string>();
  const listeners = new Set<() => void>();

  const commit = (next: readonly DialogEntry[]) => {
    entries = next;
    listeners.forEach((listener) => listener());
  };

  function add<R>(spec: EntrySpec, cancelValue: unknown, returnFocus: HTMLElement | null | undefined): Promise<R> {
    const id = `dialog-${++sequence}`;
    const focus = captureFocus();
    const promise = new Promise<R>((resolve) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, cancelValue });
    });
    handles.set(promise, id);
    if (entries.length === 0) root = focus;
    commit([...entries, { id, spec, returnFocus, cancelValue, ...focus }]);
    return promise;
  }

  /** Resolves the call once (later calls are no-ops) and removes its entry. */
  function settle(id: string, value: unknown) {
    const record = pending.get(id);
    pending.delete(id);
    record?.resolve(value);
    if (entries.some((entry) => entry.id === id)) commit(entries.filter((entry) => entry.id !== id));
  }

  function closeAll() {
    // Only the lowest dialog restores focus, so the order of unmount cleanups cannot matter.
    entries.slice(1).forEach((entry) => skipRestore.add(entry.id));
    for (const record of pending.values()) record.resolve(record.cancelValue);
    pending.clear();
    if (entries.length > 0) commit([]);
  }

  function update(handle: Promise<unknown>, payload: unknown) {
    const id = handles.get(handle);
    if (!id) return;
    commit(
      entries.map((entry) =>
        entry.id === id && entry.spec.kind === 'custom' ? { ...entry, spec: { ...entry.spec, payload } } : entry,
      ),
    );
  }

  function close(handle: Promise<unknown>, result: unknown) {
    const id = handles.get(handle);
    if (id) settle(id, result);
  }

  return {
    add,
    settle,
    closeAll,
    update,
    close,
    getEntries: () => entries,
    top: () => entries.at(-1)?.id,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Target for the popup's `finalFocus`, read when the entry's popup unmounts. */
    focusTarget(entry: DialogEntry) {
      if (skipRestore.delete(entry.id)) return false;
      return resolveFinalFocus(entry, entries.length, root);
    },
  };
}

export type DialogsStore = ReturnType<typeof createDialogsStore>;
