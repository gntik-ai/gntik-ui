import { useEffect, useState, type HTMLAttributes, type Ref } from 'react';
import { useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { SimpleTooltip } from '../Tooltip';
import { formatRelative, refreshInterval, toDate, type DateInput } from './format';
import { timestampVariants, type TimestampVariantProps } from './timestamp.variants';

export interface TimestampProps extends Omit<HTMLAttributes<HTMLTimeElement>, 'className' | 'children'>, Omit<TimestampVariantProps, 'interactive'> {
  className?: string;
  ref?: Ref<HTMLTimeElement>;
  /** The moment to show: a Date, an ISO string or epoch milliseconds. */
  value: DateInput;
  /** `relative` ("3 minutes ago", default) or `absolute` (Intl date/time). */
  format?: 'relative' | 'absolute';
  /** BCP 47 locale for Intl; defaults to the I18nProvider's, else the runtime locale. */
  locale?: string;
  /** Relative wording style. */
  relativeStyle?: Intl.RelativeTimeFormatStyle;
  /** Intl options for the absolute label. */
  dateOptions?: Intl.DateTimeFormatOptions;
  /** Intl options for the full date in the tooltip. */
  tooltipOptions?: Intl.DateTimeFormatOptions;
  /** Keep a relative label fresh (adaptive interval, cleaned up on unmount). */
  live?: boolean;
  /** Fixed refresh interval in ms (overrides the adaptive one). */
  updateInterval?: number;
  /** Show the full date in a tooltip on hover and keyboard focus (the label becomes focusable). */
  tooltip?: boolean;
  /** Shown when `value` cannot be parsed. */
  fallback?: string;
  /**
   * Reference time (epoch ms) for the first render, e.g. the server's request time, so the
   * server HTML and the hydration render match. A live label switches to the real clock right
   * after mount. Defaults to `Date.now()`.
   */
  now?: number;
}

const ABSOLUTE: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
const FULL: Intl.DateTimeFormatOptions = { dateStyle: 'full', timeStyle: 'long' };

/**
 * A date rendered in a `<time dateTime>` element, relative or absolute, with the full date in
 * a tooltip (and in the accessible text). Relative labels update themselves while mounted.
 */
export function Timestamp({
  value,
  format = 'relative',
  locale: localeProp,
  relativeStyle = 'long',
  dateOptions = ABSOLUTE,
  tooltipOptions = FULL,
  live = true,
  updateInterval,
  tooltip = true,
  fallback = '—',
  now: initialNow,
  tone,
  className,
  ...props
}: TimestampProps) {
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const date = toDate(value);
  const [now, setNow] = useState(() => initialNow ?? Date.now());
  const time = date?.getTime();
  const isLive = live && format === 'relative' && time !== undefined;
  const interval = time !== undefined ? (updateInterval ?? refreshInterval(new Date(time), now)) : 0;

  // A server-provided reference time only seeds hydration; catch up with the clock once mounted.
  const seeded = initialNow !== undefined;
  useEffect(() => {
    if (!isLive || !seeded) return;
    const id = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(id);
  }, [isLive, seeded]);

  useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [isLive, interval]);

  if (!date) {
    return <span className={cn(timestampVariants({ tone }), className)}>{fallback}</span>;
  }

  const label = format === 'relative' ? formatRelative(date, now, locale, relativeStyle) : new Intl.DateTimeFormat(locale, dateOptions).format(date);
  const full = new Intl.DateTimeFormat(locale, tooltipOptions).format(date);
  const showTooltip = tooltip && full !== label;
  const element = (
    // Relative labels and locale/time-zone formatting can legitimately differ between server and client.
    <time
      suppressHydrationWarning
      dateTime={date.toISOString()}
      tabIndex={showTooltip ? 0 : undefined}
      className={cn(timestampVariants({ tone, interactive: showTooltip }), className)}
      {...props}
    >
      {label}
      {showTooltip && (
        <span suppressHydrationWarning className="sr-only">
          {' '}({full})
        </span>
      )}
    </time>
  );
  if (!showTooltip) return element;
  return (
    <SimpleTooltip content={full} variant="solid">
      {element}
    </SimpleTooltip>
  );
}
