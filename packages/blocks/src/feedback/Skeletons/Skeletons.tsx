import { Skeleton, cn, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

/** Varying bar widths so placeholder rows don't look stamped. */
const WIDTHS = ['w-3/5', 'w-2/5', 'w-4/5', 'w-1/2', 'w-2/3'] as const;
const width = (i: number) => WIDTHS[i % WIDTHS.length];

function LoadingRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  /** Screen-reader announcement. */
  label?: string;
  className?: string;
}

function TableSkeletonBody({ rows, columns }: { rows: number; columns: number }) {
  const middle = Math.max(columns - 2, 0);
  return (
    <>
      <div aria-hidden className="flex items-center gap-4 border-b border-border bg-secondary/40 px-4 py-2.5">
        <Skeleton className="h-2.5 w-1/4" />
        {Array.from({ length: middle }, (_, c) => (
          <Skeleton key={c} className="hidden h-2.5 w-14 sm:block" />
        ))}
        <Skeleton className="ms-auto h-2.5 w-10" />
      </div>
      <div aria-hidden className="divide-y divide-border">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            <div className="flex w-1/4 min-w-0 items-center gap-2.5">
              <Skeleton className="size-7 shrink-0 rounded-md" />
              <Skeleton className={cn('h-3', width(r))} />
            </div>
            {Array.from({ length: middle }, (_, c) =>
              c === 1 ? (
                <Skeleton key={c} className="hidden h-5 w-16 rounded-full sm:block" />
              ) : (
                <Skeleton key={c} className="hidden h-3 w-14 sm:block" />
              ),
            )}
            <Skeleton className="ms-auto h-3 w-10" />
          </div>
        ))}
      </div>
    </>
  );
}

const tableFrame = 'overflow-hidden rounded-lg border border-border bg-card';

/** Table placeholder: header strip plus rows with an avatar cell, text cells and a status pill. */
export function TableSkeleton({ rows = 5, columns = 5, label: labelProp, className }: TableSkeletonProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('loading.table');
  return (
    <LoadingRegion label={label} className={cn(tableFrame, className)}>
      <TableSkeletonBody rows={rows} columns={columns} />
    </LoadingRegion>
  );
}

export interface ListSkeletonProps {
  rows?: number;
  label?: string;
  className?: string;
}

/** List placeholder: avatar, two text lines, a pill and a row action. */
export function ListSkeleton({ rows = 4, label: labelProp, className }: ListSkeletonProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('loading.list');
  return (
    <LoadingRegion label={label} className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <ul aria-hidden className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton shape="circle" className="size-9" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={cn('h-3', width(i + 2))} />
              <Skeleton className="h-2.5 w-2/5" />
            </div>
            <Skeleton className="hidden h-5 w-14 rounded-full sm:block" />
            <Skeleton className="size-7 shrink-0 rounded-md" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}

export interface PageSkeletonProps {
  /** Number of stat cards. */
  stats?: number;
  /** Rows of the table under the stats. */
  rows?: number;
  label?: string;
  className?: string;
}

/** Whole-page placeholder: header (title, meta, actions), a stat row and a table. */
export function PageSkeleton({ stats = 4, rows = 5, label: labelProp, className }: PageSkeletonProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('loading.page');
  return (
    <LoadingRegion label={label} className={cn('space-y-6', className)}>
      <div aria-hidden className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      {stats > 0 && (
        <div aria-hidden className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-3.5 h-7 w-24" />
              <Skeleton className="mt-3 h-2.5 w-14" />
            </div>
          ))}
        </div>
      )}
      <div className={tableFrame}>
        <TableSkeletonBody rows={rows} columns={5} />
      </div>
    </LoadingRegion>
  );
}
