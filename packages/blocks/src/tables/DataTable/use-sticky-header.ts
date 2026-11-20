import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { stickyHeadClass, type CellLayout } from './column-sizing';

/**
 * `page`: the header pins to the nearest scrolling ancestor. `bounded`: the table scrolls in its own
 * container of limited height and the header pins inside it. `none`: today's behaviour.
 */
export type StickyMode = 'none' | 'page' | 'bounded';

const StickyModeContext = createContext<StickyMode>('none');
export const StickyModeProvider = StickyModeContext.Provider;

/** Classes the header cells add for the current mode (`undefined` while the header is not opt-in sticky). */
export function useStickyHeadClass(layout?: CellLayout): string | undefined {
  const mode = useContext(StickyModeContext);
  return mode === 'none' ? undefined : stickyHeadClass(mode, layout);
}

const SCROLLING = /^(auto|scroll|overlay)$/;
/**
 * Rows, and the controls inside them, scroll to below the pinned header when focused (WCAG 2.4.11).
 * The browser aligns the focused control, not its row, so the margin adds a cell's vertical padding
 * (comfortable density, 0.75rem) to keep the whole row clear of the header.
 */
const CELL_PADDING = '0.75rem';
const SCROLL_MARGIN = '[&_tbody_*]:scroll-mt-[var(--data-table-scroll-margin)]';

const length = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** The nearest ancestor of `element` that scrolls vertically; `null` when the page itself scrolls. */
export function scrollParent(element: Element): HTMLElement | null {
  const view = element.ownerDocument.defaultView;
  for (let node = element.parentElement; node && view; node = node.parentElement) {
    if (SCROLLING.test(view.getComputedStyle(node).overflowY)) return node;
  }
  return null;
}

/** Scroller height minus the offset: a plain px value for a numeric offset, a calc() for a CSS length. */
function visibleHeight(viewport: number, offset: number | string): string | undefined {
  if (typeof offset === 'string') return viewport > 0 ? `calc(${viewport}px - ${offset})` : undefined;
  return viewport > offset ? `${viewport - offset}px` : undefined;
}

interface Measures {
  /** The table is wider than its container (beyond the 1 px tolerance). */
  wide: boolean;
  /** Visible height of the nearest scrolling ancestor, or of the window. */
  viewport: number;
  /** Height of the header row. */
  head: number;
}

export interface UseStickyHeaderOptions {
  stickyHeader: boolean;
  offset: number | string;
  maxHeight?: number | string;
  /** Virtualized tables keep their own bounded body: only `maxHeight` applies to them. */
  virtual: boolean;
  /** `autoPageSize` fills its parent and is never changed by these props. */
  autoSizing: boolean;
  /** The `<table>`; its parent is the scroll container. */
  tableRef: RefObject<HTMLTableElement | null>;
}

export interface StickyHeader {
  mode: StickyMode;
  /** Whether Table pins the header inside its own container (bounded modes). */
  bounded: boolean;
  /** Overflow classes of the card: today's `overflow-hidden`, or a clip that is not a scroll container. */
  cardClassName: string;
  /** Props of the card: ref, `data-sticky-header` and the CSS variables. */
  cardProps: { ref: RefObject<HTMLDivElement | null>; 'data-sticky-header'?: StickyMode; style?: CSSProperties };
  tableClassName?: string;
  containerClassName?: string;
}

/**
 * Picks how the header pins and measures what the choice needs. A table that fits its container
 * pins to the page; one wider than it scrolls in a container bounded to the scroller's visible
 * height, so its horizontal scrollbar stays on screen. `maxHeight` always bounds the container.
 */
export function useStickyHeader({
  stickyHeader,
  offset,
  maxHeight,
  virtual,
  autoSizing,
  tableRef,
}: UseStickyHeaderOptions): StickyHeader {
  const cardRef = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Measures>({ wide: false, viewport: 0, head: 0 });
  const [table, setTable] = useState<HTMLTableElement | null>(null);
  const free = !virtual && !autoSizing;
  const measuring = free && (stickyHeader || maxHeight != null);

  // The table (and its container) is remounted when its wrapper changes, e.g. SelectionGroup when
  // `selectionMode` flips: follow the mounted node so the observers and the bound are reattached.
  useLayoutEffect(() => {
    if (tableRef.current !== table) setTable(tableRef.current);
  });

  useLayoutEffect(() => {
    const container = table?.parentElement;
    const card = cardRef.current;
    if (!measuring || !table || !container || !card) return;
    const view = card.ownerDocument.defaultView;
    const scroller = scrollParent(card);
    const read = () => {
      const next = {
        wide: table.offsetWidth > container.offsetWidth + 1,
        viewport: scroller ? scroller.clientHeight : (view?.innerHeight ?? 0),
        head: table.tHead?.offsetHeight ?? 0,
      };
      setMeasures((prev) =>
        prev.wide === next.wide && prev.viewport === next.viewport && prev.head === next.head ? prev : next,
      );
    };
    read();
    view?.addEventListener('resize', read);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(read);
    for (const element of [container, table, table.tHead, scroller]) if (element) observer?.observe(element);
    return () => {
      observer?.disconnect();
      view?.removeEventListener('resize', read);
    };
  }, [measuring, table]);

  const mode: StickyMode =
    !free || !(stickyHeader || maxHeight != null) ? 'none' : maxHeight != null || measures.wide ? 'bounded' : 'page';
  // maxHeight also bounds a virtualized table, in place of its max-h-[32rem] default.
  const bound = autoSizing
    ? undefined
    : maxHeight != null
      ? length(maxHeight)
      : mode === 'bounded'
        ? visibleHeight(measures.viewport, offset)
        : undefined;

  // Table gives its container no style prop, so the height is set on the element itself.
  useLayoutEffect(() => {
    const container = table?.parentElement;
    if (!container || !bound) return;
    container.style.setProperty('max-height', bound);
    return () => {
      container.style.removeProperty('max-height');
    };
  }, [bound, table]);

  const sticky = mode !== 'none';
  return {
    mode,
    bounded: mode === 'bounded',
    cardClassName: sticky ? 'overflow-clip isolate' : 'overflow-hidden',
    cardProps: {
      ref: cardRef,
      'data-sticky-header': sticky ? mode : undefined,
      style: sticky
        ? ({
            '--data-table-sticky-top': length(offset),
            '--data-table-scroll-margin': `calc(var(--data-table-sticky-top) + ${measures.head}px + ${CELL_PADDING})`,
          } as CSSProperties)
        : undefined,
    },
    tableClassName: sticky ? SCROLL_MARGIN : undefined,
    containerClassName: mode === 'page' ? 'overflow-visible' : undefined,
  };
}
