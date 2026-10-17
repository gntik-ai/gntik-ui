import { Field } from '@base-ui/react/field';
import { CalendarDays } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../../utils/cn';
import { DateSegments } from './DateSegments';
import { formatFormDate, type Granularity } from './date-parts';
import { dateFieldVariants, type DateFieldVariantProps } from './date-field.variants';
import { useDateSegments } from './use-date-segments';

export interface DateFieldProps extends DateFieldVariantProps {
  value?: Date | null;
  defaultValue?: Date | null;
  /** Complete local date, or null for an incomplete or impossible date. */
  onValueChange?: (date: Date | null) => void;
  granularity?: Granularity;
  hourCycle?: 12 | 24;
  locale?: string;
  forceLeadingZeros?: boolean;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  icon?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Locale-ordered date/date-time spinbuttons, with local calendar validation and form submission. */
export function DateField(props: DateFieldProps) {
  const state = useDateSegments(props);
  const s = dateFieldVariants({ size: props.size });
  return (
    <>
      <Field.Control
        id={props.id}
        disabled={props.disabled}
        render={(controlProps) => {
          const p = controlProps as ComponentProps<'div'> & { disabled?: boolean };
          const disabled = props.disabled || p.disabled;
          return (
            <div
              role="group"
              id={p.id}
              data-invalid={state.invalid || undefined}
              data-disabled={disabled || undefined}
              aria-label={
                props['aria-label'] ??
                (props['aria-labelledby'] || p['aria-labelledby'] ? undefined : state.t('dateField.label'))
              }
              aria-labelledby={props['aria-label'] ? undefined : (props['aria-labelledby'] ?? p['aria-labelledby'])}
              aria-describedby={props['aria-describedby'] ?? p['aria-describedby']}
              onFocus={p.onFocus}
              onBlur={p.onBlur}
              onMouseDown={(e) => {
                if (disabled || (e.target as HTMLElement).getAttribute('role') === 'spinbutton') return;
                e.preventDefault();
                const empty = state.keys.findIndex((key) => state.display(key) === null);
                state.focusSegment(empty < 0 ? 0 : empty);
              }}
              className={cn(s.root(), props.className)}
            >
              {(props.icon ?? true) && (
                <CalendarDays size={props.size === 'sm' ? 14 : 15} aria-hidden className={s.icon()} />
              )}
              <DateSegments state={state} {...props} disabled={disabled} invalid={state.invalid} />
            </div>
          );
        }}
      />
      {props.name && (
        <input type="hidden" name={props.name} value={formatFormDate(state.currentDate, state.granularity)} />
      )}
    </>
  );
}
