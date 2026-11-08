import { DatePicker, Field, FieldDescription, FieldLabel, useI18n, type DatePreset } from '@gntik-ai/ui';
import { useState } from 'react';

const today = new Date(2026, 2, 1);
const max = new Date(2026, 2, 20);

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export default function DatePickerPresetsTimeLimits() {
  const { t } = useI18n();
  const [expiresAt, setExpiresAt] = useState<Date | null>(new Date(2026, 2, 10, 14, 30));
  const presets: DatePreset[] = [
    { id: 'in-7', label: t('datePicker.examples.in7'), date: (d) => addDays(d, 7) },
    { id: 'in-30', label: t('datePicker.examples.in30'), date: (d) => addDays(d, 30) },
    { id: 'never', label: t('datePicker.examples.noExpiry'), date: () => null },
  ];
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel>{t('datePicker.examples.expiresAt')}</FieldLabel>
        <DatePicker
          withTime
          value={expiresAt}
          onValueChange={setExpiresAt}
          presets={presets}
          locale="en-US"
          hourCycle={24}
          today={today}
          min={today}
          max={max}
          name="expires-at"
        />
        <FieldDescription>{t('datePicker.examples.limitsHint')}</FieldDescription>
      </Field>
    </div>
  );
}
