import { DEFAULT_DATE_RANGE_PRESETS, DateRangePicker, IconButton, cn, type DateRange, type DateRangePreset, useI18n } from '@gntik-ai/ui';
import { X } from '@gntik-ai/icons';
import { useState } from 'react';

export interface DateRangeFilterProps {
  value?: DateRange;
  /** Initial range; defaults to the "Last 7 days" preset. Pass `{ start: null, end: null }` for none. */
  defaultValue?: DateRange;
  /** Called with a complete range, or an empty one when cleared. */
  onValueChange?: (range: DateRange) => void;
  presets?: DateRangePreset[];
  /** "Today" for the presets (defaults to the current date). */
  today?: Date;
  /** Accessible name of the field. */
  label?: string;
  placeholder?: string;
  /** Show a clear button while a range is set. */
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}

const EMPTY: DateRange = { start: null, end: null };
const SHORT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

/** Compact DateRangePicker for toolbars: small trigger, short dates, presets and a clear button. */
export function DateRangeFilter({
  value,
  defaultValue,
  onValueChange,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  today,
  label: labelProp,
  placeholder: placeholderProp,
  clearable = true,
  disabled,
  className,
}: DateRangeFilterProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('dateRange.label');
  const placeholder = placeholderProp ?? t('dateRange.any');
  const [inner, setInner] = useState<DateRange>(() => defaultValue ?? presets.find((p) => p.id === 'last-7')?.range?.(today ?? new Date()) ?? EMPTY);
  const range = value ?? inner;
  const set = (next: DateRange) => {
    setInner(next);
    onValueChange?.(next);
  };
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <DateRangePicker
        size="sm"
        aria-label={label}
        value={range}
        onValueChange={set}
        presets={presets}
        today={today}
        placeholder={placeholder}
        formatOptions={SHORT}
        disabled={disabled}
        className="w-[13.5rem]"
      />
      {clearable && range.start && (
        <IconButton icon={X} size="sm" label={t('common.clearItem', { label: label.toLowerCase() })} disabled={disabled} onClick={() => set(EMPTY)} />
      )}
    </div>
  );
}
