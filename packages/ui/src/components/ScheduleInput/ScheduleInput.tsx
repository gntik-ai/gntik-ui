import { CalendarClock } from 'lucide-react';
import { useId, useState } from 'react';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { localeWeekStart } from '../Calendar/calendar-utils';
import { Field, FieldLabel } from '../Field';
import { Input } from '../Input';
import { NumberInput } from '../NumberInput';
import { TimePicker } from '../TimePicker/TimePicker';
import { formatTimeOfDay, parseTimeOfDay } from '../TimePicker/time-utils';
import { Toggle, ToggleGroup } from '../ToggleGroup';
import { cronErrorMessage, describeCron, nextRuns, parseCron, type CronError } from './cron';
import { cronFromSchedule, scheduleFromCron, type ScheduleFrequency, type ScheduleParts } from './schedule-presets';
import { scheduleInputVariants } from './schedule-input.variants';

export interface ScheduleInputProps {
  /** Cron expression (controlled). */
  value?: string;
  defaultValue?: string;
  /** Fires on every edit, valid or not. */
  onValueChange?: (value: string, details: { valid: boolean; error?: CronError }) => void;
  /** IANA time zone for the upcoming runs ("Europe/Madrid"). Defaults to the runtime's. */
  timeZone?: string;
  /** Locale for names, lists and dates. Defaults to the I18nProvider's. */
  locale?: string;
  /** How many upcoming runs to list (0 hides the list). */
  previewCount?: number;
  /** Reference time for the upcoming runs. Defaults to the time of mount. */
  now?: Date;
  /** Preset tabs to offer, in order. */
  frequencies?: ScheduleFrequency[];
  /** Clock of the time fields. */
  hourCycle?: 12 | 24;
  /** Submits the expression through a hidden input. */
  name?: string;
  disabled?: boolean;
  className?: string;
  /** Accessible name of the whole editor. */
  'aria-label'?: string;
}

/** Next runs, or none when the time zone is unknown. */
function safeNextRuns(...args: Parameters<typeof nextRuns>): Date[] {
  try {
    return nextRuns(...args);
  } catch {
    return [];
  }
}

const ALL_FREQUENCIES: ScheduleFrequency[] = ['hourly', 'daily', 'weekly', 'monthly', 'custom'];
const FREQUENCY_KEY = {
  hourly: 'scheduleInput.hourly',
  daily: 'scheduleInput.daily',
  weekly: 'scheduleInput.weekly',
  monthly: 'scheduleInput.monthly',
  custom: 'scheduleInput.custom',
} as const;

/**
 * Cron schedule editor: presets (hourly at minute, daily at, weekly on days at, monthly on day
 * at) that write a 5-field cron expression, a raw cron field for anything else, validation with
 * a message, a plain-language summary and the next runs in a time zone.
 */
export function ScheduleInput({
  value,
  defaultValue = '0 9 * * 1-5',
  onValueChange,
  timeZone,
  locale: localeProp,
  previewCount = 5,
  now: nowProp,
  frequencies = ALL_FREQUENCIES,
  hourCycle = 24,
  name,
  disabled,
  className,
  'aria-label': ariaLabel,
}: ScheduleInputProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale ?? 'en';
  const uid = useId();
  const [inner, setInner] = useState(defaultValue);
  const expression = value ?? inner;
  const [frequency, setFrequency] = useState<ScheduleFrequency>(() => scheduleFromCron(expression).frequency);
  const [seen, setSeen] = useState(expression);
  // An expression set from outside picks the preset that fits it.
  if (expression !== seen) {
    setSeen(expression);
    setFrequency(scheduleFromCron(expression).frequency);
  }
  const [mountedAt] = useState(() => new Date());
  const now = nowProp ?? mountedAt;
  const s = scheduleInputVariants({ disabled: !!disabled });

  const parsed = parseCron(expression);
  const parts: ScheduleParts = { ...scheduleFromCron(expression), frequency };
  const errorText = parsed.valid ? '' : cronErrorMessage(parsed.error, t);
  const summary = parsed.valid ? describeCron(parsed.cron, { locale, t }) : '';
  const runs = parsed.valid && previewCount > 0 ? safeNextRuns(parsed.cron, now, previewCount, timeZone) : [];
  const zoneLabel = timeZone ?? t('scheduleInput.localTime');

  const emit = (next: string) => {
    setInner(next);
    setSeen(next);
    const p = parseCron(next);
    onValueChange?.(next, p.valid ? { valid: true } : { valid: false, error: p.error });
  };
  const update = (patch: Partial<ScheduleParts>) => emit(cronFromSchedule({ ...parts, ...patch }, expression));

  const pickFrequency = (next: ScheduleFrequency) => {
    setFrequency(next);
    if (next !== 'custom') update({ frequency: next });
  };

  const weekStart = localeWeekStart(locale);
  const weekOrder = Array.from({ length: 7 }, (_, i) => (weekStart + i) % 7);
  const dayName = (d: number, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + d)));
  const time = formatTimeOfDay({ hours: parts.hour, minutes: parts.minute, seconds: 0 });
  const onTime = (v: string | null) => {
    const tod = parseTimeOfDay(v);
    if (tod) update({ hour: tod.hours, minute: tod.minutes });
  };
  const runFormat: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: hourCycle === 12 ? 'h12' : 'h23',
    ...(timeZone ? { timeZone } : {}),
  };
  const runFormatter = new Intl.DateTimeFormat(locale, runFormat);
  const errorId = `${uid}-error`;
  const hintId = `${uid}-hint`;

  const timeField = (
    <Field className={s.editor()}>
      <FieldLabel className={s.editorLabel()}>{t('scheduleInput.atTime')}</FieldLabel>
      <TimePicker value={time} onValueChange={onTime} hourCycle={hourCycle} locale={locale} disabled={disabled} className="w-auto" />
    </Field>
  );

  return (
    <div role="group" aria-label={ariaLabel ?? t('scheduleInput.label')} className={cn(s.root(), className)}>
      <ToggleGroup
        aria-label={t('scheduleInput.frequency')}
        value={[frequency]}
        onValueChange={(v) => {
          const next = v[0] as ScheduleFrequency | undefined;
          if (next) pickFrequency(next);
        }}
        disabled={disabled}
        className="w-fit max-w-full flex-wrap"
      >
        {frequencies.map((f) => (
          <Toggle key={f} value={f}>
            {t(FREQUENCY_KEY[f])}
          </Toggle>
        ))}
      </ToggleGroup>

      {frequency !== 'custom' && (
        <div className={s.editors()}>
          {frequency === 'hourly' && (
            <Field className={s.editor()}>
              <FieldLabel className={s.editorLabel()}>{t('scheduleInput.atMinute')}</FieldLabel>
              <NumberInput value={parts.minute} min={0} max={59} onValueChange={(v) => v !== null && update({ minute: v })} disabled={disabled} className="w-32" />
            </Field>
          )}
          {frequency === 'weekly' && (
            <div className={s.editor()}>
              <span id={`${uid}-days`} className={s.editorLabel()}>
                {t('scheduleInput.onDays')}
              </span>
              <ToggleGroup
                multiple
                variant="joined"
                size="sm"
                aria-labelledby={`${uid}-days`}
                value={parts.weekdays.map(String)}
                onValueChange={(v) => v.length && update({ weekdays: v.map(Number) })}
                disabled={disabled}
              >
                {weekOrder.map((d) => (
                  <Toggle key={d} value={String(d)} aria-label={dayName(d, 'long')} className="min-w-10 px-2">
                    {dayName(d, 'short')}
                  </Toggle>
                ))}
              </ToggleGroup>
            </div>
          )}
          {frequency === 'monthly' && (
            <Field className={s.editor()}>
              <FieldLabel className={s.editorLabel()}>{t('scheduleInput.dayOfMonth')}</FieldLabel>
              <NumberInput value={parts.dayOfMonth} min={1} max={31} onValueChange={(v) => v !== null && update({ dayOfMonth: v })} disabled={disabled} className="w-32" />
            </Field>
          )}
          {frequency !== 'hourly' && timeField}
        </div>
      )}

      <Field className={s.editor()} invalid={!parsed.valid}>
        <FieldLabel className={s.editorLabel()}>{t('scheduleInput.expression')}</FieldLabel>
        <Input
          value={expression}
          onChange={(e) => {
            const next = e.currentTarget.value;
            setFrequency(scheduleFromCron(next).frequency);
            emit(next);
          }}
          invalid={!parsed.valid}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          aria-describedby={parsed.valid ? hintId : `${errorId} ${hintId}`}
          inputClassName={s.expression()}
        />
        <span id={hintId} className={s.hint()}>
          {t('scheduleInput.expressionHint')}
        </span>
        <div aria-live="polite" className="contents">
          {!parsed.valid && (
            <p id={errorId} className={s.error()}>
              {errorText}
            </p>
          )}
        </div>
      </Field>
      {name && <input type="hidden" name={name} value={expression} />}

      {parsed.valid && (
        <p className={s.summary()} aria-live="polite">
          <CalendarClock size={15} aria-hidden className={s.summaryIcon()} />
          <span>{summary}</span>
        </p>
      )}

      {parsed.valid && previewCount > 0 && (
        <div className={s.runs()}>
          <span id={`${uid}-runs`} className={s.runsHeading()}>
            {t('scheduleInput.nextRuns', { timeZone: zoneLabel })}
          </span>
          {runs.length ? (
            <ol aria-labelledby={`${uid}-runs`} className={s.runsList()}>
              {runs.map((r) => (
                <li key={r.getTime()}>
                  <time dateTime={r.toISOString()}>{runFormatter.format(r)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className={s.empty()}>{t('scheduleInput.noRuns')}</p>
          )}
        </div>
      )}
    </div>
  );
}
