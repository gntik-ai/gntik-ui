import { Field } from '@base-ui/react/field';
import { CalendarDays } from 'lucide-react';
import { useContext, type ComponentProps } from 'react';
import { RangeFieldContext } from './range-field-context';
import { cn } from '../../utils/cn';
import type { DateRange } from '../Calendar/calendar-utils';
import type { DateFieldProps } from './DateField';
import { DateSegments } from './DateSegments';
import { compareFieldDates, formatFormDate, type DateDraft } from './date-parts';
import { dateFieldVariants } from './date-field.variants';
import { useDateSegments, type DateSegmentsState } from './use-date-segments';

export interface DateRangeFieldProps extends Omit<DateFieldProps, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Includes incomplete and reversed ranges; values are never reordered. */
  onValueChange?: (range: DateRange) => void;
}

/** Start and end date segments in a single labelled Field control. */
export function DateRangeField(props: DateRangeFieldProps) {
  const picker = useContext(RangeFieldContext);
  const empty = (state: DateSegmentsState) => state.keys.every((key) => state.display(key) === null);
  const start: DateSegmentsState = useDateSegments(
    {
      ...props,
      isDateDisabled: picker ? (date) => !!picker.isDateDisabled?.(date, { rangeStart: null }) : props.isDateDisabled,
      value: props.value === undefined ? undefined : props.value.start,
      defaultValue: props.defaultValue?.start,
      onValueChange: changeStart,
    },
    draftStart,
  );
  const end: DateSegmentsState = useDateSegments(
    {
      ...props,
      isDateDisabled: picker
        ? (date) => !!picker.isDateDisabled?.(date, { rangeStart: start.currentDate })
        : props.isDateDisabled,
      value: props.value === undefined ? undefined : props.value.end,
      defaultValue: props.defaultValue?.end,
      onValueChange: changeEnd,
    },
    draftEnd,
  );
  function changeStart(next: Date | null) {
    props.onValueChange?.({ start: next, end: end.currentDate });
  }
  function changeEnd(next: Date | null) {
    props.onValueChange?.({ start: start.currentDate, end: next });
  }
  function draftStart(draft: DateDraft, date: Date | null) {
    picker?.onDraftChange(
      { start: date, end: end.currentDate },
      draft.year === null && draft.month === null && draft.day === null && empty(end),
      empty(start) && empty(end),
    );
  }
  function draftEnd(draft: DateDraft, date: Date | null) {
    picker?.onDraftChange(
      { start: start.currentDate, end: date },
      draft.year === null && draft.month === null && draft.day === null && empty(start),
      empty(start) && empty(end),
    );
  }
  const invalid =
    start.invalid ||
    end.invalid ||
    !!(
      start.currentDate &&
      end.currentDate &&
      compareFieldDates(end.currentDate, start.currentDate, start.granularity, props.utc) < 0
    );
  const s = dateFieldVariants({ size: props.size });
  return (
    <>
      <Field.Control
        id={props.id}
        disabled={props.disabled}
        render={(controlProps, controlState) => {
          const p = controlProps as ComponentProps<'div'> & { disabled?: boolean };
          const disabled = props.disabled || p.disabled;
          const fieldInvalid = invalid || controlState.valid === false;
          return (
            <div
              role="group"
              id={p.id}
              data-invalid={fieldInvalid || undefined}
              aria-invalid={fieldInvalid || undefined}
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
                groupLabel={picker?.startLabel}
                {...props}
                disabled={disabled}
                invalid={fieldInvalid}
                prefix={start.t('dateField.start')}
                onNext={() => end.focusSegment(0)}
              />
              <span aria-hidden className={s.separator()}>
                –
              </span>
              <DateSegments
                state={end}
                groupLabel={picker?.endLabel}
                {...props}
                disabled={disabled}
                invalid={fieldInvalid}
                prefix={end.t('dateField.end')}
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
            value={formatFormDate(start.currentDate, start.granularity, props.utc)}
          />
          <input
            type="hidden"
            name={`${props.name}-end`}
            value={formatFormDate(end.currentDate, end.granularity, props.utc)}
          />
        </>
      )}
    </>
  );
}
