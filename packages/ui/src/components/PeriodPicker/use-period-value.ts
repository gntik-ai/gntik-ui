import { useState } from 'react';
import type { DateRange } from '../Calendar/calendar-utils';
import type { PeriodValueProps } from './period-types';

export const EMPTY_PERIOD_RANGE: DateRange = { start: null, end: null };

/** Controlled and uncontrolled values share the same public selection contract. */
export function usePeriodValue(props: PeriodValueProps) {
  const [innerSingle, setInnerSingle] = useState<Date | null>(() =>
    props.mode === 'range' ? null : (props.defaultValue ?? null),
  );
  const [innerRange, setInnerRange] = useState<DateRange>(() =>
    props.mode === 'range' ? (props.defaultValue ?? EMPTY_PERIOD_RANGE) : EMPTY_PERIOD_RANGE,
  );
  const single = props.mode === 'range' ? null : props.value !== undefined ? props.value : innerSingle;
  const range = props.mode === 'range' ? (props.value ?? innerRange) : EMPTY_PERIOD_RANGE;
  return {
    single,
    range,
    changeSingle: (date: Date | null) => {
      setInnerSingle(date);
      if (props.mode !== 'range') props.onValueChange?.(date);
    },
    changeRange: (next: DateRange) => {
      setInnerRange(next);
      if (props.mode === 'range') props.onValueChange?.(next);
    },
  };
}
