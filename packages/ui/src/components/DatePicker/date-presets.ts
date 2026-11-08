import { compareDay, isSameDay, startOfDay } from '../Calendar/calendar-utils';

export interface DatePreset {
  id: string;
  label: string;
  /** Day relative to `today` (00:00 of the effective day); return `null` to clear the value. */
  date: (today: Date) => Date | null;
}

export interface DatePresetBounds {
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
}

export interface DatePresetState {
  /** The preset's calendar day at local midnight, or `null` for a clearing preset. */
  day: Date | null;
  /** The day is before `min`, after `max` or rejected by `isDateDisabled`. */
  disabled: boolean;
  /** The day is the value's day, or both are `null`. */
  pressed: boolean;
}

/** Day, disabled and pressed state of a preset; `today` and `value` are local-midnight proxy days; each callback gets its own copy of `today`. */
export function presetState(
  preset: DatePreset,
  today: Date,
  value: Date | null,
  { min, max, isDateDisabled }: DatePresetBounds,
): DatePresetState {
  const result = preset.date(new Date(today.getTime()));
  if (!result) return { day: null, disabled: false, pressed: value === null };
  const day = startOfDay(result);
  return {
    day,
    disabled: (!!min && compareDay(day, min) < 0) || (!!max && compareDay(day, max) > 0) || !!isDateDisabled?.(day),
    pressed: isSameDay(day, value),
  };
}
