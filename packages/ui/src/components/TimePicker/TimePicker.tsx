import { Field } from '@base-ui/react/field';
import { Clock } from 'lucide-react';
import { useRef, useState, type ComponentProps, type KeyboardEvent, type MouseEvent } from 'react';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { timePickerVariants, type TimePickerVariantProps } from './time-picker.variants';
import { dayPeriodLabels, formatTimeOfDay, localeHourCycle, parseTimeOfDay, timeToSeconds } from './time-utils';

export interface TimePickerProps extends TimePickerVariantProps {
  /** `"HH:mm"` (or `"HH:mm:ss"` with `withSeconds`), 24-hour clock; `null` while incomplete. */
  value?: string | null;
  defaultValue?: string | null;
  /** Fires with a complete time, or `null` when a segment is cleared. */
  onValueChange?: (value: string | null) => void;
  /** Adds a seconds segment. */
  withSeconds?: boolean;
  /** 12-hour (with an AM/PM segment) or 24-hour clock. Defaults to the locale's. */
  hourCycle?: 12 | 24;
  /** BCP 47 locale for the hour cycle and AM/PM labels. Defaults to the I18nProvider's. */
  locale?: string;
  /** Minute increment for the arrow keys (e.g. 15). Typed minutes are not snapped. */
  step?: number;
  /** Earliest valid time (`"HH:mm"`); earlier values are marked invalid. */
  min?: string;
  /** Latest valid time (`"HH:mm"`). */
  max?: string;
  /** Submitted as `HH:mm[:ss]` through a hidden input. */
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  /** Show the leading clock icon. */
  icon?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

type SegmentKey = 'hour' | 'minute' | 'second' | 'period';

interface Draft {
  /** 0–23. */
  hour: number | null;
  minute: number | null;
  second: number | null;
  /** AM/PM picked before the hour (12-hour clock). */
  pm: boolean | null;
}

const EMPTY: Draft = { hour: null, minute: null, second: null, pm: null };

function toDraft(value: string | null | undefined): Draft {
  const t = parseTimeOfDay(value);
  return t ? { hour: t.hours, minute: t.minutes, second: t.seconds, pm: t.hours >= 12 } : EMPTY;
}

function draftToValue(d: Draft, withSeconds: boolean): string | null {
  if (d.hour === null || d.minute === null || (withSeconds && d.second === null)) return null;
  return formatTimeOfDay({ hours: d.hour, minutes: d.minute, seconds: d.second ?? 0 }, withSeconds);
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Time field: hour, minute (optional second, AM/PM on a 12-hour clock) spinbutton segments.
 * Arrows spin the focused segment (minutes by `step`), digits type into it and auto-advance,
 * Backspace clears it, ArrowLeft/ArrowRight move between segments. Works inside Field.
 */
export function TimePicker({
  value,
  defaultValue,
  onValueChange,
  withSeconds = false,
  hourCycle: hourCycleProp,
  locale: localeProp,
  step = 1,
  min,
  max,
  name,
  id,
  disabled,
  readOnly,
  invalid,
  icon = true,
  size = 'auto',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: TimePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const hourCycle = hourCycleProp ?? localeHourCycle(locale);
  const [amLabel, pmLabel] = dayPeriodLabels(locale);
  const controlled = value !== undefined;
  const [draft, setDraft] = useState<Draft>(() => toDraft(controlled ? value : defaultValue));
  const [synced, setSynced] = useState(value);
  // A new controlled value (not the echo of our own change) replaces the draft.
  if (controlled && value !== synced) {
    setSynced(value);
    setDraft(toDraft(value));
  }
  const buffer = useRef<{ key: SegmentKey; text: string } | null>(null);
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const s = timePickerVariants({ size });
  const minuteStep = Math.max(1, Math.floor(step));

  const keys: SegmentKey[] = ['hour', 'minute', ...(withSeconds ? (['second'] as const) : []), ...(hourCycle === 12 ? (['period'] as const) : [])];
  const current = draftToValue(draft, withSeconds);
  const parsed = parseTimeOfDay(current);
  const minT = parseTimeOfDay(min);
  const maxT = parseTimeOfDay(max);
  const outOfRange = !!parsed && ((!!minT && timeToSeconds(parsed) < timeToSeconds(minT)) || (!!maxT && timeToSeconds(parsed) > timeToSeconds(maxT)));

  const periodFlag = draft.hour !== null ? draft.hour >= 12 : draft.pm;
  const display = (key: SegmentKey): number | null => {
    if (key === 'hour') return draft.hour === null ? null : hourCycle === 12 ? draft.hour % 12 || 12 : draft.hour;
    if (key === 'minute') return draft.minute;
    if (key === 'second') return draft.second;
    return periodFlag === null ? null : periodFlag ? 1 : 0;
  };
  const range = (key: SegmentKey): [number, number] =>
    key === 'hour' ? (hourCycle === 12 ? [1, 12] : [0, 23]) : key === 'period' ? [0, 1] : [0, 59];

  const withSegment = (d: Draft, key: SegmentKey, n: number | null): Draft => {
    if (key === 'minute') return { ...d, minute: n };
    if (key === 'second') return { ...d, second: n };
    if (key === 'period') {
      const pm = n === null ? null : n === 1;
      return { ...d, pm, hour: d.hour === null || pm === null ? d.hour : (d.hour % 12) + (pm ? 12 : 0) };
    }
    if (n === null) return { ...d, hour: null, pm: periodFlag };
    if (hourCycle === 24) return { ...d, hour: n };
    return { ...d, hour: (n % 12) + (periodFlag ? 12 : 0) };
  };

  const commit = (next: Draft) => {
    setDraft(next);
    const v = draftToValue(next, withSeconds);
    if (v !== current) {
      if (controlled) setSynced(v);
      onValueChange?.(v);
    }
  };

  const focusSegment = (i: number) => {
    buffer.current = null;
    segmentRefs.current[Math.max(0, Math.min(keys.length - 1, i))]?.focus();
  };

  const spin = (key: SegmentKey, delta: number) => {
    const [lo, hi] = range(key);
    const cur = display(key);
    const stepSize = key === 'minute' ? minuteStep : 1;
    const top = Math.floor(hi / stepSize) * stepSize;
    let next: number;
    if (cur === null) next = delta > 0 ? lo : top;
    else if (stepSize > 1) next = delta > 0 ? (Math.floor(cur / stepSize) + 1) * stepSize : (Math.ceil(cur / stepSize) - 1) * stepSize;
    else next = cur + delta;
    if (next > hi) next = lo;
    if (next < lo) next = top;
    commit(withSegment(draft, key, next));
  };

  const typeDigit = (key: SegmentKey, index: number, digit: string) => {
    const [lo, hi] = range(key);
    let text = (buffer.current?.key === key ? buffer.current.text : '') + digit;
    let n = Number(text);
    if (n > hi) {
      text = digit;
      n = Number(digit);
    }
    if (n >= lo) commit(withSegment(draft, key, n));
    else if (text.length >= 2) commit(withSegment(draft, key, hi)); // "00" on a 12-hour clock → 12
    if (text.length >= 2 || n * 10 > hi) focusSegment(index + 1);
    else buffer.current = { key, text };
  };

  const onKeyDown = (key: SegmentKey, index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const editable = !readOnly;
    let handled = true;
    if (e.key === 'ArrowLeft') focusSegment(index - 1);
    else if (e.key === 'ArrowRight') focusSegment(index + 1);
    else if (!editable) handled = false;
    else if (e.key === 'ArrowUp') spin(key, 1);
    else if (e.key === 'ArrowDown') spin(key, -1);
    else if (e.key === 'Home') commit(withSegment(draft, key, range(key)[0]));
    else if (e.key === 'End') commit(withSegment(draft, key, key === 'minute' ? Math.floor(59 / minuteStep) * minuteStep : range(key)[1]));
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      buffer.current = null;
      commit(withSegment(draft, key, null));
    } else if (key !== 'period' && /^\d$/.test(e.key)) typeDigit(key, index, e.key);
    else if (key === 'period' && e.key.length === 1) {
      const c = e.key.toLowerCase();
      if (c === 'a' || amLabel.toLowerCase().startsWith(c)) commit(withSegment(draft, key, 0));
      else if (c === 'p' || pmLabel.toLowerCase().startsWith(c)) commit(withSegment(draft, key, 1));
      else handled = false;
    } else if ((e.key === ':' || e.key === '.') && index < keys.length - 1) focusSegment(index + 1);
    else handled = false;
    if (handled) e.preventDefault();
  };

  const onRootMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || (e.target as HTMLElement).getAttribute('role') === 'spinbutton') return;
    e.preventDefault();
    const empty = keys.findIndex((k) => display(k) === null);
    focusSegment(empty < 0 ? 0 : empty);
  };

  const label = (key: SegmentKey) =>
    t(key === 'hour' ? 'timePicker.hours' : key === 'minute' ? 'timePicker.minutes' : key === 'second' ? 'timePicker.seconds' : 'timePicker.period');

  return (
    <>
      <Field.Control
        id={id}
        disabled={disabled}
        render={(controlProps) => {
          const p = controlProps as ComponentProps<'div'> & { disabled?: boolean };
          const isDisabled = disabled || p.disabled;
          return (
            <div
              role="group"
              id={p.id}
              aria-label={ariaLabel ?? (ariaLabelledBy || p['aria-labelledby'] ? undefined : t('timePicker.label'))}
              aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? p['aria-labelledby'])}
              aria-describedby={ariaDescribedBy ?? p['aria-describedby']}
              data-invalid={invalid || outOfRange || undefined}
              data-disabled={isDisabled || undefined}
              onMouseDown={onRootMouseDown}
              onFocus={p.onFocus}
              onBlur={(e) => {
                buffer.current = null;
                p.onBlur?.(e);
              }}
              className={cn(s.root(), className)}
            >
              {icon && <Clock size={size === 'sm' ? 14 : 15} aria-hidden className={s.icon()} />}
              <div dir="ltr" className={s.segments()}>
                {keys.map((key, i) => {
                  const n = display(key);
                  const [lo, hi] = range(key);
                  const text = n === null ? '––' : key === 'period' ? (n ? pmLabel : amLabel) : pad(n);
                  return (
                    <span key={key} className="contents">
                      {i > 0 && key !== 'period' && (
                        <span aria-hidden className={s.separator()}>
                          :
                        </span>
                      )}
                      {key === 'period' && <span aria-hidden className="w-1" />}
                      <div
                        ref={(el) => {
                          segmentRefs.current[i] = el;
                        }}
                        role="spinbutton"
                        tabIndex={isDisabled ? -1 : 0}
                        aria-label={label(key)}
                        aria-valuemin={lo}
                        aria-valuemax={hi}
                        aria-valuenow={n ?? undefined}
                        aria-valuetext={n === null ? t('timePicker.empty') : text}
                        aria-disabled={isDisabled || undefined}
                        aria-readonly={readOnly || undefined}
                        aria-invalid={invalid || outOfRange || undefined}
                        data-placeholder={n === null || undefined}
                        data-segment={key}
                        onKeyDown={onKeyDown(key, i)}
                        onFocus={() => {
                          buffer.current = null;
                        }}
                        className={cn(s.segment(), key === 'period' ? 'min-w-[2.5ch]' : 'min-w-[2.2ch]')}
                      >
                        {text}
                      </div>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
      {name && <input type="hidden" name={name} value={current ?? ''} />}
    </>
  );
}
