import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { Ref } from 'react';
import { cn } from '../../utils/cn';
import { getPageRange } from './pageRange';
import { paginationVariants, type PaginationVariantProps } from './pagination.variants';

export interface PaginationLabels {
  /** Accessible name of the nav landmark. */
  nav?: string;
  previous?: string;
  next?: string;
  /** Accessible name of a page button. */
  page?: (page: number) => string;
}

const DEFAULT_LABELS: Required<PaginationLabels> = {
  nav: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (p) => `Page ${p}`,
};

interface ArrowsProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  labels: Required<PaginationLabels>;
  className: string;
  iconSize: number;
}

function PrevButton({ page, onPageChange, labels, className, iconSize }: Omit<ArrowsProps, 'pageCount'>) {
  return (
    <button type="button" className={className} aria-label={labels.previous} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      <ChevronLeft size={iconSize} aria-hidden />
    </button>
  );
}

function NextButton({ page, pageCount, onPageChange, labels, className, iconSize }: ArrowsProps) {
  return (
    <button type="button" className={className} aria-label={labels.next} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
      <ChevronRight size={iconSize} aria-hidden />
    </button>
  );
}

export interface PaginationProps extends PaginationVariantProps {
  /** Current page, 1-based. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the requested page (already clamped to 1…pageCount). */
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblingCount?: number;
  labels?: PaginationLabels;
  className?: string;
  ref?: Ref<HTMLElement>;
}

/**
 * Numbered pagination: previous/next arrows, first and last page, the pages around the current
 * one and ellipses in between. Page-size agnostic: it only knows `page` and `pageCount`.
 */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, size, labels, className, ref }: PaginationProps) {
  const s = paginationVariants({ size });
  const l = { ...DEFAULT_LABELS, ...labels };
  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), Math.max(1, pageCount));
    if (next !== page) onPageChange(next);
  };
  const iconSize = size === 'sm' ? 15 : 16;
  return (
    <nav ref={ref} aria-label={l.nav} className={cn(s.root(), className)}>
      <ul className={s.list()}>
        <li>
          <PrevButton page={page} onPageChange={go} labels={l} className={s.arrow()} iconSize={iconSize} />
        </li>
        {getPageRange(page, pageCount, siblingCount).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={s.page()}
                aria-label={l.page(item)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden className={s.ellipsis()}>
              <MoreHorizontal size={15} />
            </li>
          ),
        )}
        <li>
          <NextButton page={page} pageCount={pageCount} onPageChange={go} labels={l} className={s.arrow()} iconSize={iconSize} />
        </li>
      </ul>
    </nav>
  );
}

export interface PaginationCompactProps extends PaginationVariantProps {
  /** Current page, 1-based. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total number of rows. */
  total: number;
  onPageChange: (page: number) => void;
  /** Locale for number formatting. */
  locale?: string;
  /** Word between the range and the total ("1–10 of 97"). */
  ofLabel?: string;
  labels?: Pick<PaginationLabels, 'nav' | 'previous' | 'next'>;
  className?: string;
  ref?: Ref<HTMLElement>;
}

/** Compact pagination for table footers: "1–10 of 97" plus previous/next arrows. */
export function PaginationCompact({
  page,
  pageSize,
  total,
  onPageChange,
  locale = 'en-US',
  ofLabel = 'of',
  size,
  labels,
  className,
  ref,
}: PaginationCompactProps) {
  const s = paginationVariants({ size });
  const l = { ...DEFAULT_LABELS, ...labels };
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const fmt = (n: number) => n.toLocaleString(locale);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), pageCount));
  const iconSize = size === 'sm' ? 15 : 16;
  return (
    <nav ref={ref} aria-label={l.nav} className={cn(s.root(), 'gap-3', className)}>
      <p className={s.summary()} aria-live="polite">
        <span className={s.summaryValue()}>
          {fmt(from)}–{fmt(to)}
        </span>{' '}
        {ofLabel} <span className={s.summaryValue()}>{fmt(total)}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <PrevButton page={page} onPageChange={go} labels={l} className={s.arrow()} iconSize={iconSize} />
        <NextButton page={page} pageCount={pageCount} onPageChange={go} labels={l} className={s.arrow()} iconSize={iconSize} />
      </div>
    </nav>
  );
}
