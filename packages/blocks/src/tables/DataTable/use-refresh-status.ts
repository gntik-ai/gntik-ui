import { useCallback, useEffect, useRef, useState } from 'react';

/** A request the table emitted counts toward the next refresh only for this long. */
const REQUEST_WINDOW_MS = 5000;

export interface RefreshStatus {
  /** Skeleton rows: `loading` true, or `'refresh'` with nothing to keep. */
  skeleton: boolean;
  /** Rows stay on screen while the next data loads. */
  refreshing: boolean;
  /** The updating status is spoken: the refresh follows a request the table emitted. */
  announcing: boolean;
  /** Records a page, page-size, sort, filter or view request the table just emitted. */
  markRequested: () => void;
}

/** Normalises `loading` and decides whether a refresh is announced. */
export function useRefreshStatus(loading: boolean | 'refresh', hasRows: boolean): RefreshStatus {
  const skeleton = loading === true || (loading === 'refresh' && !hasRows);
  const refreshing = loading === 'refresh' && !skeleton;
  const requestedAt = useRef<number | null>(null);
  const refreshingNow = useRef(false);
  const [announcing, setAnnouncing] = useState(false);

  useEffect(() => {
    refreshingNow.current = refreshing;
    const requested = requestedAt.current;
    requestedAt.current = null;
    setAnnouncing(refreshing && requested != null && Date.now() - requested <= REQUEST_WINDOW_MS);
  }, [refreshing]);

  const markRequested = useCallback(() => {
    if (refreshingNow.current) setAnnouncing(true);
    else requestedAt.current = Date.now();
  }, []);

  return { skeleton, refreshing, announcing: refreshing && announcing, markRequested };
}
