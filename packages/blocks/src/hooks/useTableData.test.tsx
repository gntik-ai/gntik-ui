import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { useTableData, type TableDataParams, type TableDataResult } from './useTableData';

interface Row {
  id: number;
  name: string;
}
function endpoint() {
  const calls: Array<{
    params: TableDataParams<unknown>;
    resolve: (result: TableDataResult<Row>) => void;
    reject: (error: unknown) => void;
  }> = [];
  const getRows = vi.fn(
    (params: TableDataParams<unknown>) =>
      new Promise<TableDataResult<Row>>((resolve, reject) => calls.push({ params, resolve, reject })),
  );
  return { calls, getRows };
}
const row = (id: number): Row => ({ id, name: `Item ${id}` });
async function settle(call: ReturnType<typeof endpoint>['calls'][number], id: number) {
  await act(async () => call.resolve({ rows: [row(id)], rowCount: 95 }));
}

it('keeps the resolved page envelope while requesting the next page, and ignores superseded results', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() => useTableData({ getRows, initialPage: 2 }));
  expect(calls[0]!.params).toMatchObject({ page: 2, pageSize: 20, sort: null, cursor: null });
  await settle(calls[0]!, 21);
  act(() => result.current.tableProps.onPageChange(3));
  expect(calls[1]!.params).toMatchObject({ page: 3, pageSize: 20, sort: null });
  expect(calls[1]!.params.signal).not.toBe(calls[0]!.params.signal);
  expect(result.current.tableProps).toMatchObject({
    rows: [row(21)],
    page: 2,
    pageSize: 20,
    rowCount: 95,
    loading: false,
  });
  expect(result.current.isFetching).toBe(true);
  expect(result.current.params.page).toBe(3);
  act(() => result.current.tableProps.onPageChange(4));
  expect(calls[1]!.params.signal.aborted).toBe(true);
  await settle(calls[2]!, 61);
  await settle(calls[1]!, 41);
  expect(result.current.rows).toEqual([row(61)]);
  expect(result.current.error).toBeNull();
});

it('can show an uncached requested page without previous rows, retaining the known count', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() => useTableData({ getRows, initialPage: 2, keepPreviousData: false }));
  await settle(calls[0]!, 21);
  act(() => result.current.tableProps.onPageChange(3));
  expect(result.current.tableProps).toMatchObject({ rows: [], page: 3, pageSize: 20, rowCount: 95, loading: true });
  await settle(calls[1]!, 41);
  expect(result.current.rows).toEqual([row(41)]);
});

it('reports failures once, rolls sort back, and retries failed params even through a repeated page callback', async () => {
  const { calls, getRows } = endpoint();
  const onError = vi.fn();
  const { result, rerender } = renderHook(({ onError }) => useTableData({ getRows, onError, initialPage: 2 }), {
    initialProps: { onError },
  });
  await settle(calls[0]!, 21);
  const sort = { columnId: 'name', direction: 'ascending' as const };
  act(() => result.current.tableProps.onSortChange(sort));
  expect(result.current.tableProps.sort).toEqual(sort);
  const latestOnError = vi.fn();
  rerender({ onError: latestOnError });
  const failure = new Error('Unavailable');
  await act(async () => calls[1]!.reject(failure));
  expect(result.current).toMatchObject({ rows: [row(21)], error: failure, isFetching: false });
  expect(result.current.tableProps.sort).toBeNull();
  expect(onError).not.toHaveBeenCalled();
  expect(latestOnError).toHaveBeenCalledExactlyOnceWith(failure);
  expect(result.current.loadMoreProps.error).toBe('Unavailable');
  act(() => result.current.refetch());
  expect(calls[2]!.params).toMatchObject({ page: 1, sort });
  await act(async () => calls[2]!.reject(new Error('')));
  expect(result.current.loadMoreProps.error).toBe('Unable to load rows.');
  act(() => result.current.tableProps.onPageChange(1));
  expect(getRows).toHaveBeenCalledTimes(4);
  await settle(calls[3]!, 1);
  expect(result.current.error).toBeNull();
});

it('handles synchronous throws and abort rejections without reporting an abort as an error', async () => {
  const onError = vi.fn();
  const getRows = vi
    .fn<ReturnType<typeof endpoint>['getRows']>()
    .mockImplementationOnce(() => {
      throw new Error('Sync failure');
    })
    .mockRejectedValueOnce(new DOMException('Cancelled', 'AbortError'));
  const { result } = renderHook(() => useTableData({ getRows, onError }));
  expect(result.current.error).toEqual(new Error('Sync failure'));
  act(() => result.current.refetch());
  await act(async () => {});
  expect(result.current.error).toBeNull();
  expect(result.current.isFetching).toBe(false);
  expect(onError).toHaveBeenCalledTimes(1);
});

it('uses fresh cached pages, aborts outstanding work, and refreshes expired pages without loading placeholders', async () => {
  vi.useFakeTimers();
  try {
    const { calls, getRows } = endpoint();
    const { result } = renderHook(() =>
      useTableData({ getRows, initialPage: 2, cacheTime: 1000, keepPreviousData: false }),
    );
    await settle(calls[0]!, 21);
    act(() => result.current.tableProps.onPageChange(3));
    act(() => result.current.tableProps.onPageChange(2));
    expect(calls[1]!.params.signal.aborted).toBe(true);
    expect(getRows).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({ rows: [row(21)], isLoading: false, isFetching: false });
    await act(async () => calls[1]!.reject(new Error('Late failure')));
    expect(result.current.error).toBeNull();
    act(() => result.current.tableProps.onPageChange(4));
    await settle(calls[2]!, 61);
    act(() => vi.advanceTimersByTime(1001));
    act(() => result.current.tableProps.onPageChange(2));
    expect(getRows).toHaveBeenCalledTimes(4);
    expect(result.current).toMatchObject({ rows: [row(21)], isLoading: false, isFetching: true });
    await settle(calls[3]!, 22);
    expect(result.current.rows).toEqual([row(22)]);
    act(() => result.current.refetch());
    expect(getRows).toHaveBeenCalledTimes(5);
    await settle(calls[4]!, 23);
    act(() => result.current.invalidate());
    expect(getRows).toHaveBeenCalledTimes(6);
    await settle(calls[5]!, 24);
    act(() => result.current.tableProps.onPageChange(4));
    expect(getRows).toHaveBeenCalledTimes(7);
  } finally {
    vi.useRealTimers();
  }
});

it('disables caching with cacheTime zero and clears errors on a fresh cache hit', async () => {
  const { calls, getRows } = endpoint();
  const { result, rerender } = renderHook(({ cacheTime }) => useTableData({ getRows, cacheTime }), {
    initialProps: { cacheTime: 1000 },
  });
  await settle(calls[0]!, 1);
  act(() => result.current.tableProps.onPageChange(2));
  await act(async () => calls[1]!.reject(new Error('Failed')));
  act(() => result.current.tableProps.onPageChange(1));
  expect(getRows).toHaveBeenCalledTimes(2);
  expect(result.current.error).toBeNull();
  rerender({ cacheTime: 0 });
  act(() => result.current.tableProps.onPageChange(2));
  await settle(calls[2]!, 21);
  act(() => result.current.tableProps.onPageChange(1));
  expect(getRows).toHaveBeenCalledTimes(4);
});

it('compares filters by JSON value, resets the page and reads callback identities without refetching', async () => {
  const original = endpoint();
  const replacement = endpoint();
  const { result, rerender } = renderHook(
    ({ filters, getRows }) => useTableData({ getRows, filters, initialPage: 2 }),
    { initialProps: { filters: { status: 'failed' }, getRows: original.getRows } },
  );
  await settle(original.calls[0]!, 21);
  rerender({ filters: { status: 'failed' }, getRows: replacement.getRows });
  expect(replacement.getRows).not.toHaveBeenCalled();
  rerender({ filters: { status: 'running' }, getRows: replacement.getRows });
  expect(replacement.calls[0]!.params).toMatchObject({ page: 1, filters: { status: 'running' } });
  await settle(replacement.calls[0]!, 1);
  act(() => result.current.tableProps.onPageChange(2));
  expect(replacement.calls[1]!.params).toMatchObject({ page: 2, filters: { status: 'running' } });
});

it('resets saved-view filters to page one and handles a cleared sort through onQueryChange', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() =>
    useTableData({ getRows, initialPage: 2, initialSort: { columnId: 'name', direction: 'ascending' } }),
  );
  await settle(calls[0]!, 21);
  act(() =>
    result.current.tableProps.onQueryChange({
      page: 2,
      pageSize: 20,
      sort: null,
      filters: { status: 'running' },
      cause: 'view',
    }),
  );
  expect(calls[1]!.params).toMatchObject({ page: 1, sort: null, filters: { status: 'running' } });
});

it('revalidates in the foreground only, skipping an in-flight request', async () => {
  vi.useFakeTimers();
  try {
    const { calls, getRows } = endpoint();
    const { result } = renderHook(() => useTableData({ getRows, revalidateInterval: 1000 }));
    act(() => vi.advanceTimersByTime(2000));
    expect(getRows).toHaveBeenCalledTimes(1);
    await settle(calls[0]!, 1);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => vi.advanceTimersByTime(2000));
    expect(getRows).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(getRows).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
    act(() => vi.advanceTimersByTime(2000));
    expect(getRows).toHaveBeenCalledTimes(2);
  } finally {
    Reflect.deleteProperty(document, 'hidden');
    vi.useRealTimers();
  }
});

it('appends cursor pages atomically, retries the failed cursor, and reloads from the beginning on refetch', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() => useTableData({ getRows }));
  await act(async () => calls[0]!.resolve({ rows: [row(1)], nextCursor: 'c2' }));
  expect(result.current.hasMore).toBe(true);
  act(() => {
    result.current.loadMore();
    result.current.loadMore();
  });
  expect(getRows).toHaveBeenCalledTimes(2);
  expect(calls[1]!.params.cursor).toBe('c2');
  await act(async () => calls[1]!.reject(new Error('Try again')));
  expect(result.current.rows).toEqual([row(1)]);
  expect(result.current.lastAppend.seq).toBe(0);
  expect(result.current.loadMoreProps).toMatchObject({ loading: false, error: 'Try again', nextCursor: 'c2' });
  act(() => result.current.loadMoreProps.onRetry?.());
  expect(calls[2]!.params.cursor).toBe('c2');
  await act(async () => calls[2]!.resolve({ rows: [row(2)], nextCursor: null }));
  expect(result.current.rows).toEqual([row(1), row(2)]);
  expect(result.current.loadMoreProps).toMatchObject({
    loading: false,
    error: '',
    loadedCount: 2,
    lastAppend: { seq: 1, count: 1 },
  });
  expect(result.current.hasMore).toBe(false);
  act(() => result.current.loadMore());
  expect(getRows).toHaveBeenCalledTimes(3);
  act(() => result.current.refetch());
  expect(calls[3]!.params).toMatchObject({ page: 1, cursor: null });
  await act(async () => calls[3]!.resolve({ rows: [row(3)], nextCursor: '' }));
  expect(result.current.rows).toEqual([row(3)]);
  expect(result.current.hasMore).toBe(false);
  expect(result.current.lastAppend.seq).toBe(1);
});

it('revalidates an appended cursor segment without duplicating or dropping the prefix', async () => {
  vi.useFakeTimers();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  try {
    const { calls, getRows } = endpoint();
    const { result } = renderHook(() => useTableData({ getRows, cacheTime: 1000, revalidateInterval: 2000 }));
    await act(async () => calls[0]!.resolve({ rows: [row(1)], nextCursor: 'c2' }));
    act(() => result.current.loadMore());
    await act(async () => calls[1]!.resolve({ rows: [row(2)], nextCursor: 'c3' }));
    act(() => vi.advanceTimersByTime(2000));
    expect(calls[2]!.params.cursor).toBe('c2');
    await act(async () => calls[2]!.resolve({ rows: [row(3)], nextCursor: 'c3' }));
    expect(result.current.rows).toEqual([row(1), row(3)]);
    expect(result.current.lastAppend).toEqual({ seq: 1, count: 1 });
    act(() => result.current.loadMore());
    await act(async () => calls[3]!.resolve({ rows: [row(4)], nextCursor: null }));
    expect(result.current.rows).toEqual([row(1), row(3), row(4)]);
  } finally {
    Reflect.deleteProperty(document, 'hidden');
    vi.useRealTimers();
  }
});

it.each(['resolve', 'reject'] as const)(
  'aborts on unmount and ignores a late %s without an error callback',
  async (outcome) => {
    const { calls, getRows } = endpoint();
    const onError = vi.fn();
    const render = vi.fn();
    const { unmount } = renderHook(() => {
      render();
      return useTableData({ getRows, onError });
    });
    unmount();
    const renders = render.mock.calls.length;
    expect(calls[0]!.params.signal.aborted).toBe(true);
    await act(async () =>
      outcome === 'resolve' ? calls[0]!.resolve({ rows: [row(1)] }) : calls[0]!.reject(new Error('Late error')),
    );
    expect(render).toHaveBeenCalledTimes(renders);
    expect(onError).not.toHaveBeenCalled();
  },
);

it('survives StrictMode effect replay and disabling aborts work without leaving a loading state', async () => {
  const { calls, getRows } = endpoint();
  const { result, rerender } = renderHook(({ enabled }) => useTableData({ getRows, enabled }), {
    initialProps: { enabled: false },
    wrapper: StrictMode,
  });
  expect(getRows).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
  rerender({ enabled: true });
  expect(getRows).toHaveBeenCalledTimes(1);
  rerender({ enabled: false });
  expect(calls[0]!.params.signal.aborted).toBe(true);
  expect(result.current).toMatchObject({ isLoading: false, isFetching: false });
  await settle(calls[0]!, 1);
  expect(result.current.rows).toEqual([]);
  rerender({ enabled: true });
  await settle(calls[1]!, 2);
  expect(result.current.rows).toEqual([row(2)]);
});

it('applies only the surviving StrictMode mount request', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() => useTableData({ getRows }), { wrapper: StrictMode });
  expect(getRows).toHaveBeenCalledTimes(2);
  expect(calls[0]!.params.signal.aborted).toBe(true);
  await settle(calls[1]!, 2);
  await settle(calls[0]!, 1);
  expect(result.current.rows).toEqual([row(2)]);
});

it('never calls the endpoint or reads document while server rendering', () => {
  const { getRows } = endpoint();
  function ServerTable() {
    useTableData({ getRows, revalidateInterval: 1000 });
    return null;
  }
  const documentGetter = vi.spyOn(globalThis, 'document', 'get').mockImplementation(() => {
    throw new Error('No document in SSR');
  });
  try {
    expect(() => renderToString(<ServerTable />)).not.toThrow();
  } finally {
    documentGetter.mockRestore();
  }
  expect(getRows).not.toHaveBeenCalled();
});

it('resets to page one on every filter change, including a return to the original filters', async () => {
  const { calls, getRows } = endpoint();
  const { rerender } = renderHook(({ status }) => useTableData({ getRows, initialPage: 2, filters: { status } }), {
    initialProps: { status: 'failed' },
  });
  await settle(calls[0]!, 21);
  rerender({ status: 'running' });
  await settle(calls[1]!, 1);
  rerender({ status: 'failed' });
  expect(calls[2]!.params).toMatchObject({ page: 1, filters: { status: 'failed' } });
});

it('combines an expired cursor cache entry with the current prefix and revalidates without a second append', async () => {
  vi.useFakeTimers();
  try {
    const { calls, getRows } = endpoint();
    const { result } = renderHook(() => useTableData({ getRows, cacheTime: 1000 }));
    await act(async () => calls[0]!.resolve({ rows: [row(1)], nextCursor: 'c2' }));
    act(() => result.current.loadMore());
    await act(async () => calls[1]!.resolve({ rows: [row(2)], nextCursor: null }));
    act(() => result.current.refetch());
    await act(async () => calls[2]!.resolve({ rows: [row(9)], nextCursor: 'c2' }));
    act(() => vi.advanceTimersByTime(1001));
    act(() => result.current.loadMore());
    expect(result.current).toMatchObject({ rows: [row(9), row(2)], isLoading: false, isFetching: true });
    const seq = result.current.lastAppend.seq;
    await act(async () => calls[3]!.resolve({ rows: [row(3)], nextCursor: null }));
    expect(result.current.rows).toEqual([row(9), row(3)]);
    expect(result.current.lastAppend.seq).toBe(seq);
  } finally {
    vi.useRealTimers();
  }
});

it('invalidates all fresh pages and deduplicates only while a matching request is in flight', async () => {
  const { calls, getRows } = endpoint();
  const { result } = renderHook(() => useTableData({ getRows }));
  await settle(calls[0]!, 1);
  act(() => result.current.tableProps.onPageChange(2));
  act(() => result.current.tableProps.onPageChange(2));
  expect(getRows).toHaveBeenCalledTimes(2);
  await settle(calls[1]!, 21);
  act(() => result.current.invalidate());
  expect(getRows).toHaveBeenCalledTimes(3);
  await settle(calls[2]!, 22);
  act(() => result.current.tableProps.onPageChange(1));
  expect(getRows).toHaveBeenCalledTimes(4);
});

it.each(['resolve', 'reject'] as const)(
  'a late superseded %s cannot clear or replace the current failure',
  async (outcome) => {
    const { calls, getRows } = endpoint();
    const onError = vi.fn();
    const { result } = renderHook(() => useTableData({ getRows, onError, initialPage: 2 }));
    await settle(calls[0]!, 21);
    act(() => result.current.tableProps.onPageChange(3));
    act(() => result.current.tableProps.onPageChange(4));
    const failure = new Error('Current request failed');
    await act(async () => calls[2]!.reject(failure));
    await act(async () =>
      outcome === 'resolve'
        ? calls[1]!.resolve({ rows: [row(41)], rowCount: 95 })
        : calls[1]!.reject(new Error('Superseded')),
    );
    expect(result.current).toMatchObject({ rows: [row(21)], error: failure, isFetching: false });
    expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
  },
);
