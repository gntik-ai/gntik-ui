import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import {
  createItem,
  defaultItemLabel,
  hasExactLabel,
  isSpecialItem,
  retryItem,
  type SpecialItem,
} from './specialItems';
import { useAsyncOptions, type LoadOptions } from './useAsyncOptions';

export interface ComboboxAsyncProps<Value> {
  /**
   * Async options: called (debounced) with the typed query and an `AbortSignal` that fires when the
   * request goes stale. While it is set, the returned options are shown as-is (no client filter).
   */
  loadOptions?: LoadOptions<Value>;
  /** Debounce for `loadOptions`, in ms. Default 250. */
  debounceMs?: number;
  /**
   * Creatable: adds a "Create “…”" option while the typed text matches no option. Return the new
   * item (or a promise of it) to select it; return nothing to leave the selection as it is.
   */
  onCreate?: (input: string) => Value | void | Promise<Value | void>;
  /** Text of the create option. Default: "Create “{input}”". */
  createLabel?: (input: string) => ReactNode;
  /** Shown (and announced) while options load. Default: "Loading…". */
  loadingText?: ReactNode;
  /** Shown (and announced) when `loadOptions` rejects. Default: "Couldn’t load options." */
  errorText?: ReactNode | ((error: unknown) => ReactNode);
}

export type ComboboxProps<Value, Multiple extends boolean | undefined = false> = BaseCombobox.Root.Props<Value, Multiple> &
  ComboboxAsyncProps<Value>;

interface ComboboxEnhancement {
  loading: boolean;
  error: unknown;
  loadingText?: ReactNode;
  errorText?: ComboboxAsyncProps<unknown>['errorText'];
  createLabel?: (input: string) => ReactNode;
  specials: SpecialItem[];
}

const EnhancementContext = createContext<ComboboxEnhancement | null>(null);

/** Async / creatable state for ComboboxContent; `null` for a plain Combobox. */
export const useComboboxEnhancement = () => useContext(EnhancementContext);

/**
 * Combobox state container: `items` (filtered by the input), `value` / `defaultValue` /
 * `onValueChange`, `multiple`. Items shaped `{ value, label }` need no extra config.
 * Add `loadOptions` for async options and `onCreate` for a "Create “…”" option.
 */
export function Combobox<Value, Multiple extends boolean | undefined = false>(props: ComboboxProps<Value, Multiple>) {
  const { loadOptions, debounceMs, onCreate, createLabel, loadingText, errorText, ...root } = props;
  const flat = root.items === undefined || (Array.isArray(root.items) && !root.items.some(isGroup));
  if ((!loadOptions && !onCreate) || !flat) return <BaseCombobox.Root {...root} />;
  return (
    <EnhancedCombobox
      root={root as BaseCombobox.Root.Props<unknown, Multiple>}
      loadOptions={loadOptions as LoadOptions<unknown> | undefined}
      debounceMs={debounceMs}
      onCreate={onCreate as ComboboxAsyncProps<unknown>['onCreate']}
      createLabel={createLabel}
      loadingText={loadingText}
      errorText={errorText}
    />
  );
}

function isGroup(item: unknown): boolean {
  return !!item && typeof item === 'object' && Array.isArray((item as { items?: unknown }).items);
}

type ChangeDetails = BaseCombobox.Root.ChangeEventDetails;

function EnhancedCombobox<Multiple extends boolean | undefined>({
  root,
  loadOptions,
  debounceMs,
  onCreate,
  createLabel,
  loadingText,
  errorText,
}: ComboboxAsyncProps<unknown> & { root: BaseCombobox.Root.Props<unknown, Multiple> }) {
  const {
    items,
    value: valueProp,
    defaultValue,
    onValueChange,
    onInputValueChange,
    open: openProp,
    defaultOpen,
    onOpenChange,
    filter,
    itemToStringLabel,
    isItemEqualToValue,
    multiple,
    ...rest
  } = root;
  const core = BaseCombobox.useFilter();
  const [innerValue, setInnerValue] = useState<unknown>(defaultValue ?? (multiple ? [] : null));
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [input, setInput] = useState(String(root.inputValue ?? root.defaultInputValue ?? ''));
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? innerOpen;
  const keepOpen = useRef(false);

  const toLabel = (item: unknown) => (isSpecialItem(item) ? item.label : itemToStringLabel ? itemToStringLabel(item) : defaultItemLabel(item));
  const typed = input.trim();
  const selectedLabel = !multiple && value != null ? toLabel(value).trim() : null;
  // A single selection fills the input with its label: that is not a search.
  const query = selectedLabel !== null && selectedLabel === typed ? '' : typed;

  const remote = useAsyncOptions<unknown>(loadOptions, query, { debounceMs, enabled: open });
  const base: readonly unknown[] = loadOptions ? (remote.error ? [] : remote.items) : ((items as readonly unknown[] | undefined) ?? []);
  const specials: SpecialItem[] = [];
  if (onCreate && query !== '' && !hasExactLabel(base, typed, toLabel)) specials.push(createItem(typed));
  if (loadOptions && remote.error && !remote.loading) specials.push(retryItem(input));
  const allItems = [...base, ...specials];

  const commit = (next: unknown, details: ChangeDetails) => {
    setInnerValue(next);
    (onValueChange as ((v: unknown, d: ChangeDetails) => void) | undefined)?.(next, details);
  };

  const create = async (text: string, kept: unknown[] | null, details: ChangeDetails) => {
    const created = await onCreate?.(text);
    if (created === undefined || created === null) return;
    commit(kept ? [...kept, created] : created, details);
  };

  const handleValueChange = (next: unknown, details: ChangeDetails) => {
    const list = multiple && Array.isArray(next) ? next : null;
    const special = list ? list.find(isSpecialItem) : isSpecialItem(next) ? next : undefined;
    if (!special) return commit(next, details);
    const kept = list ? list.filter((item) => !isSpecialItem(item)) : null;
    if (special.__gntikSpecial === 'retry') {
      keepOpen.current = true;
      remote.reload();
      return;
    }
    void create(special.value.trim(), kept, details);
  };

  const enhancement: ComboboxEnhancement = {
    loading: remote.loading,
    error: remote.error,
    loadingText,
    errorText,
    createLabel,
    specials,
  };

  return (
    <EnhancementContext.Provider value={enhancement}>
      <BaseCombobox.Root<unknown, Multiple>
        {...rest}
        multiple={multiple}
        items={allItems}
        value={value as never}
        onValueChange={handleValueChange as never}
        open={open}
        onOpenChange={(next, details) => {
          if (!next && keepOpen.current) {
            keepOpen.current = false;
            return;
          }
          setInnerOpen(next);
          onOpenChange?.(next, details);
        }}
        onInputValueChange={(next, details) => {
          setInput(next);
          onInputValueChange?.(next, details);
        }}
        itemToStringLabel={toLabel}
        isItemEqualToValue={(a: unknown, b: unknown) =>
          isSpecialItem(a) || isSpecialItem(b) ? a === b : isItemEqualToValue ? isItemEqualToValue(a, b) : Object.is(a, b)
        }
        filter={
          loadOptions
            ? null
            : (item: unknown, q: string, toString?: (item: unknown) => string) =>
                isSpecialItem(item) || filter === null || (filter ? filter(item, q, toString) : core.contains(item, q, toString))
        }
      />
    </EnhancementContext.Provider>
  );
}
