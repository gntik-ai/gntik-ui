import type { ComponentType, ReactNode } from 'react';

/** Colour of the tone icon and, for `destructive`, of the confirm button. */
export type DialogTone = 'destructive' | 'warning' | 'info';

/**
 * Where focus goes when a dialog closes. Pass it to the popup's `finalFocus` prop
 * (`<DialogContent finalFocus={finalFocus}>`) so the provider can coordinate stacked dialogs.
 */
export type DialogFinalFocus = () => HTMLElement | boolean | null;

/** Options of `confirm()`. */
export interface ConfirmOptions {
  /** Dialog name. Without it the message becomes the name and no description is rendered. */
  title?: ReactNode;
  /** Icon colour; `destructive` (default) also styles the confirm button as destructive. */
  tone?: DialogTone;
  /** Confirm button label. Defaults to the `dialogs.confirm` catalog entry. */
  confirmLabel?: string;
  /** Cancel button label. Defaults to the `common.cancel` catalog entry. */
  cancelLabel?: string;
  /** Keeps the confirm button disabled until this exact, case-sensitive text is typed. */
  typeToConfirm?: string;
  /**
   * Runs when the confirm button is activated. A returned promise keeps the dialog open with a
   * pending confirm button: a resolve closes it with `true`, a rejection shows its message.
   */
  onConfirm?: () => void | Promise<void>;
  /** Element that receives focus on close; takes precedence over the opener. */
  returnFocus?: HTMLElement | null;
}

/** Options of `alert()`. */
export interface AlertOptions {
  title?: ReactNode;
  /** Icon colour; defaults to `info`. */
  tone?: DialogTone;
  /** Button label. Defaults to the `dialogs.ok` catalog entry. */
  okLabel?: string;
  returnFocus?: HTMLElement | null;
}

/** Options of `prompt()`. */
export interface PromptOptions {
  title?: ReactNode;
  /** Visible label of the text field. */
  label: string;
  defaultValue?: string;
  placeholder?: string;
  okLabel?: string;
  cancelLabel?: string;
  /** Returns a message while the value is invalid; the message is shown and OK is disabled. */
  validate?: (value: string) => string | undefined;
  returnFocus?: HTMLElement | null;
}

/** Options of `open()`. */
export interface OpenOptions {
  /** Element that receives focus on close; takes precedence over the opener. */
  returnFocus?: HTMLElement | null;
}

/** Props the provider passes to a component rendered with `open()`. */
export interface DialogComponentProps<P, R> {
  payload: P;
  /** Always `true` while the component is rendered; the provider removes it on close. */
  open: boolean;
  /** Resolves the promise returned by `open()` with `result` and removes the dialog. */
  onClose: (result: R) => void;
  /** Pass to the popup's `finalFocus` so focus returns correctly when dialogs are stacked. */
  finalFocus: DialogFinalFocus;
}

/** The promise returned by `open()`; hand it to `update` and `close` to address the dialog. */
export interface DialogHandle<R = unknown, P = unknown> extends Promise<R> {
  /** Type-only marker for the payload; never set. */
  readonly payloadType?: P;
}

/** What `useDialogs()` returns. */
export interface Dialogs {
  /** Resolves `true` on confirm and `false` on Cancel, Escape or `closeAll()`. */
  confirm: (message: ReactNode, options?: ConfirmOptions) => Promise<boolean>;
  /** Resolves `undefined` once dismissed. */
  alert: (message: ReactNode, options?: AlertOptions) => Promise<void>;
  /** Resolves the entered text, or `null` on Cancel, Escape or `closeAll()`. */
  prompt: (message: ReactNode, options: PromptOptions) => Promise<string | null>;
  /** Renders `Component` as a dialog; resolves with the value passed to `onClose` (or `close`). */
  open: <P, R = void>(
    Component: ComponentType<DialogComponentProps<P, R>>,
    payload: P,
    options?: OpenOptions,
  ) => DialogHandle<R, P>;
  /** Re-renders an open dialog with a new payload. */
  update: <P>(dialog: DialogHandle<unknown, P>, payload: P) => void;
  /** Resolves an open dialog with `result` and removes it. */
  close: <R>(dialog: DialogHandle<R, unknown>, result: R) => void;
  /** Resolves every open dialog with its cancel value and removes them all. */
  closeAll: () => void;
}
