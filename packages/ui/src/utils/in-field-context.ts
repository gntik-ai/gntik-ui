import { createContext, useEffect } from 'react';

/** Tracks whether a kit `FieldLabel` is mounted below a `Field`, readable from the first (server) render on. */
export interface FieldLabelStore {
  has: () => boolean;
  markRendered: () => void;
  register: () => () => void;
  subscribe: (listener: () => void) => () => void;
}

export function createFieldLabelStore(): FieldLabelStore {
  let rendered = false;
  let count = 0;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    has: () => rendered || count > 0,
    // Set while rendering, so a control rendered after its label sees it in the server render too.
    markRendered: () => {
      rendered = true;
    },
    register: () => {
      count += 1;
      notify();
      return () => {
        count -= 1;
        if (count === 0) rendered = false;
        notify();
      };
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export interface InFieldValue {
  labels: FieldLabelStore;
  disabled: boolean;
}

/** Set below a kit `Field` (and so a `FormField`): its label, when it has one, names the control instead of a default aria-label. */
export const InFieldContext = createContext<InFieldValue | null>(null);

/** Call from a kit `FieldLabel`: tells controls below the same `Field` that a label names them. */
export function useRegisterFieldLabel(field: InFieldValue | null) {
  field?.labels.markRendered();
  const labels = field?.labels;
  useEffect(() => labels?.register(), [labels]);
}
