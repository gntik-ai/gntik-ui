import type { ReactNode } from 'react';
import { cx } from './format';

/** Lifecycle of a chart's data. `ready` with no rows renders the empty state. */
export type ChartState = 'ready' | 'loading' | 'empty' | 'error';

/** State props shared by every chart. */
export interface ChartStateProps {
  /** Data lifecycle. Default `ready` (an empty `data` array still shows the empty state). */
  state?: ChartState;
  /** Message of the empty state. */
  emptyMessage?: ReactNode;
  /** Message of the error state. */
  errorMessage?: ReactNode;
  /** Shows a "Retry" button in the error state. */
  onRetry?: () => void;
  /** Renders a visually hidden data table (screen-reader fallback of the plotted values). */
  dataTable?: boolean;
}

const stateBox =
  'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 text-center';

export interface ChartEmptyProps {
  height?: number;
  children?: ReactNode;
  className?: string;
}

/** Placeholder for a chart without data. */
export function ChartEmpty({ height = 240, children = 'No data for this period', className }: ChartEmptyProps) {
  return (
    <div data-chart-state="empty" className={cx(stateBox, className)} style={{ height }}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-muted-foreground" strokeWidth={1.75}>
        <path d="M3 3v18h18" />
        <path d="M7 15h2M12 11h2M17 7h2" strokeLinecap="round" />
      </svg>
      <p className="text-[13px] text-muted-foreground">{children}</p>
    </div>
  );
}

export interface ChartLoadingProps {
  height?: number;
  /** Accessible label of the busy region. */
  label?: string;
  className?: string;
}

const SKELETON_BARS = [42, 64, 50, 78, 58, 88, 70, 54];

/** Skeleton plot (bars over a baseline); the pulse stops under prefers-reduced-motion. */
export function ChartLoading({ height = 240, label = 'Loading chart', className }: ChartLoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-chart-state="loading"
      className={cx('flex w-full items-end gap-2 border-b border-border px-2', className)}
      style={{ height }}
    >
      {SKELETON_BARS.map((h, i) => (
        <div
          key={i}
          aria-hidden
          className="flex-1 animate-pulse rounded-t-sm bg-muted motion-reduce:animate-none"
          style={{ height: `${h}%` }}
        />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export interface ChartErrorProps {
  height?: number;
  children?: ReactNode;
  onRetry?: () => void;
  className?: string;
}

/** Error placeholder with an optional retry action. */
export function ChartError({ height = 240, children = 'The chart could not be loaded.', onRetry, className }: ChartErrorProps) {
  return (
    <div role="alert" data-chart-state="error" className={cx(stateBox, 'border-destructive/40', className)} style={{ height }}>
      <p className="text-[13px] text-destructive-text">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-8 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/** Resolves the effective state: `ready` with no rows is `empty`. */
export function resolveState(state: ChartState | undefined, rows: number): ChartState {
  const s = state ?? 'ready';
  return s === 'ready' && rows === 0 ? 'empty' : s;
}

/** The placeholder for a non-ready state, or `null` when the chart should render. */
export function chartStateView(
  state: ChartState,
  {
    height,
    emptyMessage,
    errorMessage,
    onRetry,
  }: Pick<ChartStateProps, 'emptyMessage' | 'errorMessage' | 'onRetry'> & {
    height: number;
  },
): ReactNode {
  if (state === 'loading') return <ChartLoading height={height} />;
  if (state === 'empty') return <ChartEmpty height={height}>{emptyMessage}</ChartEmpty>;
  if (state === 'error')
    return (
      <ChartError height={height} onRetry={onRetry}>
        {errorMessage}
      </ChartError>
    );
  return null;
}

export interface ChartDataTableProps {
  caption: string;
  /** Column headers; the first column is the row header. */
  columns: readonly string[];
  rows: ReadonlyArray<readonly ReactNode[]>;
  /** Show the table instead of hiding it visually. */
  visible?: boolean;
}

/** Plain data table: a screen-reader fallback for a chart (visually hidden by default). */
export function ChartDataTable({ caption, columns, rows, visible = false }: ChartDataTableProps) {
  return (
    <table data-chart-table="" className={cx(visible ? 'mt-3 w-full text-[12px]' : 'sr-only')}>
      <caption className={visible ? 'mb-1 text-left text-muted-foreground' : undefined}>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} scope="col" className={visible ? 'text-left font-medium text-muted-foreground' : undefined}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) =>
              j === 0 ? (
                <th key={j} scope="row" className={visible ? 'text-left font-normal text-foreground' : undefined}>
                  {cell}
                </th>
              ) : (
                <td key={j} className={visible ? 'font-mono tabular-nums text-foreground' : undefined}>
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
