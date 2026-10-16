import { Children, isValidElement, useCallback, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { SimpleSelect } from '../Select';
import { cursorPaginationVariants } from './cursor-pagination.variants';

const s = cursorPaginationVariants();

export interface CursorPaginationLabels {
  previous?: string;
  next?: string;
  navLabel?: string;
  shownSummary?: (shownCount: number) => string;
  totalSummary?: (total: number) => string;
  rowsPerPage?: string;
  rowsPerPageLabel?: string;
}

interface CursorPaginationBaseProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
  busy?: boolean;
  /** Null keeps the summary visible while busy; omitted uses the catalog loading label. */
  loadingLabel?: string | null;
  unavailableBehaviour?: 'disabled' | 'hidden';
  previousLabel?: string;
  nextLabel?: string;
  ariaLabel?: string;
  labels?: CursorPaginationLabels;
  className?: string;
}

/** Supply a plain-text summary (including null) or the response count with both count labels. */
export type CursorPaginationProps = CursorPaginationBaseProps &
  (
    | { summary: ReactNode; shownCount?: number; total?: number | null }
    | {
        summary?: undefined;
        shownCount: number;
        total?: number | null;
        labels: CursorPaginationLabels & Required<Pick<CursorPaginationLabels, 'shownSummary' | 'totalSummary'>>;
      }
  ) &
  (
    | { pageSizeOptions?: undefined; pageSize?: number; onPageSizeChange?: (pageSize: number) => void }
    | {
        pageSizeOptions: readonly number[];
        pageSize: number;
        onPageSizeChange: (pageSize: number) => void;
        labels: CursorPaginationLabels & Required<Pick<CursorPaginationLabels, 'rowsPerPage' | 'rowsPerPageLabel'>>;
      }
  );

/** Stateless navigation: the consumer owns all cursors and request state. */
export function CursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  loading = false,
  busy = false,
  loadingLabel,
  unavailableBehaviour = 'disabled',
  summary,
  shownCount,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  previousLabel,
  nextLabel,
  ariaLabel,
  labels,
  className,
}: CursorPaginationProps) {
  const { t } = useI18n();
  const isBusy = loading || busy;
  const showPrevious = hasPrevious || unavailableBehaviour === 'disabled';
  const showNext = hasNext || unavailableBehaviour === 'disabled';
  const root = useRef<HTMLElement>(null);
  const removedFocusRef = useRef(false);
  const [previous, previousRef] = useControlRef(removedFocusRef);
  const [next, nextRef] = useControlRef(removedFocusRef);
  const [select, selectRef] = useControlRef(removedFocusRef);
  useLayoutEffect(() => {
    if (!removedFocusRef.current) return;
    removedFocusRef.current = false;
    (next.current ?? previous.current ?? select.current ?? root.current)?.focus();
  });
  const summaryText =
    summary !== undefined
      ? plainText(summary)
      : typeof total === 'number' && total > 0
        ? (labels?.totalSummary?.(total) ?? '')
        : (labels?.shownSummary?.(shownCount ?? 0) ?? '');
  const status = isBusy && loadingLabel !== null ? (loadingLabel ?? t('common.loading')) : summaryText;
  return (
    <nav
      ref={root}
      tabIndex={-1}
      aria-label={ariaLabel ?? labels?.navLabel ?? t('pagination.label')}
      className={cn(s.root(), className)}
    >
      {pageSizeOptions !== undefined && (
        <div className={s.selectGroup()}>
          <span className={s.selectLabel()} aria-hidden>
            {labels?.rowsPerPage}
          </span>
          <SimpleSelect
            triggerRef={selectRef}
            aria-label={labels?.rowsPerPageLabel}
            size="sm"
            className={s.select()}
            value={String(pageSize)}
            onValueChange={(value) => {
              if (value !== null) onPageSizeChange?.(Number(value));
            }}
            items={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
      )}
      <div className={s.controls()}>
        {showPrevious && (
          <Button
            ref={previousRef}
            variant="secondary"
            size="sm"
            disabled={!hasPrevious || isBusy}
            focusableWhenDisabled
            aria-busy={isBusy || undefined}
            onClick={() => onPrevious()}
          >
            {previousLabel ?? labels?.previous ?? t('pagination.previous')}
          </Button>
        )}
        <p role="status" aria-live="polite" aria-atomic="true" className={s.status()}>
          {status}
        </p>
        {showNext && (
          <Button
            ref={nextRef}
            variant="secondary"
            size="sm"
            disabled={!hasNext || isBusy}
            focusableWhenDisabled
            aria-busy={isBusy || undefined}
            onClick={() => onNext()}
          >
            {nextLabel ?? labels?.next ?? t('pagination.next')}
          </Button>
        )}
      </div>
    </nav>
  );
}

/** Ref detachment runs before removal, while the focused element still exists. */
function useControlRef(removedFocusRef: RefObject<boolean>) {
  const current = useRef<HTMLButtonElement | null>(null);
  const ref = useCallback(
    (node: HTMLButtonElement | null) => {
      const control = current.current;
      const popupId = control?.getAttribute('aria-controls');
      const popup = popupId ? control?.ownerDocument.getElementById(popupId) : null;
      const active = control?.ownerDocument.activeElement;
      if (!node && (control?.contains(active ?? null) || popup?.contains(active ?? null))) {
        removedFocusRef.current = true;
      }
      current.current = node;
    },
    [removedFocusRef],
  );
  return [current, ref] as const;
}

/** Flatten plain text nodes to one text value, so a changed commit writes to the region once. */
function plainText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      return isValidElement<{ children?: ReactNode }>(child) ? plainText(child.props.children) : '';
    })
    .join('');
}
