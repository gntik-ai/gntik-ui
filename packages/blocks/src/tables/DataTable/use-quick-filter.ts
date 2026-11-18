import { useEffect, useEffectEvent, useMemo, useRef } from 'react';
import type { DataTableColumn } from './data-table-utils';
import { indexQuickFilter, matchQuickFilter, quickFilterTerms } from './quick-filter';
import { useControllable } from './use-table-views';

/** Owns the applied quick filter term and, in client mode, the rows it keeps. */
export function useQuickFilter<T>(options: {
  value?: string;
  defaultValue: string;
  onChange?: (value: string) => void;
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  hidden: readonly string[];
  serverMode: boolean;
  locale: string;
  booleanLabels: [trueLabel: string, falseLabel: string];
  /** The term changed from outside (the controlled prop), not through `apply`. */
  onExternalChange?: () => void;
}) {
  const [term, setTerm] = useControllable(options.value, options.defaultValue, options.onChange);
  const previous = useRef(term);
  const resetExternal = useEffectEvent(() => options.onExternalChange?.());
  useEffect(() => {
    if (previous.current !== term) {
      previous.current = term;
      resetExternal();
    }
  }, [term]);

  const { rows, columns, serverMode, locale } = options;
  const [trueLabel, falseLabel] = options.booleanLabels;
  const hiddenKey = options.hidden.join('\u0000');
  const active = !serverMode && quickFilterTerms(term).length > 0;
  // The per-row search text depends on the rows, columns, hidden columns and locale, never on the term.
  const index = useMemo(
    () =>
      active
        ? indexQuickFilter(rows, columns, new Set(hiddenKey ? hiddenKey.split('\u0000') : []), {
            locale,
            booleanLabels: [trueLabel, falseLabel],
          })
        : null,
    [active, rows, columns, hiddenKey, locale, trueLabel, falseLabel],
  );
  const matching = useMemo(() => (index ? matchQuickFilter(index, term, locale) : rows), [index, term, locale, rows]);

  return {
    term,
    rows: matching,
    /** Applies a term; returns false when it is the term already applied. */
    apply: (next: string): boolean => {
      if (next === term) return false;
      previous.current = next;
      setTerm(next);
      return true;
    },
  };
}
