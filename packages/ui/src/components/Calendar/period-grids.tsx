import type { KeyboardEvent } from 'react';
import {
  addDays,
  addMonths,
  endOfWeek,
  formatDayLabel,
  formatPeriodValue,
  isoWeek,
  monthWeeks,
  startOfWeek,
  toISODate,
  weekdayNames,
  type PeriodGranularity,
} from './calendar-utils';
import { periodGridVariants } from './period-grids.variants';

const s = periodGridVariants();

export interface PeriodGridProps {
  focused: Date;
  labelId: string;
  locale: string;
  label?: (date: Date) => string;
  accessibleLabel?: (date: Date) => string;
  isCurrent?: (date: Date) => boolean;
  weekLabel?: (date: Date) => string;
  onFocus: (date: Date) => void;
  onSelect: (date: Date) => void;
  onMove: (date: Date) => void;
  onPreview?: (date: Date | null) => void;
  isInRange?: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  isSelected: (date: Date) => boolean;
}

/** Shared internal month grid. Intentionally not exported from the package barrel. */
export function MonthGrid(props: PeriodGridProps) {
  const { focused, locale, labelId } = props;
  const rows = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => new Date(focused.getFullYear(), row * 3 + col, 1)),
  );
  return (
    <PeriodGrid
      {...props}
      rows={rows}
      granularity="month"
      label={(date) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)}
      labelId={labelId}
    />
  );
}

export function QuarterGrid(props: PeriodGridProps) {
  const rows = [Array.from({ length: 4 }, (_, quarter) => new Date(props.focused.getFullYear(), quarter * 3, 1))];
  return <PeriodGrid {...props} rows={rows} granularity="quarter" label={props.label ?? String} />;
}

/** Pages are anchored at 2020, matching the documented 2020–2031 page. */
export const yearPageStart = (year: number) => 2020 + Math.floor((year - 2020) / 12) * 12;

export function YearGrid(props: PeriodGridProps) {
  const first = yearPageStart(props.focused.getFullYear());
  const rows = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => new Date(first + row * 3 + col, 0, 1)),
  );
  return (
    <PeriodGrid
      {...props}
      rows={rows}
      granularity="year"
      label={(date) => new Intl.DateTimeFormat(props.locale, { year: 'numeric' }).format(date)}
    />
  );
}

export const periodCellKey = (date: Date, view: PeriodGranularity) =>
  view === 'week' ? toISODate(date) : formatPeriodValue(date, view);

export function WeekGrid(props: PeriodGridProps) {
  return (
    <PeriodGrid
      {...props}
      rows={monthWeeks(props.focused, 1)}
      granularity="week"
      label={(date) => String(date.getDate())}
    />
  );
}

function PeriodGrid({
  rows,
  granularity,
  label,
  ...props
}: PeriodGridProps & {
  rows: Date[][];
  granularity: PeriodGranularity;
  label: (date: Date) => string;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
    if (granularity === 'week') {
      const moves: Record<string, () => Date> = {
        ArrowLeft: () => addDays(date, -rtl),
        ArrowRight: () => addDays(date, rtl),
        ArrowUp: () => addDays(date, -7),
        ArrowDown: () => addDays(date, 7),
        Home: () => startOfWeek(date, 1),
        End: () => endOfWeek(date, 1),
        PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
        PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        props.onMove(move());
      }
      return;
    }
    const columns = granularity === 'quarter' ? 4 : 3;
    const step = granularity === 'year' ? 12 : granularity === 'quarter' ? 3 : 1;
    const col =
      granularity === 'year'
        ? (date.getFullYear() - yearPageStart(date.getFullYear())) % columns
        : Math.floor(date.getMonth() / step) % columns;
    const page = granularity === 'year' ? 144 : 12;
    const moves: Record<string, number> = {
      ArrowLeft: -rtl * step,
      ArrowRight: rtl * step,
      ArrowUp: -columns * step,
      ArrowDown: columns * step,
      Home: -col * step,
      End: (columns - 1 - col) * step,
      PageUp: -page,
      PageDown: page,
    };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    props.onMove(addMonths(date, delta));
  };
  return (
    <table
      onMouseLeave={() => props.onPreview?.(null)}
      role="grid"
      aria-labelledby={props.labelId}
      className={s.grid()}
    >
      {granularity === 'week' && (
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">{props.weekLabel?.(props.focused)}</span>
            </th>
            {weekdayNames(props.locale, 1).map((day) => (
              <th scope="col" key={day.long} className="text-[11px] font-normal text-muted-foreground">
                <abbr title={day.long} className="no-underline">
                  {day.narrow}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {granularity === 'week' && row[0] && (
              <th
                scope="row"
                aria-label={props.weekLabel?.(row[0])}
                className="px-1 text-[11px] font-normal text-muted-foreground"
              >
                {isoWeek(row[0]).week}
              </th>
            )}
            {row.map((date) => {
              const key = periodCellKey(date, granularity);
              const selected = props.isSelected(date);
              return (
                <td
                  role="gridcell"
                  key={key}
                  aria-selected={selected}
                  data-in-range={props.isInRange?.(date) || undefined}
                  className={s.cell()}
                >
                  <button
                    type="button"
                    data-period={key}
                    data-selected={selected || undefined}
                    aria-current={props.isCurrent?.(date) ? 'date' : undefined}
                    aria-label={
                      props.accessibleLabel?.(date) ??
                      (granularity === 'week' ? formatDayLabel(date, props.locale) : undefined)
                    }
                    aria-disabled={props.isDisabled(date) || undefined}
                    tabIndex={periodCellKey(props.focused, granularity) === key ? 0 : -1}
                    className={s.period()}
                    onMouseEnter={() => props.onPreview?.(date)}
                    onKeyDown={(event) => onKeyDown(event, date)}
                    onFocus={() => props.onFocus(date)}
                    onClick={() => props.onSelect(date)}
                  >
                    {label(date)}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
