import { useId, useRef, useState } from 'react';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Calendar } from '../Calendar/Calendar';
import { startOfDay, type DateRange, type WeekDay } from '../Calendar/calendar-utils';
import { focusCalendarDay } from '../DatePicker/DatePicker';
import { DateTrigger } from '../DatePicker/DateTrigger';
import { datePickerVariants, type DatePickerVariantProps } from '../DatePicker/date-picker.variants';
import { NumberInput } from '../NumberInput';
import { Popover, PopoverContent } from '../Popover';
import { SimpleSelect } from '../Select';
import { TimePicker } from '../TimePicker/TimePicker';
import { formatTimeOfDay, parseTimeOfDay, timeOfDay, withTimeOfDay } from '../TimePicker/time-utils';
import { Toggle, ToggleGroup } from '../ToggleGroup';
import { dateTimeRangePickerVariants } from './date-time-range-picker.variants';
import {
  DEFAULT_TIME_RANGE_PRESETS,
  isSameTimeRange,
  relativeTimeRangeLabel,
  resolveTimeRange,
  timeRangeError,
  type RelativeTimeUnit,
  type TimeRangePreset,
  type TimeRangeValue,
} from './time-range';

export interface DateTimeRangePickerProps extends DatePickerVariantProps {
  value?: TimeRangeValue | null;
  defaultValue?: TimeRangeValue | null;
  /** Fires with a preset, an applied relative range or a valid absolute range. */
  onValueChange?: (value: TimeRangeValue) => void;
  /** Quick relative ranges; pass `[]` to hide them. */
  presets?: TimeRangePreset[];
  /** "Now" for relative ranges and the calendar. Defaults to the time the popup opens. */
  now?: Date;
  locale?: string;
  /** Clock of the time fields. Defaults to the locale's. */
  hourCycle?: 12 | 24;
  weekStartsOn?: WeekDay;
  /** Earliest selectable day (absolute mode). */
  min?: Date;
  /** Latest selectable day (absolute mode). */
  max?: Date;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submits the resolved instants as ISO strings in `<name>-start` / `<name>-end`. */
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface Draft {
  mode: 'relative' | 'absolute';
  amount: number;
  unit: RelativeTimeUnit;
  days: DateRange;
  startTime: string;
  endTime: string;
}

function draftFrom(value: TimeRangeValue | null | undefined, now: Date): Draft {
  const rel = value?.mode === 'relative' ? value : { amount: 1, unit: 'hour' as const };
  const { start, end } = value ? resolveTimeRange(value, now) : { start: null, end: null };
  return {
    mode: value?.mode ?? 'relative',
    amount: rel.amount,
    unit: rel.unit,
    days: { start: start ? startOfDay(start) : null, end: end ? startOfDay(end) : null },
    startTime: formatTimeOfDay(start ? timeOfDay(start) : { hours: 0, minutes: 0, seconds: 0 }),
    endTime: formatTimeOfDay(end ? timeOfDay(end) : { hours: 23, minutes: 59, seconds: 0 }),
  };
}

const at = (day: Date | null, time: string) => {
  const tod = parseTimeOfDay(time);
  return day && tod ? withTimeOfDay(day, tod) : null;
};

/**
 * Time range field for logs and metrics: quick relative presets (last 15 minutes … 30 days),
 * a relative "Last N minutes/hours/days" editor, and an absolute mode with a range Calendar
 * plus start and end TimePickers, validated so the end is after the start.
 */
export function DateTimeRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  presets = DEFAULT_TIME_RANGE_PRESETS,
  now: nowProp,
  locale: localeProp,
  hourCycle,
  weekStartsOn,
  min,
  max,
  placeholder: placeholderProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  id,
  disabled,
  invalid,
  size,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DateTimeRangePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const uid = useId();
  const [inner, setInner] = useState<TimeRangeValue | null>(defaultValue);
  const range = value !== undefined ? value : inner;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const [openedAt, setOpenedAt] = useState(() => new Date());
  const now = nowProp ?? openedAt;
  const [draft, setDraft] = useState<Draft>(() => draftFrom(range, now));
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const presetsRef = useRef<HTMLDivElement | null>(null);
  const s = datePickerVariants({ size });
  const v = dateTimeRangePickerVariants();

  const unitLabel: Record<RelativeTimeUnit, string> = { minute: t('timeRange.minutes'), hour: t('timeRange.hours'), day: t('timeRange.days') };
  const presetLabel = (p: TimeRangePreset) => p.label ?? relativeTimeRangeLabel(p.amount, p.unit, t);
  const activePreset = range?.mode === 'relative' ? presets.find((p) => isSameTimeRange(range, { mode: 'relative', amount: p.amount, unit: p.unit })) : undefined;

  const text = !range
    ? ''
    : range.mode === 'relative'
      ? activePreset
        ? presetLabel(activePreset)
        : relativeTimeRangeLabel(range.amount, range.unit, t)
      : new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          ...(hourCycle ? { hourCycle: hourCycle === 12 ? 'h12' : 'h23' } : {}),
        }).formatRange(range.start, range.end);
  const resolved = range ? resolveTimeRange(range, now) : null;

  const setOpen = (next: boolean) => {
    if (next) {
      const opened = new Date();
      setOpenedAt(opened);
      setDraft(draftFrom(range, nowProp ?? opened));
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const apply = (next: TimeRangeValue) => {
    setInner(next);
    onValueChange?.(next);
    setOpen(false);
  };

  const startAt = at(draft.days.start, draft.startTime);
  const endAt = at(draft.days.end, draft.endTime);
  const error = timeRangeError(startAt, endAt);
  const showError = draft.mode === 'absolute' && !!draft.days.start && !!draft.days.end && error !== null;
  const errorId = `${uid}-error`;

  const goCustom = () => {
    setDraft((d) => ({ ...d, mode: 'absolute' }));
    requestAnimationFrame(() => {
      const day = focusCalendarDay(calendarRef.current);
      if (day !== true) day.focus();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger
        text={text}
        placeholder={placeholderProp ?? t('timeRange.placeholder')}
        id={id}
        disabled={disabled}
        invalid={invalid}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {name && (
        <>
          <input type="hidden" name={`${name}-start`} value={resolved ? resolved.start.toISOString() : ''} />
          <input type="hidden" name={`${name}-end`} value={resolved ? resolved.end.toISOString() : ''} />
        </>
      )}
      <PopoverContent
        aria-label={t('timeRange.choose')}
        align="start"
        sideOffset={6}
        padding="none"
        initialFocus={() => presetsRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? presetsRef.current?.querySelector<HTMLElement>('button') ?? true}
      >
        <div className={s.panel()}>
          {presets.length > 0 && (
            <div ref={presetsRef} role="group" aria-label={t('timeRange.presets')} className={s.presets()}>
              {presets.map((p) => (
                <button key={p.id} type="button" aria-pressed={activePreset?.id === p.id} className={s.preset()} onClick={() => apply({ mode: 'relative', amount: p.amount, unit: p.unit })}>
                  {presetLabel(p)}
                </button>
              ))}
              <button type="button" aria-pressed={range?.mode === 'absolute'} className={s.preset()} onClick={goCustom}>
                {t('timeRange.custom')}
              </button>
            </div>
          )}
          <div className={v.body()}>
            <ToggleGroup
              aria-label={t('timeRange.mode')}
              size="sm"
              value={[draft.mode]}
              onValueChange={(m) => {
                const mode = m[0];
                if (mode === 'relative' || mode === 'absolute') setDraft((d) => ({ ...d, mode }));
              }}
              className="w-fit"
            >
              <Toggle value="relative">{t('timeRange.relative')}</Toggle>
              <Toggle value="absolute">{t('timeRange.absolute')}</Toggle>
            </ToggleGroup>

            {draft.mode === 'relative' ? (
              <div className={v.relativeRow()}>
                <span className={v.label()}>{t('timeRange.last')}</span>
                <NumberInput
                  aria-label={t('timeRange.amount')}
                  value={draft.amount}
                  min={1}
                  max={9999}
                  size="sm"
                  onValueChange={(n) => n !== null && setDraft((d) => ({ ...d, amount: Math.max(1, Math.round(n)) }))}
                  className="w-28"
                />
                <SimpleSelect<RelativeTimeUnit>
                  aria-label={t('timeRange.unit')}
                  size="sm"
                  items={(['minute', 'hour', 'day'] as const).map((u) => ({ value: u, label: unitLabel[u] }))}
                  value={draft.unit}
                  onValueChange={(u) => u && setDraft((d) => ({ ...d, unit: u }))}
                  className="w-32"
                />
              </div>
            ) : (
              <>
                <Calendar
                  ref={calendarRef}
                  mode="range"
                  aria-label={t('timeRange.choose')}
                  value={draft.days}
                  onValueChange={(days) => setDraft((d) => ({ ...d, days }))}
                  locale={locale}
                  weekStartsOn={weekStartsOn}
                  min={min}
                  max={max}
                  today={now}
                  className="p-0"
                />
                <div className={v.times()}>
                  <div className={v.timeField()}>
                    <span id={`${uid}-start`} className={v.label()}>
                      {t('timeRange.startTime')}
                    </span>
                    <TimePicker
                      aria-labelledby={`${uid}-start`}
                      value={draft.startTime}
                      onValueChange={(time) => time && setDraft((d) => ({ ...d, startTime: time }))}
                      hourCycle={hourCycle}
                      locale={locale}
                      size="sm"
                      invalid={showError}
                    />
                  </div>
                  <div className={v.timeField()}>
                    <span id={`${uid}-end`} className={v.label()}>
                      {t('timeRange.endTime')}
                    </span>
                    <TimePicker
                      aria-labelledby={`${uid}-end`}
                      aria-describedby={showError ? errorId : undefined}
                      value={draft.endTime}
                      onValueChange={(time) => time && setDraft((d) => ({ ...d, endTime: time }))}
                      hourCycle={hourCycle}
                      locale={locale}
                      size="sm"
                      invalid={showError}
                    />
                  </div>
                </div>
                <div aria-live="polite" className="contents">
                  {showError && (
                    <p id={errorId} className={v.error()}>
                      {t(error === 'endBeforeStart' ? 'timeRange.endBeforeStart' : 'timeRange.incomplete')}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className={v.footer()}>
              <Button
                size="sm"
                disabled={draft.mode === 'absolute' && error !== null}
                aria-describedby={showError ? errorId : undefined}
                onClick={() => {
                  if (draft.mode === 'relative') apply({ mode: 'relative', amount: draft.amount, unit: draft.unit });
                  else if (startAt && endAt && !error) apply({ mode: 'absolute', start: startAt, end: endAt });
                }}
                className={cn('min-w-20')}
              >
                {t('timeRange.apply')}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

