import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { addDays, endOfQuarter, toISODate } from '../../Calendar/calendar-utils';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { DatePicker, type DatePickerChangeDetails } from '../DatePicker';
import { type DatePreset } from '../date-presets';

const today = new Date(2026, 2, 1);

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
