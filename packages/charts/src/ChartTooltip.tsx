import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { formatAny, identity, type ValueFormatter } from './format';

/** The subset of a Recharts tooltip payload entry the brand tooltip reads. */
export interface ChartTooltipEntry {
  name?: string | number;
  value?: unknown;
  color?: string;
  fill?: string;
  payload?: unknown;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<ChartTooltipEntry>;
  label?: string | number;
  valueFormatter?: ValueFormatter;
  /** Per-series formatter; wins over `valueFormatter` (used by ComboChart). */
  seriesFormatter?: (value: unknown, name: string) => string;
  labelFormatter?: (label: string | number) => ReactNode;
}

function swatchOf(entry: ChartTooltipEntry): string | undefined {
  if (entry.color) return entry.color;
  if (entry.fill) return entry.fill;
  const inner = entry.payload;
  if (inner && typeof inner === 'object' && 'fill' in inner) {
    const fill = (inner as { fill?: unknown }).fill;
    return typeof fill === 'string' ? fill : undefined;
  }
  return undefined;
}

/** Brand tooltip card: label header + one row per series, values in mono. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = identity,
  seriesFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const rows = payload.filter((p) => p.value != null);
  return (
    <div className="min-w-[150px] rounded-md border border-border bg-popover px-3 py-2.5 font-sans shadow-md">
      {label != null && label !== '' && (
        <div className="mb-2 border-b border-border pb-2 text-[11px] font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {rows.map((p, i) => {
          const name = p.name == null ? '' : String(p.name);
          return (
            <div key={`${name}-${i}`} className="flex items-center justify-between gap-5">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: swatchOf(p) }}
                />
                <span className="truncate text-[12px] text-muted-foreground">{name}</span>
              </span>
              <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground">
                {seriesFormatter ? seriesFormatter(p.value, name) : formatAny(p.value, valueFormatter)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Adapts Recharts 3 `<Tooltip content>` to the brand tooltip: `content={tooltipContent({ valueFormatter })}`. */
export function tooltipContent(options: Omit<ChartTooltipProps, 'active' | 'payload' | 'label'>) {
  return function BrandTooltipContent(p: TooltipContentProps) {
    return <ChartTooltip active={p.active} payload={p.payload} label={p.label} {...options} />;
  };
}
