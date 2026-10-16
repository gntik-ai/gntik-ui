import { Button, LiveAnnouncer, cn, useHasLiveAnnouncer, useI18n } from '@gntik-ai/ui';
import { useId } from 'react';
import { ErrorPanel } from '../../feedback/ErrorPanel/ErrorPanel';
import { useLoadMoreFooter, useLoadMoreAnnouncements } from './useLoadMoreFooter';
import { LOAD_MORE_PREVIEW } from './fixtures';

export interface LoadMoreFooterLabels {
  loadMore: string;
  loading: string;
  retry: string;
  group: string;
  moreAvailable: string;
  summary: (count: number) => string;
  loadedAnnouncement: (count: number) => string;
}

/**
 * Each attempt must settle in one update: loading=false together with its result
 * (error, or an empty error on success). Split settles are unsupported.
 */
export interface LoadMoreFooterProps {
  /** Undefined selects flag mode; null or an empty string exhausts cursor mode. */
  nextCursor?: string | null;
  hasMore?: boolean;
  loading?: boolean;
  error?: string;
  onLoadMore?: (cursor?: string) => void;
  onRetry?: (cursor?: string) => void;
  loadedCount?: number;
  /** Increasing sequence for successful appends only; leave unchanged on replacement or failure. */
  lastAppend?: { seq: number; count: number };
  exhaustedFocusTarget?: 'summary' | 'root';
  labels?: Partial<LoadMoreFooterLabels>;
  className?: string;
}

/** Load more for appended lists without a total or page count. The consumer owns rows and requests. */
export function LoadMoreFooter(props: LoadMoreFooterProps = {}) {
  const hasAnnouncer = useHasLiveAnnouncer();
  return hasAnnouncer ? (
    <LoadMoreFooterContent {...props} />
  ) : (
    <LiveAnnouncer>
      <LoadMoreFooterContent {...props} />
    </LiveAnnouncer>
  );
}

function LoadMoreFooterContent(props: LoadMoreFooterProps) {
  const { t } = useI18n();
  const {
    nextCursor,
    hasMore,
    loading = false,
    error = '',
    exhaustedFocusTarget = 'summary',
    loadedCount = LOAD_MORE_PREVIEW.loadedCount,
    labels,
    className,
  } = props;
  // Only the no-input preview uses a fixture cursor. Explicit undefined remains flag mode.
  const cursor = Object.keys(props).length === 0 ? LOAD_MORE_PREVIEW.nextCursor : nextCursor;
  const available =
    cursor === undefined ? hasMore === true : typeof cursor === 'string' && cursor.length > 0 && hasMore !== false;
  const failed = error.length > 0;
  const cursorMode = cursor !== undefined;
  const panel = cursorMode && failed;
  const control = !available ? 'none' : panel ? 'retry' : 'button';
  const { rootRef, summaryRef, controlRef, inFlightCursorRef } = useLoadMoreFooter(control, exhaustedFocusTarget);
  const errorId = useId();
  useLoadMoreAnnouncements(
    loading,
    error,
    props.lastAppend,
    labels?.loadedAnnouncement ?? ((count) => t('table.loadedAnnouncement', { count })),
  );
  const load = () => {
    if (loading || !available) return;
    inFlightCursorRef.current = cursor ?? undefined;
    if (cursor === undefined) props.onLoadMore?.();
    else props.onLoadMore?.(cursor ?? undefined);
  };
  const retry = () => {
    if (loading || !available) return;
    const handler = props.onRetry ?? props.onLoadMore;
    if (cursorMode) handler?.(inFlightCursorRef.current ?? cursor ?? undefined);
    else handler?.();
  };
  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={labels?.group ?? t('table.loadMoreGroup')}
      tabIndex={-1}
      aria-busy={loading}
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <p ref={summaryRef} tabIndex={-1} className="text-sm text-muted-foreground tabular-nums">
        {labels?.summary?.(loadedCount) ?? t('table.loadedSummary', { count: loadedCount })}{' '}
        {available && <span>{labels?.moreAvailable ?? t('table.moreAvailable')}</span>}
      </p>
      {panel ? (
        <div key={available ? 'retry' : 'exhausted'} ref={available ? controlRef : undefined}>
          <ErrorPanel
            title={error}
            message={null}
            code={null}
            requestId=""
            details=""
            secondaryAction={null}
            onRetry={available ? retry : undefined}
            retrying={loading}
            retryLabel={labels?.retry ?? t('error.retry')}
          />
        </div>
      ) : (
        <>
          {failed && (
            <p id={errorId} className="text-sm text-destructive-text">
              {error}
            </p>
          )}
          {available && (
            <Button
              ref={controlRef}
              loading={loading}
              onClick={failed ? retry : load}
              aria-describedby={failed ? errorId : undefined}
            >
              {loading
                ? (labels?.loading ?? t('table.loadingMore'))
                : failed
                  ? (labels?.retry ?? t('error.retry'))
                  : (labels?.loadMore ?? t('table.loadMore'))}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
