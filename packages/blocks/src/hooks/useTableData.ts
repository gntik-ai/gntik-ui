import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataTableProps, DataTableQuery } from '../tables/DataTable/DataTable';
import type { SortState } from '../tables/DataTable/data-table-utils';
import type { LoadMoreFooterProps } from '../tables/LoadMoreFooter/LoadMoreFooter';

/** One server query. Pages are 1-based; cursor is null for the first cursor page. */
export interface TableDataParams<F = unknown> {
  page: number;
  pageSize: number;
  sort: SortState | null;
  filters: F | undefined;
  cursor: string | null;
  signal: AbortSignal;
}

/** A numbered page supplies rowCount; a cursor page supplies nextCursor (null means exhausted). */
export interface TableDataResult<T> {
  rows: T[];
  rowCount?: number;
  nextCursor?: string | null;
}

/** Per-instance server data options. Filters must support JSON.stringify. */
export interface UseTableDataOptions<T, F = unknown> {
  getRows: (params: TableDataParams<F>) => Promise<TableDataResult<T>>;
  /** Initial numbered page, 1-based (default 1). */
  initialPage?: number;
  /** Rows per request (default 20). */
  initialPageSize?: number;
  /** Initial server order (default null). */
  initialSort?: SortState | null;
  /** Compared by JSON.stringify value, including object key order. */
  filters?: F;
  /** Freshness in milliseconds (30000); zero disables cache reads and writes. */
  cacheTime?: number;
  /** Retain the last resolved page while fetching (default true). */
  keepPreviousData?: boolean;
  /** Foreground polling in milliseconds (zero, the default, disables it). */
  revalidateInterval?: number;
  /** False aborts work and clears loading (default true). */
  enabled?: boolean;
  /** Called once for each current non-abort failure. */
  onError?: (error: unknown) => void;
}

type Query<F> = Omit<TableDataParams<F>, 'signal'>;
type TableProps<T> = Required<
  Pick<
    DataTableProps<T>,
    | 'rows'
    | 'paginationMode'
    | 'rowCount'
    | 'page'
    | 'pageSize'
    | 'onPageChange'
    | 'onPageSizeChange'
    | 'sort'
    | 'onSortChange'
    | 'onQueryChange'
    | 'manualSorting'
    | 'loading'
    | 'filters'
  >
> & { paginationMode: 'server' };
interface Snapshot<T> {
  rows: T[];
  rowCount: number;
  nextCursor: string | null | undefined;
  page: number;
  pageSize: number;
  sort: SortState | null;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  lastAppend: { seq: number; count: number };
}

/** Data and props for a server DataTable; params describes the requested page, including while old rows remain. */
export interface UseTableDataResult<T, F = unknown> extends Snapshot<T> {
  /** Requested values; the AbortSignal is passed only to getRows. */
  params: Query<F>;
  tableProps: TableProps<T>;
  loadMoreProps: LoadMoreFooterProps;
  hasMore: boolean;
  /** Append the next cursor page, ignoring calls during active work or after exhaustion. */
  loadMore: () => void;
  /** Bypass cache freshness; cursor lists restart at the first page. */
  refetch: () => void;
  /** Clear this instance's cache and refetch. */
  invalidate: () => void;
}

/**
 * Map committed table queries to abortable requests. Callback identities do not trigger requests.
 * Spread tableProps into DataTable; use paginated={false} and loadMoreProps for cursor lists.
 * Available from the npm package only (not the copy-install registry).
 */
export function useTableData<T, F = unknown>(options: UseTableDataOptions<T, F>): UseTableDataResult<T, F> {
  const { enabled = true } = options;
  const filtersKey = JSON.stringify(options.filters);
  const [request, setRequest] = useState(() => ({
    query: {
      page: options.initialPage ?? 1,
      pageSize: options.initialPageSize ?? 20,
      sort: options.initialSort ?? null,
      filters: options.filters,
      cursor: null as string | null,
    },
    filtersKey,
    revision: 0,
    force: false,
    prefix: [] as T[],
  }));
  // Remember each external filter value, including a return to the initial value.
  // React retries this render before committing effects, so no request starts here.
  if (request.filtersKey !== filtersKey) {
    setRequest({
      ...request,
      filtersKey,
      force: false,
      prefix: [],
      revision: request.revision + 1,
      query: { ...request.query, page: 1, cursor: null, filters: options.filters },
    });
  }
  const params: Query<F> = request.query;
  const key = JSON.stringify(params);
  const [snapshot, setSnapshot] = useState<Snapshot<T>>(() => ({
    rows: [],
    rowCount: 0,
    nextCursor: undefined,
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    isLoading: enabled,
    isFetching: false,
    error: null,
    lastAppend: { seq: 0, count: 0 },
  }));
  const data = useRef(snapshot);
  const resolved = useRef(snapshot);
  const prefix = request.prefix;
  const latest = useRef({ options, params, key, prefix });
  useEffect(() => {
    latest.current = { options, params, key, prefix };
  });
  const cache = useRef(new Map<string, { value: Snapshot<T>; pageRows: T[]; at: number }>());
  const active = useRef<{ key: string; controller: AbortController } | null>(null);
  const mounted = useRef(false);
  const confirmedSort = useRef(params.sort);
  const hasData = useRef(false);
  const publish = useCallback((next: Snapshot<T>) => {
    data.current = next;
    setSnapshot(next);
  }, []);
  const abort = useCallback(() => {
    active.current?.controller.abort();
    active.current = null;
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort();
    };
  }, [abort]);
  const start = useCallback(
    (force = false, background = false) => {
      const { options: current, params: query, key: queryKey, prefix: previousRows } = latest.current;
      if (current.enabled === false) {
        abort();
        publish({ ...data.current, isLoading: false, isFetching: false });
        return;
      }
      if (active.current?.key === queryKey) return;
      abort();
      const cacheTime = current.cacheTime ?? 30000;
      const cached = cacheTime > 0 ? cache.current.get(queryKey) : undefined;
      if (cached && !force) {
        confirmedSort.current = cached.value.sort;
        hasData.current = true;
        const appended = query.cursor !== null;
        resolved.current = {
          ...cached.value,
          // Cache the segment separately: a first-page refetch can change its prefix.
          rows: appended ? [...previousRows, ...cached.pageRows] : cached.pageRows,
          lastAppend:
            appended && !background
              ? { seq: data.current.lastAppend.seq + 1, count: cached.pageRows.length }
              : data.current.lastAppend,
        };
        publish(resolved.current);
        if (Date.now() - cached.at < cacheTime) return;
      }
      const attempt = { key: queryKey, controller: new AbortController() };
      active.current = attempt;
      const keep = query.cursor !== null || background || current.keepPreviousData !== false || Boolean(cached);
      publish({
        ...data.current,
        ...(keep ? {} : { rows: [], page: query.page, pageSize: query.pageSize }),
        sort: query.sort,
        isLoading: !keep || !hasData.current,
        isFetching: true,
      });
      const valid = () => mounted.current && active.current === attempt && !attempt.controller.signal.aborted;
      const fail = (error: unknown) => {
        if (!valid()) return;
        active.current = null;
        cache.current.delete(queryKey);
        const aborted = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
        publish({
          ...data.current,
          rows: resolved.current.rows,
          page: resolved.current.page,
          pageSize: resolved.current.pageSize,
          sort: confirmedSort.current,
          isLoading: false,
          isFetching: false,
          error: aborted ? null : error,
        });
        if (!aborted) latest.current.options.onError?.(error);
      };
      try {
        Promise.resolve(current.getRows({ ...query, signal: attempt.controller.signal })).then((result) => {
          if (!valid()) return;
          active.current = null;
          confirmedSort.current = query.sort;
          hasData.current = true;
          const appended = query.cursor !== null;
          const next = {
            ...data.current,
            rows: appended ? [...previousRows, ...result.rows] : result.rows,
            rowCount: result.rowCount ?? data.current.rowCount,
            nextCursor: result.nextCursor,
            page: query.page,
            pageSize: query.pageSize,
            sort: query.sort,
            lastAppend:
              appended && !background && (!cached || force)
                ? { seq: data.current.lastAppend.seq + 1, count: result.rows.length }
                : data.current.lastAppend,
            isLoading: false,
            isFetching: false,
            error: null,
          };
          if (cacheTime > 0) cache.current.set(queryKey, { value: next, pageRows: result.rows, at: Date.now() });
          resolved.current = next;
          publish(next);
        }, fail);
      } catch (error) {
        fail(error);
      }
    },
    [abort, publish],
  );
  useEffect(() => {
    start(request.force);
  }, [key, request.revision, request.force, enabled, start]);

  const interval = options.revalidateInterval ?? 0;
  useEffect(() => {
    if (!enabled || interval <= 0) return;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!active.current) start(true, true);
    }, interval);
    return () => clearInterval(timer);
  }, [enabled, interval, start]);

  const change = (update: Partial<Query<F>>, force = false, prefix: T[] = []) =>
    setRequest((before) => ({
      ...before,
      filtersKey,
      force,
      prefix,
      revision: before.revision + 1,
      query: {
        ...(before.filtersKey === filtersKey ? before.query : { ...before.query, page: 1, filters: options.filters }),
        cursor: null,
        ...update,
      },
    }));
  const onQueryChange = (query: DataTableQuery) =>
    change({
      page:
        query.cause === 'sort' ||
        query.cause === 'pageSize' ||
        (query.cause === 'view' &&
          (JSON.stringify(query.sort) !== JSON.stringify(params.sort) ||
            JSON.stringify(query.filters) !== JSON.stringify(params.filters)))
          ? 1
          : query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      ...(query.cause === 'view' ? { filters: query.filters as F } : {}),
    });
  const refetch = () => change(params.cursor === null ? {} : { page: 1 }, true);
  const retry = () => change(params, true, prefix);
  const invalidate = () => {
    cache.current.clear();
    refetch();
  };
  const loadMore = () => {
    if (active.current || !snapshot.nextCursor || !enabled) return;
    change({ page: params.page + 1, cursor: snapshot.nextCursor }, false, snapshot.rows);
  };
  const hasMore = Boolean(snapshot.nextCursor);
  return {
    ...snapshot,
    params,
    hasMore,
    loadMore,
    refetch,
    invalidate,
    tableProps: {
      rows: snapshot.rows,
      paginationMode: 'server',
      rowCount: snapshot.rowCount,
      page: snapshot.page,
      pageSize: snapshot.pageSize,
      sort: snapshot.sort,
      manualSorting: true,
      loading: snapshot.isLoading,
      filters: params.filters,
      onPageChange: (page) => change({ page }),
      onPageSizeChange: (pageSize) => change({ page: 1, pageSize }),
      onSortChange: (sort) => change({ page: 1, sort }),
      onQueryChange,
    },
    loadMoreProps: {
      onLoadMore: loadMore,
      onRetry: retry,
      error:
        snapshot.error == null
          ? ''
          : snapshot.error instanceof Error && snapshot.error.message
            ? snapshot.error.message
            : 'Unable to load rows.',
      nextCursor: snapshot.nextCursor,
      hasMore,
      loading: snapshot.isFetching,
      loadedCount: snapshot.rows.length,
      lastAppend: snapshot.lastAppend,
    },
  };
}
