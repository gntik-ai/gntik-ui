import { createContext, useEffect } from 'react';

/** Tracks whether a kit `FieldLabel` is mounted below a `Field`. */
export interface FieldLabelStore {
  has: () => boolean;
  register: () => () => void;
  subscribe: (listener: () => void) => () => void;
}

export function createFieldLabelStore(): FieldLabelStore {
  let count = 0;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    has: () => count > 0,
    register: () => {
      count += 1;
      notify();
      return () => {
        count -= 1;
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

/** Set below a kit `Fieldset`: true when it or an enclosing Fieldset is disabled. */
export const FieldsetDisabledContext = createContext(false);

/** Set below a kit `Field` (and so a `FormField`): its label, when it has one, names the control instead of a default aria-label. */
export const InFieldContext = createContext<InFieldValue | null>(null);

/** Call from a kit `FieldLabel`: tells controls below the same `Field` that a label names them. */
export function useRegisterFieldLabel(field: InFieldValue | null) {
  const labels = field?.labels;
  useEffect(() => labels?.register(), [labels]);
}
