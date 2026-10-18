import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useRender } from '@base-ui/react/use-render';
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffectEvent,
  useLayoutEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useMeasuredRows, type MeasuredRowOptions } from '../VirtualList/use-measured-rows';

interface WindowState {
  active: number;
  query: string;
  selected: unknown;
  equal: (a: unknown, b: unknown) => boolean;
}
const WindowContext = createContext<WindowState | null>(null);
export const useComboboxWindow = () => useContext(WindowContext);

/** Preserves the Base UI root API while exposing highlight and query to the window. */
export function WindowedComboboxRoot<Value, Multiple extends boolean | undefined = false>(
  props: BaseCombobox.Root.Props<Value, Multiple>,
) {
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState(String(props.defaultInputValue ?? ''));
  const [value, setValue] = useState<unknown>(props.defaultValue);
  const selected = props.value !== undefined ? props.value : value;
  return (
    <WindowContext.Provider
      value={{
        active,
        query: String(props.inputValue ?? query),
        selected: props.multiple ? (selected as unknown[])?.[0] : selected,
        equal: (props.isItemEqualToValue as WindowState['equal']) ?? Object.is,
      }}
    >
      <BaseCombobox.Root
        {...props}
        onItemHighlighted={(item, details) => {
          setActive(details.index);
          props.onItemHighlighted?.(item, details);
        }}
        onInputValueChange={(next, details) => {
          props.onInputValueChange?.(next, details);
          if (!details.isCanceled) setQuery(next);
        }}
        onValueChange={(next, details) => {
          props.onValueChange?.(next, details);
          if (!details.isCanceled) setValue(next);
        }}
        onOpenChange={(next, details) => {
          props.onOpenChange?.(next, details);
          if (!next && !details.isCanceled) setActive(-1);
        }}
      />
    </WindowContext.Provider>
  );
}

export function WindowedComboboxList<Item = unknown>({
  children,
  'aria-busy': busy,
  ...options
}: MeasuredRowOptions & {
  children: (item: Item, index: number) => ReactNode;
  'aria-busy'?: boolean;
}) {
  const state = useComboboxWindow();
  const items = BaseCombobox.useFilteredItems<Item>();
  const selectedIndex = state?.selected != null ? items.findIndex((item) => state.equal(item, state.selected)) : -1;
  const active = state?.active ?? -1;
  const { indices, total, rowProps, setViewport, scrollTo, onScroll } = useMeasuredRows(
    items.length,
    options,
    active >= 0 ? active : selectedIndex,
  );
  const scrollOnChange = useEffectEvent((index: number) => scrollTo(index));
  useLayoutEffect(() => {
    scrollOnChange(-1);
  }, [state?.query]);
  useLayoutEffect(() => {
    scrollOnChange(selectedIndex);
  }, [selectedIndex]);
  useLayoutEffect(() => {
    if (active >= 0) scrollOnChange(active);
  }, [active]);
  return (
    <BaseCombobox.List
      data-virtualized=""
      aria-busy={busy}
      ref={setViewport}
      className="max-h-64 min-h-0 overflow-y-auto outline-none data-empty:hidden"
      style={{ height: Math.min(total, 256) }}
      onScroll={onScroll}
    >
      <div className="relative" style={{ height: total }}>
        {indices.map((index) => {
          const child = children(items[index]!, index);
          return isValidElement(child) ? (
            <WindowedOption
              key={child.key ?? index}
              child={child as ReactElement<BaseCombobox.Item.Props>}
              position={rowProps(index)}
              index={index}
            />
          ) : (
            child
          );
        })}
      </div>
    </BaseCombobox.List>
  );
}

function WindowedOption({
  child,
  position,
  index,
}: {
  child: ReactElement<BaseCombobox.Item.Props>;
  position: ReturnType<ReturnType<typeof useMeasuredRows>['rowProps']>;
  index: number;
}) {
  return useRender({
    ref: position.ref,
    render: cloneElement(child, {
      ...position,
      index,
      ref: child.props.ref,
      style: (state) => ({
        ...(typeof child.props.style === 'function' ? child.props.style(state) : child.props.style),
        ...position.style,
      }),
    }),
  });
}

/** Route list navigation keys through Base UI's public listbox keyboard interface. */
export const navigateVirtualOptions: NonNullable<BaseCombobox.Input.Props['onKeyDown']> = (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (!['Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) return;
  const input = event.currentTarget;
  if (input.getAttribute('aria-expanded') !== 'true') return;
  const list = document.getElementById(input.getAttribute('aria-controls') ?? '');
  if (!list?.hasAttribute('data-virtualized')) return;
  const count = Number(list.querySelector('[aria-setsize]')?.getAttribute('aria-setsize') ?? 0);
  if (count === 0) return;
  event.preventDefault();
  event.preventBaseUIHandler();
  const page = event.key === 'PageDown' || event.key === 'PageUp';
  const rowHeight = list.querySelector<HTMLElement>('[role="option"]')?.getBoundingClientRect().height || 32;
  const activeElement = document.getElementById(input.getAttribute('aria-activedescendant') ?? '');
  const active = Number(activeElement?.getAttribute('aria-posinset') ?? 0) - 1;
  const pageSize = Math.max(1, Math.floor((list.clientHeight || 256) / rowHeight) - 1);
  const target = page
    ? Math.max(0, Math.min(count - 1, active + (event.key === 'PageDown' ? pageSize : -pageSize)))
    : event.key === 'End'
      ? count - 1
      : 0;
  const key = target > active ? 'ArrowDown' : 'ArrowUp';
  // Base UI owns the highlight and selection; its input reserves Home/End for the caret.
  // Forward equivalent list navigation without accessing Base UI's private store.
  for (let i = 0; i < Math.abs(target - active); i++) {
    list.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }
};
