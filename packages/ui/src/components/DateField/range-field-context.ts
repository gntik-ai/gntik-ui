import { createContext } from 'react';
import type { DateRange } from '../Calendar/calendar-utils';

/** Picker-only draft policy; standalone DateRangeField continues to report partial endpoints. */
export const RangeFieldContext = createContext<{
  startLabel: string;
  endLabel: string;
  isDateDisabled?: (date: Date, context: { rangeStart: Date | null }) => boolean;
  onDraftChange: (range: DateRange, empty: boolean, wasEmpty: boolean) => void;
} | null>(null);
