import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useRender } from '@base-ui/react/use-render';
import { flushSync } from 'react-dom';
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffectEvent,
  useLayoutEffect,
  useRef,
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
  allowEmpty: boolean;
  batchHighlights: (navigate: () => void) => void;
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
  const [loopNavigation, setLoopNavigation] = useState(false);
  type Highlight = Parameters<NonNullable<typeof props.onItemHighlighted>>;
  const navigation = useRef<{ batching: boolean; last: Highlight | null }>({ batching: false, last: null });
  const reportHighlight = (...args: Highlight) => {
    setActive(args[1].index);
    props.onItemHighlighted?.(...args);
  };
  const finishNavigation = () => {
    navigation.current.batching = false;
    const last = navigation.current.last;
    navigation.current.last = null;
    if (last) reportHighlight(...last);
  };
  const selected = props.value !== undefined ? props.value : value;
  return (
    <WindowContext.Provider
      value={
        props.virtualized === false
          ? null
          : {
              active,
              query: String(props.inputValue ?? query),
              selected: props.multiple ? (selected as unknown[])?.[0] : selected,
              equal: (props.isItemEqualToValue as WindowState['equal']) ?? Object.is,
              allowEmpty: !props.autoHighlight,
              batchHighlights: (navigate) => {
                navigation.current.batching = true;
                navigation.current.last = null;
                try {
                  // Endpoint/page targets are already clamped. Allow a shorter route
                  // across the boundary without changing ordinary arrow-key behavior.
                  if (props.loopFocus === false) flushSync(() => setLoopNavigation(true));
                  navigate();
                } finally {
                  if (props.loopFocus === false) flushSync(() => setLoopNavigation(false));
                  finishNavigation();
                }
              },
            }
      }
    >
      <BaseCombobox.Root
        {...props}
        loopFocus={loopNavigation || props.loopFocus}
        onItemHighlighted={(item, details) => {
          if (navigation.current.batching) navigation.current.last = [item, details];
          else reportHighlight(item, details);
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
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  ...options
}: MeasuredRowOptions & {
  children: (item: Item, index: number) => ReactNode;
  'aria-busy'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}) {
  const state = useComboboxWindow();
  const items = BaseCombobox.useFilteredItems<Item>();
  const selectedIndex = state?.selected != null ? items.findIndex((item) => state.equal(item, state.selected)) : -1;
  const active = state?.active ?? -1;
  const { indices, total, rowProps, setViewport, scrollTo, onScroll, pageSize } = useMeasuredRows(
    items,
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
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      ref={setViewport}
      className="max-h-64 min-h-0 overflow-y-auto outline-none data-empty:hidden"
      style={{ height: Math.min(total, 256) }}
      onScroll={onScroll}
      onKeyDown={(event) => {
        if (!state || !['Home', 'End', 'PageUp', 'PageDown'].includes(event.key) || items.length === 0) return;
        event.preventDefault();
        event.preventBaseUIHandler();
        const target =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : Math.max(0, Math.min(items.length - 1, active + (event.key === 'PageDown' ? pageSize : -pageSize)));
        let steps = Math.abs(target - active);
        let key = target > active ? 'ArrowDown' : 'ArrowUp';
        // Use the shorter path around a looping list: End/Home must not render every
        // intervening row in a large collection. Without autoHighlight, the loop also
        // includes the unhighlighted input position.
        const length = items.length + Number(state.allowEmpty);
        if (active < 0 && target === items.length - 1) {
          // Enter the list from its far end, including autoHighlight before a query.
          steps = 1;
          key = 'ArrowUp';
        } else if ((active >= 0 || state.allowEmpty) && length - steps < steps) {
          steps = length - steps;
          key = key === 'ArrowDown' ? 'ArrowUp' : 'ArrowDown';
        }
        // Base UI reserves Home/End for the input caret and has no public highlight setter.
        // Keep its navigation/selection state authoritative, reporting only the final highlight.
        state.batchHighlights(() => {
          for (let i = 0; i < steps; i++) {
            // 1.9 reconciles navigation against the committed active index on every key.
            // Commit each step before dispatching the next, while reporting only the final one.
            flushSync(() => {
              event.currentTarget.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            });
          }
        });
      }}
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
  event.preventDefault();
  event.preventBaseUIHandler();
  list.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, bubbles: true }));
};

/** Share caller-first keyboard handling between the single and chips inputs. */
export function useVirtualOptionsKeyDown(
  handler: BaseCombobox.Input.Props['onKeyDown'],
): NonNullable<BaseCombobox.Input.Props['onKeyDown']> {
  const windowed = useComboboxWindow();
  return (event) => {
    handler?.(event);
    if (windowed) navigateVirtualOptions(event);
  };
}
