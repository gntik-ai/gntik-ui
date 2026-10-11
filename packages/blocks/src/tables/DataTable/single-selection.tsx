import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';

const mountedNames = new Map<string, number>();

export interface SingleSelection<T> {
  selectedId: string | null;
  inputProps: (row: T) => ComponentProps<'input'>;
}

export function useSingleSelection<T>(options: {
  selectionName?: string;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string) => void;
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  rows: readonly T[];
  isRowDisabled?: (row: T) => boolean;
}): SingleSelection<T> {
  const generatedName = useId();
  const [innerId, setInnerId] = useState(options.defaultSelectedId ?? null);
  const selectedId = options.selectedId === undefined ? innerId : options.selectedId;
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const enabledIds = options.rows.filter((row) => !options.isRowDisabled?.(row)).map(options.getRowId);
  const tabId = selectedId != null && enabledIds.includes(selectedId) ? selectedId : enabledIds[0];
  const select = (id: string) => {
    if (id === selectedId) return;
    setInnerId(id);
    options.onSelectedIdChange?.(id);
  };
  return {
    selectedId,
    inputProps: (row) => {
      const id = options.getRowId(row);
      const disabled = options.isRowDisabled?.(row) ?? false;
      return {
        type: 'radio',
        name: options.selectionName ?? generatedName,
        'aria-label': options.getRowLabel(row),
        checked: selectedId === id,
        disabled,
        tabIndex: !disabled && id === tabId ? 0 : -1,
        ref: (input) => {
          if (input) inputs.current.set(id, input);
          else inputs.current.delete(id);
        },
        onChange: () => {
          if (!disabled) select(id);
        },
        onKeyDown: (event) => {
          const direction = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
          if (direction == null || disabled || enabledIds.length === 0) return;
          event.preventDefault();
          const index = enabledIds.indexOf(id);
          const nextId = enabledIds[(index + direction + enabledIds.length) % enabledIds.length]!;
          inputs.current.get(nextId)?.focus();
          select(nextId);
        },
      };
    },
  };
}

export function SelectionGroup({
  single,
  legend,
  selectionName,
  paginated,
  children,
  ...label
}: {
  single: boolean;
  legend?: ReactNode;
  selectionName?: string;
  paginated?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
}) {
  const hasLabel = Boolean(legend || label['aria-label']?.trim() || label['aria-labelledby']?.trim());
  useEffect(() => {
    if (single && paginated === true && process.env.NODE_ENV === 'development') {
      console.warn('DataTable single selection: paginated=true is unsupported; rendering all rows without pagination.');
    }
  }, [single, paginated]);
  useEffect(() => {
    if (!single || process.env.NODE_ENV !== 'development') return;
    if (!hasLabel) console.warn('DataTable single selection: supply legend, aria-label or aria-labelledby.');
  }, [single, hasLabel]);
  useEffect(() => {
    if (!single || selectionName === undefined || process.env.NODE_ENV !== 'development') return;
    const count = mountedNames.get(selectionName) ?? 0;
    if (count > 0)
      console.warn(
        `DataTable single selection: duplicate selectionName "${selectionName}"; supplied names must be unique per page.`,
      );
    mountedNames.set(selectionName, count + 1);
    return () => {
      const remaining = (mountedNames.get(selectionName) ?? 1) - 1;
      if (remaining === 0) mountedNames.delete(selectionName);
      else mountedNames.set(selectionName, remaining);
    };
  }, [single, selectionName]);
  if (!single) return <>{children}</>;
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" {...label}>
      {legend != null && <legend className="px-3 py-2 text-sm font-medium text-foreground">{legend}</legend>}
      {children}
    </fieldset>
  );
}
