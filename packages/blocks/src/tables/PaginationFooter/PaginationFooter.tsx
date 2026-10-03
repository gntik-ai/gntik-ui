import { cn, Pagination, SimpleSelect } from '@gntik-ai/ui';
import { useState } from 'react';

export interface PaginationFooterProps {
  /** Total number of rows. */
  total?: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page (controlled). */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  /** What the rows are, for the accessible names ("Deployments"). */
  noun?: string;
  locale?: string;
  className?: string;
}

/** Table footer: rows-per-page Select, a "1–10 of 97" summary and numbered Pagination. Stacks on small screens. */
export function PaginationFooter({
  total = 97,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize: sizeProp,
  defaultPageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  noun = 'Rows',
  locale = 'en-US',
  className,
}: PaginationFooterProps) {
  const [innerPage, setInnerPage] = useState(defaultPage);
  const [innerSize, setInnerSize] = useState(defaultPageSize);
  const pageSize = sizeProp ?? innerSize;
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const page = Math.min(Math.max(1, pageProp ?? innerPage), pageCount);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const fmt = (n: number) => n.toLocaleString(locale);

  const goTo = (next: number) => {
    setInnerPage(next);
    onPageChange?.(next);
  };
  const resize = (value: string | null) => {
    const next = Number(value);
    if (!next || next === pageSize) return;
    setInnerSize(next);
    onPageSizeChange?.(next);
    // Keep the first visible row on screen.
    const nextPage = Math.floor((from - 1) / next) + 1;
    if (nextPage !== page) goTo(Math.max(1, nextPage));
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-2.5">
        <span className="text-[12.5px] text-muted-foreground" aria-hidden>
          Rows per page
        </span>
        <SimpleSelect
          aria-label="Rows per page"
          size="sm"
          className="w-[76px] font-mono"
          value={String(pageSize)}
          onValueChange={resize}
          items={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-[12.5px] text-muted-foreground tabular-nums" aria-live="polite">
          <span className="font-mono text-foreground">
            {fmt(from)}–{fmt(to)}
          </span>{' '}
          of <span className="font-mono text-foreground">{fmt(total)}</span>
        </p>
        <Pagination page={page} pageCount={pageCount} onPageChange={goTo} size="sm" labels={{ nav: `${noun} pagination` }} />
      </div>
    </div>
  );
}
