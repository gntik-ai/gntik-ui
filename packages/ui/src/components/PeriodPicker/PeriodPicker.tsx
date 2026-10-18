import { useRef, useState } from 'react';
import {
  endOfPeriod,
  normalizeRange,
  startOfPeriod,
  formatPeriodValue,
  type DateRange,
} from '../Calendar/calendar-utils';
import { DateTrigger } from '../DatePicker/DateTrigger';
import { Popover, PopoverContent } from '../Popover';
import { PeriodCalendar } from './PeriodCalendar';
import { periodLabel, periodUnavailable, usePeriodI18n } from './period-utils';
import { getDefaultPeriodPresets, type PeriodPreset } from './period-presets';
import { periodPickerVariants } from './period-picker.variants';
import { usePeriodValue } from './use-period-value';
import type { PeriodCommonProps, PeriodValueProps } from './period-types';

export type PeriodPickerProps = PeriodCommonProps &
  PeriodValueProps & {
    presets?: PeriodPreset[];
    name?: string;
    placeholder?: string;
    id?: string;
    'aria-describedby'?: string;
  };

/** A field and the kit's Base UI popover for choosing whole periods. */
export function PeriodPicker(props: PeriodPickerProps) {
  const { locale, t } = usePeriodI18n(props.locale);
  const granularity = props.granularity ?? 'month';
  const { single, range, changeSingle, changeRange } = usePeriodValue(props);
  const [draft, setDraft] = useState<DateRange>(range);
  const [open, setInnerOpen] = useState(false);
  const setOpen = (next: boolean) => {
    if (next) setDraft(range);
    setInnerOpen(next);
  };
  const [now] = useState(() => new Date());
  const today = props.today ?? now;
  const presets = props.presets ?? getDefaultPeriodPresets(granularity, props.mode ?? 'single', t);
  const s = periodPickerVariants();
  const presetRange = (preset: PeriodPreset): DateRange => {
    const value = preset.value(today);
    if (value instanceof Date)
      return { start: startOfPeriod(value, granularity), end: endOfPeriod(value, granularity) };
    if (!value.start || !value.end) return value;
    const ordered = normalizeRange(value.start, value.end);
    return { start: startOfPeriod(ordered.start!, granularity), end: endOfPeriod(ordered.end!, granularity) };
  };
  const calendarRef = useRef<HTMLDivElement>(null);
  const label = (date: Date) => periodLabel(date, granularity, locale, t);
  const text =
    props.mode === 'range'
      ? range.start
        ? t('periodPicker.range', { start: label(range.start), end: range.end ? label(range.end) : '' })
        : ''
      : single
        ? label(single)
        : '';
  const calendarProps = {
    granularity,
    locale,
    min: props.min,
    max: props.max,
    isPeriodDisabled: props.isPeriodDisabled,
    today,
    ref: calendarRef,
  };
  return (
    <Popover open={open && !props.disabled} onOpenChange={setOpen}>
      <DateTrigger
        text={text}
        placeholder={props.placeholder ?? t('periodPicker.placeholder')}
        id={props.id}
        aria-label={props['aria-label'] ?? t('periodPicker.choose')}
        aria-describedby={props['aria-describedby']}
        disabled={props.disabled}
        invalid={props.invalid}
        size={props.size}
        className={props.className}
      />
      {props.name &&
        (props.mode === 'range' ? (
          <>
            <input
              type="hidden"
              name={`${props.name}-start`}
              value={range.start ? formatPeriodValue(range.start, granularity) : ''}
            />
            <input
              type="hidden"
              name={`${props.name}-end`}
              value={range.end ? formatPeriodValue(range.end, granularity) : ''}
            />
          </>
        ) : (
          <input type="hidden" name={props.name} value={single ? formatPeriodValue(single, granularity) : ''} />
        ))}
      <PopoverContent
        aria-label={t('periodPicker.choose')}
        align="start"
        sideOffset={6}
        padding="none"
        initialFocus={() => calendarRef.current?.querySelector<HTMLElement>('[data-period][tabindex="0"]') ?? true}
      >
        <div className={s.panel()}>
          {presets.length > 0 && (
            <div role="group" aria-label={t('periodPicker.presets')} className={s.presets()}>
              {presets.map((preset) => {
                const next = presetRange(preset);
                const unavailable =
                  !next.start ||
                  !next.end ||
                  periodUnavailable(next.start, granularity, props) ||
                  periodUnavailable(startOfPeriod(next.end, granularity), granularity, props);
                return (
                  <button
                    type="button"
                    key={preset.id}
                    className={s.preset()}
                    aria-disabled={unavailable || undefined}
                    onClick={() => {
                      if (unavailable) return;
                      if (props.mode === 'range') changeRange(next);
                      else changeSingle(next.start);
                      setOpen(false);
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
          {props.mode === 'range' ? (
            <PeriodCalendar
              {...calendarProps}
              mode="range"
              value={draft}
              onValueChange={(next) => {
                setDraft(next);
                if (next.start && next.end) {
                  changeRange(next);
                  setOpen(false);
                }
              }}
            />
          ) : (
            <PeriodCalendar
              {...calendarProps}
              value={single}
              onValueChange={(date) => {
                changeSingle(date);
                setOpen(false);
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
