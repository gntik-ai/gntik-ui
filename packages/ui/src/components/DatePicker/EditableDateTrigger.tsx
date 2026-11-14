import { CalendarDays } from 'lucide-react';
import type { Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import type { DateRange } from '../Calendar/calendar-utils';
import { DateField, type DateFieldProps } from '../DateField/DateField';
import { DateRangeField, type DateRangeChangeDetails } from '../DateField/DateRangeField';
import { PopoverTrigger } from '../Popover';
import { editableTriggerVariants } from './editable-trigger.variants';

/** Props the single and range triggers share; they are forwarded to the segment field. */
type Shared = Pick<
  DateFieldProps,
  | 'locale'
  | 'min'
  | 'max'
  | 'isDateDisabled'
  | 'granularity'
  | 'hourCycle'
  | 'timeZone'
  | 'size'
  | 'id'
  | 'disabled'
  | 'readOnly'
  | 'invalid'
  | 'aria-label'
  | 'aria-describedby'
> & {
  buttonRef: Ref<HTMLButtonElement>;
  onOpenRequest: () => void;
  className?: string;
};

/** The calendar button after the segments: it is the Popover trigger. */
function CalendarButton({ buttonRef, disabled, size }: Pick<Shared, 'buttonRef' | 'disabled' | 'size'>) {
  const { t } = useI18n();
  const s = editableTriggerVariants();
  return (
    <PopoverTrigger
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-label={t('datePicker.choose')}
      className={s.calendarButton()}
    >
      <CalendarDays size={size === 'lg' ? 17 : size === 'sm' ? 14 : 15} aria-hidden />
    </PopoverTrigger>
  );
}

export interface EditableDateTriggerProps extends Shared {
  value: Date | null;
  onValueChange: (date: Date | null) => void;
}

/**
 * Typed date entry: a DateField (the Field control, so FieldLabel and FieldDescription keep wiring) followed by
 * the button that opens the popover.
 */
export function EditableDateTrigger({
  value,
  onValueChange,
  buttonRef,
  onOpenRequest,
  className,
  ...field
}: EditableDateTriggerProps) {
  const s = editableTriggerVariants();
  return (
    <div className={cn(s.root(), className)}>
      <DateField
        {...field}
        value={value}
        onValueChange={onValueChange}
        onOpenRequest={onOpenRequest}
        forceLeadingZeros
        icon={false}
        className="pe-9"
      />
      <CalendarButton buttonRef={buttonRef} disabled={field.disabled} size={field.size} />
    </div>
  );
}

export interface EditableRangeTriggerProps extends Shared {
  value: DateRange;
  onEdit: (range: DateRange, details: DateRangeChangeDetails) => void;
  startLabel: string;
  endLabel: string;
}

/** Typed range entry: one group holding the start and end segments, then the calendar button. */
export function EditableRangeTrigger({
  value,
  onEdit,
  buttonRef,
  onOpenRequest,
  className,
  ...field
}: EditableRangeTriggerProps) {
  const s = editableTriggerVariants();
  return (
    <div className={cn(s.root(), className)}>
      <DateRangeField
        {...field}
        // Uncontrolled: an end typed before the start stays on screen, invalid, until the host remounts the field.
        defaultValue={value}
        onEdit={onEdit}
        onOpenRequest={onOpenRequest}
        forceLeadingZeros
        icon={false}
        className="pe-9"
      />
      <CalendarButton buttonRef={buttonRef} disabled={field.disabled} size={field.size} />
    </div>
  );
}
