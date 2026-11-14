import { Field } from '@base-ui/react/field';
import { CalendarDays } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import type { DateRange } from '../Calendar/calendar-utils';
import { inheritedInvalid, type DateFieldProps } from './DateField';
import { DateSegments } from './DateSegments';
import { compareFieldDates, draftFill, fieldZone, formatFormDate } from './date-parts';
import { dateFieldVariants } from './date-field.variants';
import { useDateSegments, type DateSegmentsState } from './use-date-segments';

/** How completely each end is typed: none, some or all of its segments. */
export type DateFieldFill = 'empty' | 'partial' | 'complete';

export interface DateRangeChangeDetails {
  startFill: DateFieldFill;
  endFill: DateFieldFill;
}

export interface DateRangeFieldProps extends Omit<DateFieldProps, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Includes incomplete and reversed ranges; values are never reordered. */
  onValueChange?: (range: DateRange) => void;
  /**
   * Fires with every edit of either end, including one that leaves the value as it was, and tells an end whose day
   * was cleared (partial) from one cleared entirely (empty).
   */
  onEdit?: (range: DateRange, details: DateRangeChangeDetails) => void;
  /** Names of the two ends in the segments' accessible names. Defaults to the `dateField.start` / `dateField.end` text. */
  startLabel?: string;
  endLabel?: string;
}

/** Start and end date segments in a single labelled Field control. */
export function DateRangeField(props: DateRangeFieldProps) {
  const zone = fieldZone(props.timeZone, props.utc);
  const start: DateSegmentsState = useDateSegments({
    ...props,
    value: props.value === undefined ? undefined : props.value.start,
    defaultValue: props.defaultValue?.start,
    onAdvance: () => end.focusSegment(0),
    onCommit: (next, draft) =>
      props.onEdit?.(
        { start: next, end: end.currentDate },
        { startFill: draftFill(draft, start.granularity, start.hourCycle), endFill: end.fill },
      ),
    onValueChange: (next) => props.onValueChange?.({ start: next, end: end.currentDate }),
  });
  const end: DateSegmentsState = useDateSegments({
    ...props,
    value: props.value === undefined ? undefined : props.value.end,
    defaultValue: props.defaultValue?.end,
    rangeStart: start.currentDate,
    onCommit: (next, draft) =>
      props.onEdit?.(
        { start: start.currentDate, end: next },
        { startFill: start.fill, endFill: draftFill(draft, end.granularity, end.hourCycle) },
      ),
    onValueChange: (next) => props.onValueChange?.({ start: start.currentDate, end: next }),
  });
  const reversed = !!(
    start.currentDate &&
    end.currentDate &&
    compareFieldDates(end.currentDate, start.currentDate, start.granularity, zone) < 0
  );
  const s = dateFieldVariants({ size: props.size });
  return (
    <>
      <Field.Control
        id={props.id}
        disabled={props.disabled}
        render={(controlProps) => {
          const p = controlProps as ComponentProps<'div'> & { disabled?: boolean };
          const disabled = props.disabled || p.disabled;
          const invalid = start.invalid || end.invalid || reversed || inheritedInvalid(p);
          return (
            <div
              role="group"
              id={p.id}
              aria-invalid={invalid || undefined}
              data-invalid={invalid || undefined}
              data-disabled={disabled || undefined}
              aria-label={
                props['aria-label'] ??
                (props['aria-labelledby'] || p['aria-labelledby'] ? undefined : start.t('dateField.label'))
              }
              aria-labelledby={props['aria-label'] ? undefined : (props['aria-labelledby'] ?? p['aria-labelledby'])}
              aria-describedby={props['aria-describedby'] ?? p['aria-describedby']}
              onFocus={p.onFocus}
              onBlur={p.onBlur}
              onMouseDown={(e) => {
                if (disabled || (e.target as HTMLElement).getAttribute('role') === 'spinbutton') return;
                e.preventDefault();
                const firstEmpty = start.keys.findIndex((key) => start.display(key) === null);
                const lastEmpty = end.keys.findIndex((key) => end.display(key) === null);
                if (firstEmpty >= 0) start.focusSegment(firstEmpty);
                else if (lastEmpty >= 0) end.focusSegment(lastEmpty);
                else start.focusSegment(0);
              }}
              className={cn(s.root(), props.className)}
            >
              {(props.icon ?? true) && (
                <CalendarDays size={props.size === 'sm' ? 14 : 15} aria-hidden className={s.icon()} />
              )}
              <DateSegments
                state={start}
                {...props}
                disabled={disabled}
                invalid={invalid}
                prefix={props.startLabel ?? start.t('dateField.start')}
                onOpenRequest={props.onOpenRequest}
                onNext={() => end.focusSegment(0)}
              />
              <span aria-hidden className={s.separator()}>
                –
              </span>
              <DateSegments
                state={end}
                {...props}
                disabled={disabled}
                invalid={invalid}
                prefix={props.endLabel ?? end.t('dateField.end')}
                onOpenRequest={props.onOpenRequest}
                onPrevious={() => start.focusSegment(start.keys.length - 1)}
              />
            </div>
          );
        }}
      />
      {props.name && (
        <>
          <input
            type="hidden"
            name={`${props.name}-start`}
            value={formatFormDate(start.currentDate, start.granularity, zone)}
          />
          <input
            type="hidden"
            name={`${props.name}-end`}
            value={formatFormDate(end.currentDate, end.granularity, zone)}
          />
        </>
      )}
    </>
  );
}
