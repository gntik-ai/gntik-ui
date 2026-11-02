import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createDialogsStore, type DialogEntry } from './dialogsStore';
import { AlertView, ConfirmView, CustomView, PromptView, type DialogsHost } from './dialogViews';
import { DialogsContext } from './useDialogs';
import { useDismissGuard } from './useDismissGuard';
import type { Dialogs } from './types';

export interface DialogsProviderProps {
  children?: ReactNode;
}

function EntryView({ entry, host }: { entry: DialogEntry; host: DialogsHost }) {
  const { spec } = entry;
  switch (spec.kind) {
    case 'confirm':
      return <ConfirmView entry={{ ...entry, spec }} host={host} />;
    case 'alert':
      return <AlertView entry={{ ...entry, spec }} host={host} />;
    case 'prompt':
      return <PromptView entry={{ ...entry, spec }} host={host} />;
    case 'custom':
      return <CustomView entry={{ ...entry, spec }} host={host} />;
  }
}

/**
 * Hosts the dialogs requested through `useDialogs()`. Mount it once near the root, inside the
 * `I18nProvider` and theme scope the dialogs should use. Dialogs stack in call order and only the
 * topmost acts on Escape. Unmounting the provider resolves every open dialog with its cancel value.
 */
export function DialogsProvider({ children }: DialogsProviderProps) {
  const [store] = useState(createDialogsStore);
  const entries = useSyncExternalStore(store.subscribe, store.getEntries, store.getEntries);
  const guard = useDismissGuard(store);

  useEffect(() => () => store.closeAll(), [store]);

  const dialogs = useMemo<Dialogs>(
    () => ({
      confirm: (message, options = {}) => store.add({ kind: 'confirm', message, options }, false, options.returnFocus),
      alert: (message, options = {}) => store.add({ kind: 'alert', message, options }, undefined, options.returnFocus),
      prompt: (message, options) => store.add({ kind: 'prompt', message, options }, null, options.returnFocus),
      open: (Component, payload, options = {}) =>
        store.add(
          {
            kind: 'custom',
            Component: Component as unknown as Extract<DialogEntry['spec'], { kind: 'custom' }>['Component'],
            payload,
          },
          undefined,
          options.returnFocus,
        ),
      update: (dialog, payload) => store.update(dialog, payload),
      close: (dialog, result) => store.close(dialog, result),
      closeAll: store.closeAll,
    }),
    [store],
  );

  const host = useMemo<DialogsHost>(
    () => ({
      settle: store.settle,
      canDismiss: guard.canDismiss,
      canClose: guard.canClose,
      finalFocus: (entry) => () => store.focusTarget(entry),
    }),
    [store, guard],
  );

  return (
    <DialogsContext.Provider value={dialogs}>
      {children}
      {entries.map((entry) => (
        <EntryView key={entry.id} entry={entry} host={host} />
      ))}
    </DialogsContext.Provider>
  );
}
