import { act, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { DataTable, type DataTableHandle } from './DataTable';
import { generateDeployments } from './fixtures';

const rows = generateDeployments(60);

interface Geometry {
  tableWidth: number;
  containerWidth: number;
  scrollerHeight: number;
  headHeight: number;
}

/** jsdom has no layout: report the sizes a browser would, and let the test fire the observers. */
function mockGeometry(initial: Partial<Geometry> = {}) {
  const sizes: Geometry = { tableWidth: 800, containerWidth: 900, scrollerHeight: 700, headHeight: 40, ...initial };
  const observers: ResizeObserverMock[] = [];
  class ResizeObserverMock {
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.tagName === 'TABLE') return sizes.tableWidth;
    return this.firstElementChild?.tagName === 'TABLE' ? sizes.containerWidth : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'THEAD' ? sizes.headHeight : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.testid === 'scroller' ? sizes.scrollerHeight : 0;
  });
  return {
    observers,
    update(next: Partial<Geometry>) {
      Object.assign(sizes, next);
      act(() => {
        for (const observer of observers) observer.callback([], observer as unknown as ResizeObserver);
      });
    },
  };
}

function Scroller({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="scroller" style={{ overflowY: 'auto' }}>
      {children}
    </div>
  );
}

const card = () => screen.getByRole('table').closest<HTMLElement>('.rounded-xl')!;
const root = card;
const container = () => screen.getByRole('table').parentElement!;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DataTable sticky header: page mode', () => {
  it('pins opaque header cells under the offset and clips the card without a scroll container', () => {
    mockGeometry();
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader />
      </Scroller>,
    );
    expect(root()).toHaveAttribute('data-sticky-header', 'page');
    expect(card()).toHaveClass('overflow-clip', 'isolate');
    expect(card()).not.toHaveClass('overflow-hidden');
    expect(container()).toHaveClass('overflow-visible');
    const head = screen.getByRole('columnheader', { name: /Region/ });
    expect(head).toHaveClass('sticky', 'z-sticky', 'bg-card', 'top-[var(--data-table-sticky-top)]');
    expect(head).not.toHaveClass('bg-secondary/30');
  });

  it.each([
    [undefined, '0px'],
    [60, '60px'],
    ['3.5rem', '3.5rem'],
  ])('writes stickyHeaderOffset %s as %s', (offset, expected) => {
    mockGeometry();
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader stickyHeaderOffset={offset} />
      </Scroller>,
    );
    expect(card().style.getPropertyValue('--data-table-sticky-top')).toBe(expected);
  });

  it('keeps pinned header cells opaque, tinted and above the page-pinned cells', () => {
    mockGeometry();
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader defaultPinnedColumns={{ left: ['name'], right: ['cost'] }} />
      </Scroller>,
    );
    for (const name of [/Deployment/, /Cost/]) {
      const head = screen.getByRole('columnheader', { name });
      expect(head).toHaveClass('z-sticky-pinned', 'bg-card', 'top-[var(--data-table-sticky-top)]');
      expect(head.className).toContain('before:bg-secondary/30');
    }
    const selection = screen.getAllByRole('columnheader')[0]!;
    expect(selection).toHaveClass('top-[var(--data-table-sticky-top)]', 'z-sticky-pinned');
  });

  it('gives body rows a scroll margin of the offset plus the measured header height', () => {
    mockGeometry({ headHeight: 44 });
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader stickyHeaderOffset={60} />
      </Scroller>,
    );
    expect(card().style.getPropertyValue('--data-table-scroll-margin')).toBe(
      'calc(var(--data-table-sticky-top) + 44px)',
    );
    expect(screen.getByRole('table').className).toContain('scroll-mt-[var(--data-table-scroll-margin)]');
  });

  it('observes the header only while sticky and releases the observers on unmount', () => {
    const observedHeads = (geometry: ReturnType<typeof mockGeometry>) =>
      geometry.observers.filter((observer) =>
        observer.observe.mock.calls.some(([target]) => (target as Element).tagName === 'THEAD'),
      );
    const plain = mockGeometry();
    const unmounted = render(
      <Scroller>
        <DataTable rows={rows} />
      </Scroller>,
    );
    expect(observedHeads(plain)).toHaveLength(0);
    unmounted.unmount();
    const sticky = mockGeometry();
    const view = render(
      <Scroller>
        <DataTable rows={rows} stickyHeader />
      </Scroller>,
    );
    const watching = observedHeads(sticky);
    expect(watching).toHaveLength(1);
    view.unmount();
    expect(watching[0]!.disconnect).toHaveBeenCalled();
  });
});

describe('DataTable sticky header: wide tables', () => {
  it('switches to a bounded, focusable region named by the caption and back to page mode', () => {
    const geometry = mockGeometry({ tableWidth: 1000, containerWidth: 900, scrollerHeight: 700 });
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader caption="Runs" />
      </Scroller>,
    );
    expect(root()).toHaveAttribute('data-sticky-header', 'bounded');
    const region = screen.getByRole('region', { name: 'Runs' });
    expect(region).toBe(container());
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.style.maxHeight).toBe('700px');
    expect(region).not.toHaveClass('overflow-visible');
    expect(screen.getByRole('columnheader', { name: /Region/ })).toHaveClass('sticky', 'top-0', 'bg-card');

    geometry.update({ containerWidth: 1100 });
    expect(root()).toHaveAttribute('data-sticky-header', 'page');
    expect(container().style.maxHeight).toBe('');
    expect(screen.queryByRole('region', { name: 'Runs' })).not.toBeInTheDocument();
  });

  it('subtracts a numeric or string offset from the scroller height', () => {
    mockGeometry({ tableWidth: 1000, containerWidth: 900, scrollerHeight: 700 });
    const { rerender } = render(
      <Scroller>
        <DataTable rows={rows} stickyHeader stickyHeaderOffset={60} />
      </Scroller>,
    );
    expect(container().style.maxHeight).toBe('640px');
    rerender(
      <Scroller>
        <DataTable rows={rows} stickyHeader stickyHeaderOffset="3.5rem" />
      </Scroller>,
    );
    expect(container().style.maxHeight).toBe('calc(700px - 3.5rem)');
  });

  it('ignores a difference within the 1px tolerance', () => {
    const geometry = mockGeometry({ tableWidth: 901, containerWidth: 900 });
    render(
      <Scroller>
        <DataTable rows={rows} stickyHeader />
      </Scroller>,
    );
    expect(root()).toHaveAttribute('data-sticky-header', 'page');
    geometry.update({ tableWidth: 902 });
    expect(root()).toHaveAttribute('data-sticky-header', 'bounded');
  });
});

describe('DataTable maxHeight', () => {
  it('bounds a non-virtual table, keeps every row mounted and names the region after the caption', () => {
    mockGeometry();
    render(<DataTable rows={rows} paginated={false} maxHeight={320} caption="Audit" />);
    const region = screen.getByRole('region', { name: 'Audit' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.style.maxHeight).toBe('320px');
    expect(screen.getByRole('table')).not.toHaveAttribute('data-virtualized');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(61);
    expect(root()).toHaveAttribute('data-sticky-header', 'bounded');
    expect(screen.getByRole('columnheader', { name: /Region/ })).toHaveClass('sticky', 'top-0', 'bg-card');
  });

  it('keeps resizable headers sticky in the bounded body', () => {
    mockGeometry();
    render(<DataTable rows={rows} paginated={false} maxHeight={320} resizable />);
    const head = screen.getByRole('columnheader', { name: /Region/ });
    expect(head.querySelector('[role="separator"]')).not.toBeNull();
    expect(head).toHaveClass('sticky', 'top-0', 'bg-card');
    expect(head).not.toHaveClass('relative');
  });

  it('accepts a CSS length and takes precedence over page mode', () => {
    mockGeometry({ tableWidth: 800, containerWidth: 900 });
    render(<DataTable rows={rows} stickyHeader maxHeight="20rem" />);
    expect(container().style.maxHeight).toBe('20rem');
    expect(root()).toHaveAttribute('data-sticky-header', 'bounded');
  });

  it('overrides the max-h-[32rem] default of a virtualized table', () => {
    mockGeometry();
    const many = generateDeployments(200);
    render(<DataTable rows={many} paginated={false} maxHeight={320} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-virtualized');
    expect(container().style.maxHeight).toBe('320px');
  });
});

describe('DataTable without sticky props', () => {
  it('keeps the card, container and header surface of today', () => {
    mockGeometry();
    render(<DataTable rows={rows} />);
    expect(card()).toHaveClass('overflow-hidden');
    expect(card()).not.toHaveClass('isolate');
    expect(card()).not.toHaveAttribute('style');
    expect(card()).not.toHaveAttribute('data-sticky-header');
    expect(container()).not.toHaveClass('overflow-visible');
    expect(container().style.maxHeight).toBe('');
    const head = screen.getByRole('columnheader', { name: /Region/ });
    expect(head).toHaveClass('bg-secondary/30');
    expect(head).not.toHaveClass('sticky');
    expect(screen.getByRole('table').className).not.toContain('scroll-mt-');
  });

  it('leaves autoPageSize with its h-full container', () => {
    mockGeometry();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<DataTable rows={rows} autoPageSize stickyHeader maxHeight={200} />);
    expect(container()).toHaveClass('h-full');
    expect(container().style.maxHeight).toBe('');
    expect(card()).not.toHaveAttribute('data-sticky-header');
    expect(card()).toHaveClass('overflow-hidden');
  });
});

describe('DataTable sticky header: scroll to row', () => {
  it('moves the scroller so the revealed row ends below the pinned header', () => {
    mockGeometry();
    Element.prototype.scrollIntoView = vi.fn();
    const ref = createRef<DataTableHandle>();
    render(
      <Scroller>
        <DataTable ref={ref} rows={rows} stickyHeader />
      </Scroller>,
    );
    const scroller = screen.getByTestId('scroller');
    scroller.scrollTop = 100;
    const table = screen.getByRole('table') as HTMLTableElement;
    vi.spyOn(table.tHead!.querySelector('th')!, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 800, 40));
    const first = screen.getAllByRole('row')[1]!;
    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 10, 800, 40));
    act(() => {
      ref.current!.scrollToRow(first.dataset.rowId!);
    });
    expect(scroller.scrollTop).toBe(70);
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });
});
