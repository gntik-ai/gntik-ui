import type { Ref } from 'react';
import type { DateRange, PeriodGranularity } from '../Calendar/calendar-utils';
import type { DatePickerVariantProps } from '../DatePicker/date-picker.variants';

export interface PeriodCommonProps extends DatePickerVariantProps {
  granularity?: PeriodGranularity;
  locale?: string;
  min?: Date;
  max?: Date;
  isPeriodDisabled?: (start: Date) => boolean;
  today?: Date;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface PeriodSingleProps {
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
}

export interface PeriodRangeProps {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  /** Inline calendars report each pick; fields apply complete whole-period ranges only. */
  onValueChange?: (range: DateRange) => void;
}

export type PeriodValueProps = PeriodSingleProps | PeriodRangeProps;
export type PeriodCalendarProps = PeriodCommonProps & PeriodValueProps & { ref?: Ref<HTMLDivElement> };
