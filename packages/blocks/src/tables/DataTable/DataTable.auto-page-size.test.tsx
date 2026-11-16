import { act, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { DataTable } from './DataTable';
import AutoPageSize from './examples/auto-page-size';
import { expectNoAxeViolations } from '../../test/a11y';

const rows = Array.from({ length: 95 }, (_, i) => ({ id: i + 1 }));
const columns = [{ id: 'id', header: 'Id', accessor: (row: { id: number }) => row.id }];
const table = { rows, columns, selectionMode: 'none' as const };
const visibleIds = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getByRole('cell').textContent);

function geometry(initialHeight: number) {
  let height = initialHeight;
  const observers: ResizeObserverMock[] = [];
  class ResizeObserverMock {
    targets = new Set<Element>();
    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }
    observe = (target: Element) => {
      this.targets.add(target);
    };
    unobserve = (target: Element) => {
      this.targets.delete(target);
    };
    disconnect = vi.fn();
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute('data-auto-page-size-viewport') ? height : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 800,
      bottom: this.tagName === 'THEAD' ? 40 : 0,
      width: 800,
      height: this.tagName === 'THEAD' ? 40 : 0,
      toJSON: () => ({}),
    };
  });
  return {
    resize(next: number) {
      height = next;
      act(() => {
        for (const observer of observers) observer.callback([], observer as unknown as ResizeObserver);
      });
    },
    observers,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('falls back to the default size and warns once without a definite height, then recovers', () => {
  const measured = geometry(0);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const onPageSizeChange = vi.fn();
  render(<DataTable {...table} autoPageSize defaultPageSize={5} onPageSizeChange={onPageSizeChange} />);
  expect(visibleIds()).toEqual(['1', '2', '3', '4', '5']);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('definite height'));
  measured.resize(0);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(onPageSizeChange).not.toHaveBeenCalled();
  measured.resize(392);
  expect(visibleIds()).toHaveLength(8);
  expect(onPageSizeChange.mock.calls).toEqual([[8]]);
  measured.resize(0);
  expect(visibleIds()).toHaveLength(5);
  expect(onPageSizeChange.mock.calls).toEqual([[8], [5]]);
});

it('reports a measured size only once under StrictMode', () => {
  geometry(392);
  const onPageSizeChange = vi.fn();
  render(
    <StrictMode>
      <DataTable {...table} autoPageSize onPageSizeChange={onPageSizeChange} />
    </StrictMode>,
  );
  expect(visibleIds()).toHaveLength(8);
  expect(onPageSizeChange.mock.calls).toEqual([[8]]);
});

it.each([
  { density: 'compact' as const, rowHeight: undefined, viewport: 392, expected: 9 },
  { density: 'comfortable' as const, rowHeight: 50, viewport: 392, expected: 7 },
  { density: 'comfortable' as const, rowHeight: undefined, viewport: 41, expected: 1 },
])(
  'uses density or explicit row height, with at least one row: $expected',
  ({ density, rowHeight, viewport, expected }) => {
    geometry(viewport);
    render(<DataTable {...table} autoPageSize density={density} rowHeight={rowHeight} pageSize={25} />);
    expect(visibleIds()).toHaveLength(expected);
  },
);

it.each(['dark', 'light', 'high_contrast'])('the automatic example has accessible structure in %s', async (theme) => {
  geometry(392);
  document.documentElement.className = theme;
  const { container } = render(<AutoPageSize />);
  expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  await expectNoAxeViolations(container);
});

it('fits whole body rows, grows without duplicate resize reports and preserves the first visible row', () => {
  // In a 480px parent the toolbar/footer leave a 392px viewport, including a 40px header.
  const measured = geometry(392);
  const onPageSizeChange = vi.fn();
  const onQueryChange = vi.fn();
  const { unmount } = render(
    <div style={{ height: 480 }}>
      <DataTable
        {...table}
        autoPageSize
        defaultPage={3}
        onPageSizeChange={onPageSizeChange}
        onQueryChange={onQueryChange}
      />
    </div>,
  );
  expect(visibleIds()).toEqual(['17', '18', '19', '20', '21', '22', '23', '24']);
  expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  expect(onPageSizeChange.mock.calls).toEqual([[8]]);
  measured.resize(568);
  expect(visibleIds()).toEqual(['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']);
  expect(onPageSizeChange.mock.calls).toEqual([[8], [12]]);
  expect(onQueryChange.mock.calls).toEqual([
    [{ page: 3, pageSize: 8, sort: null, filters: undefined, cause: 'pageSize' }],
    [{ page: 2, pageSize: 12, sort: null, filters: undefined, cause: 'pageSize' }],
  ]);
  measured.resize(568);
  measured.resize(570);
  expect(onPageSizeChange).toHaveBeenCalledTimes(2);
  unmount();
  expect(measured.observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
});
