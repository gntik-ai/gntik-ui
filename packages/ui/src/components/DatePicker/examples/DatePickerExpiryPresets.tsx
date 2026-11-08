import {
  DatePicker,
  Field,
  FieldDescription,
  FieldLabel,
  useI18n,
  type DatePickerChangeDetails,
  type DatePreset,
} from '@gntik-ai/ui';
import { useState } from 'react';

const today = new Date(2026, 2, 1);

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function endOfQuarter(date: Date): Date {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0);
}

function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function DatePickerExpiryPresets() {
  const { t } = useI18n();
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [details, setDetails] = useState<DatePickerChangeDetails | null>(null);
  const presets: DatePreset[] = [
    { id: 'in-7', label: t('datePicker.examples.in7'), date: (d) => addDays(d, 7) },
    { id: 'in-30', label: t('datePicker.examples.in30'), date: (d) => addDays(d, 30) },
    { id: 'end-of-quarter', label: t('datePicker.examples.endOfQuarter'), date: (d) => endOfQuarter(d) },
    { id: 'never', label: t('datePicker.examples.noExpiry'), date: () => null },
  ];
  return (
    <div className="max-w-sm">
      <Field>
        <FieldLabel>{t('datePicker.examples.expiresOn')}</FieldLabel>
        <DatePicker
          value={expiry}
          onValueChange={(next, change) => {
            setExpiry(next);
            setDetails(change ?? null);
          }}
          presets={presets}
          locale="en-US"
          today={today}
          min={today}
          name="expires-on"
        />
        <FieldDescription>
          {details?.reason === 'preset'
            ? t('datePicker.examples.pickedPreset', { id: details.presetId ?? '' })
            : expiry
              ? toISODate(expiry)
              : t('datePicker.examples.hint')}
        </FieldDescription>
      </Field>
    </div>
  );
}
