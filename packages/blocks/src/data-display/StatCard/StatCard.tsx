import { Activity, ArrowRight, type LucideIcon } from '@gntik-ai/icons';
import { Button, Card, cn, Link, Sparkline, Toggle, ToggleGroup, type SparklineTone } from '@gntik-ai/ui';
import { useState } from 'react';
import { TrendDelta, type KpiDelta } from '../shared/TrendDelta';
import { STAT_RANGES } from './fixtures';

export interface StatCardRange {
  /** Range key, e.g. "7d". */
  value: string;
  /** Toggle label. */
  label: string;
  /** Pre-formatted headline value for this range. */
  stat: string;
  delta?: KpiDelta;
  /** Series drawn under the value, oldest first. */
  series: readonly number[];
}

export interface StatCardProps {
  label?: string;
  /** Leading icon tile (a lucide icon). */
  icon?: LucideIcon;
  /** One entry per range; with a single entry the range toggle is hidden. */
  ranges?: readonly StatCardRange[];
  /** Initially selected range (uncontrolled). */
  defaultRange?: string;
  /** Selected range (controlled). */
  range?: string;
  onRangeChange?: (range: string) => void;
  /** `area` line (default) or daily `bar` shape. */
  chart?: 'area' | 'bar';
  tone?: SparklineTone;
  /** Footer link-style action ("View requests →"). */
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

/** A single rich stat: icon tile, label, value, delta, a range toggle and a trend chart, with a footer action. */
export function StatCard({
  label = 'Requests',
  icon: IconCmp = Activity,
  ranges = STAT_RANGES,
  defaultRange,
  range: rangeProp,
  onRangeChange,
  chart = 'area',
  tone = 'primary',
  action = { label: 'View requests' },
  className,
}: StatCardProps) {
  const [inner, setInner] = useState(defaultRange ?? ranges[0]?.value ?? '');
  const current = rangeProp ?? inner;
  const active = ranges.find((r) => r.value === current) ?? ranges[0];
  const select = (next: string) => {
    setInner(next);
    onRangeChange?.(next);
  };
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/14 text-primary-text">
              <IconCmp size={18} aria-hidden />
            </span>
            <h3 className="truncate text-[13px] font-medium text-muted-foreground">{label}</h3>
          </div>
          {ranges.length > 1 && (
            <ToggleGroup
              aria-label={`${label} range`}
              size="sm"
              value={[current]}
              onValueChange={(v) => {
                const next = v[0];
                if (next) select(next);
              }}
            >
              {ranges.map((r) => (
                <Toggle key={r.value} value={r.value} className="font-mono">
                  {r.label}
                </Toggle>
              ))}
            </ToggleGroup>
          )}
        </div>
        {active && (
          <>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1" aria-live="polite">
              <span className="text-[26px] font-semibold tracking-tight text-foreground tabular-nums">{active.stat}</span>
              {active.delta && <TrendDelta {...active.delta} />}
            </p>
            {active.delta?.note && <p className="mt-1 text-[12px] text-muted-foreground">{active.delta.note}</p>}
            <Sparkline
              data={active.series}
              label={`${label}, ${active.label}`}
              variant={chart === 'bar' ? 'bar' : 'line'}
              area={chart === 'area'}
              markers={chart === 'area' ? ['last'] : []}
              tone={tone}
              width={280}
              height={56}
              className="mt-4 block h-auto w-full"
            />
          </>
        )}
      </div>
      {action && (
        <div className="border-t border-border px-5 py-3">
          {action.href ? (
            <Link href={action.href} className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
              {action.label}
              <ArrowRight size={14} aria-hidden />
            </Link>
          ) : (
            <Button variant="ghost" size="sm" trailingIcon={ArrowRight} className="-mx-2 text-primary-text hover:text-primary-text" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
