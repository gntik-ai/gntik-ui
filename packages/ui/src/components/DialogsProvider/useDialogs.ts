import { createContext, useContext } from 'react';
import type { Dialogs } from './types';

export const DialogsContext = createContext<Dialogs | null>(null);

/**
 * Promise-based dialogs: `confirm`, `alert`, `prompt` and `open` for custom components, plus
 * `update`, `close` and `closeAll`. Must be called under a `DialogsProvider`.
 *
 * @example
 * const { confirm } = useDialogs();
 * if (await confirm('This key stops working at once.', { title: 'Revoke API key' })) revoke();
 */
export function useDialogs(): Dialogs {
  const dialogs = useContext(DialogsContext);
  if (!dialogs) throw new Error('useDialogs must be used within a DialogsProvider.');
  return dialogs;
}
