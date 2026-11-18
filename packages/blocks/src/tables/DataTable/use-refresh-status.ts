import { useCallback, useEffect, useRef, useState } from 'react';

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
  const requested = useRef(false);
  const refreshingNow = useRef(false);
  const [announcing, setAnnouncing] = useState(false);

  useEffect(() => {
    refreshingNow.current = refreshing;
    const followsRequest = requested.current;
    // A skeleton cycle fulfils the pending request, so a later caller-only refresh stays silent.
    requested.current = false;
    setAnnouncing(refreshing && followsRequest);
  }, [refreshing, skeleton]);

  const markRequested = useCallback(() => {
    if (refreshingNow.current) setAnnouncing(true);
    else requested.current = true;
  }, []);

  return { skeleton, refreshing, announcing: refreshing && announcing, markRequested };
}
