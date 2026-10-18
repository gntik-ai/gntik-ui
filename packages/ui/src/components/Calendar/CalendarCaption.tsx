import { useI18n } from '../../i18n/I18nProvider';
import { SimpleSelect } from '../Select';
import { formatMonth, monthNames, monthOutsideBounds, yearOutsideBounds } from './calendar-utils';

export interface CalendarCaptionProps {
  month: Date;
  locale?: string;
  min?: Date;
  max?: Date;
  yearRange?: { from: number; to: number };
  labelId: string;
  onChange: (date: Date) => void;
}

/** Kit selects share the same visible-month boundary as the heading and navigation. */
export function CalendarCaption({ month, locale, min, max, yearRange, labelId, onChange }: CalendarCaptionProps) {
  const { t } = useI18n();
  const year = month.getFullYear();
  const currentYear = new Date().getFullYear();
  const from = Math.max(yearRange?.from ?? currentYear - 10, min?.getFullYear() ?? -Infinity);
  const to = Math.min(yearRange?.to ?? currentYear + 10, max?.getFullYear() ?? Infinity);
  const years = [...new Set([...Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i), year])].sort(
    (a, b) => a - b,
  );
  return (
    <div className="flex flex-1 items-center justify-center gap-1">
      <span id={labelId} className="sr-only" aria-live="polite">
        {formatMonth(month, locale)}
      </span>
      <SimpleSelect
        aria-label={t('calendar.month')}
        size="sm"
        value={String(month.getMonth())}
        items={monthNames(locale).map((label, index) => ({
          value: String(index),
          label,
          disabled: monthOutsideBounds(new Date(year, index, 1), min, max),
        }))}
        onValueChange={(value) => {
          if (value !== null) onChange(new Date(year, Number(value), 1));
        }}
      />
      <SimpleSelect
        aria-label={t('calendar.year')}
        size="sm"
        value={String(year)}
        items={years.map((value) => ({
          value: String(value),
          label: new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(new Date(value, 0, 1)),
          disabled: yearOutsideBounds(new Date(value, 0, 1), min, max),
        }))}
        onValueChange={(value) => {
          if (value !== null) {
            const target = new Date(Number(value), month.getMonth(), 1);
            if (min && monthOutsideBounds(target, min)) onChange(min);
            else if (max && monthOutsideBounds(target, undefined, max)) onChange(max);
            else onChange(target);
          }
        }}
      />
    </div>
  );
}
