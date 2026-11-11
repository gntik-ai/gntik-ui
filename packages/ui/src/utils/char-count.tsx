import { cn } from './cn';
import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n';

export interface CharCountProps {
  /** Show a character count and an accessible description. */
  showCount?: boolean;
  /** Soft count limit; takes precedence over native maxLength without blocking typing. */
  maxCount?: number;
  /** Count UTF-16 code units by default, or supply another unit such as bytes. */
  countStrategy?: (value: string) => number;
}

export function useCharCount(
  value: string,
  { showCount, maxCount, countStrategy }: CharCountProps,
  maxLength?: number,
) {
  const descriptionId = useId();
  const count = showCount ? (countStrategy ? countStrategy(value) : value.length) : 0;
  const max = maxCount ?? maxLength;
  const zone = max === undefined ? 'normal' : count > max ? 'over' : count >= max * 0.8 ? 'warn' : 'normal';
  const lastZone = useRef(zone);
  const [announcement, setAnnouncement] = useState('');
  const { t } = useI18n();
  useEffect(() => {
    if (!showCount || max === undefined) return;
    const timer = setTimeout(() => {
      if (zone === lastZone.current) return;
      lastZone.current = zone;
      setAnnouncement(
        zone === 'normal'
          ? ''
          : t(zone === 'over' ? 'charCount.over' : 'charCount.left', { count: Math.abs(max - count) }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [value, count, max, showCount, zone, t]);
  return { count, max, over: zone === 'over', descriptionId, announcement };
}

export function CharCount({ count, max, descriptionId, announcement }: ReturnType<typeof useCharCount>) {
  const { t } = useI18n();
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0 font-mono text-[11px] tabular-nums',
          max !== undefined && count > max ? 'text-destructive-text' : 'text-muted-foreground',
        )}
      >
        {max === undefined ? count : `${count} / ${max}`}
      </span>
      <span id={descriptionId} className="sr-only">
        {max === undefined ? t('charCount.count', { count }) : t('charCount.status', { count, max })}
      </span>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
