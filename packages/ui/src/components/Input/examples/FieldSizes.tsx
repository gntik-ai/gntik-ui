import { Search } from 'lucide-react';
import { DensityProvider } from '../../../density';
import { useI18n } from '../../../i18n/I18nProvider';
import { Input } from '../Input';
import { Button } from '../../Button/Button';
import { SimpleSelect } from '../../Select/Select';
import { MultiSelect } from '../../MultiSelect/MultiSelect';
import { TokenInput } from '../../TokenInput/TokenInput';
import { Textarea } from '../../Textarea/Textarea';
import { NumberInput } from '../../NumberInput/NumberInput';
import { DatePicker } from '../../DatePicker/DatePicker';
import { DateRangePicker } from '../../DatePicker/DateRangePicker';
import { TimePicker } from '../../TimePicker/TimePicker';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from '../../Combobox/Combobox';

/** One row per size; auto omits size to exercise the default. Popup metrics stay fixed. */
export default function FieldSizes() {
  const { t } = useI18n();
  const options = [
    { value: 'member', label: t('fieldVariants.option') },
    { value: 'owner', label: t('fieldSizes.owner') },
    { value: 'editor', label: t('fieldSizes.editor') },
  ];
  return (
    <div className="grid min-w-0 gap-6" data-field-sizes>
      {(['comfortable', 'compact'] as const).map((density) => (
        <DensityProvider key={density} density={density}>
          <div role="group" aria-label={t(`fieldSizes.${density}`)} className="grid min-w-0 gap-4">
            <p className="text-[13px] font-semibold text-foreground">{t(`fieldSizes.${density}`)}</p>
            {(['sm', 'auto', 'md', 'lg'] as const).map((size) => {
              const sizing = size === 'auto' ? {} : { size };
              return (
                <div
                  key={size}
                  role="group"
                  aria-label={t(`fieldSizes.${size}`)}
                  data-field-size={size}
                  className="grid min-w-0 gap-2"
                >
                  <p className="text-[12px] text-muted-foreground">{t(`fieldSizes.${size}`)}</p>
                  <div className="flex items-start gap-3 overflow-x-auto pb-2" data-field-row>
                    <div className="w-64 shrink-0">
                      <Input
                        {...sizing}
                        leadingIcon={Search}
                        aria-label={t('fieldVariants.name')}
                        defaultValue={t('fieldVariants.value')}
                      />
                    </div>
                    <div className="w-64 shrink-0">
                      <SimpleSelect
                        {...sizing}
                        aria-label={t('fieldVariants.choice')}
                        items={options}
                        defaultValue="member"
                      />
                    </div>
                    <div className="w-64 shrink-0">
                      <MultiSelect
                        {...sizing}
                        aria-label={t('fieldVariants.option')}
                        options={options}
                        defaultValue={['member']}
                      />
                    </div>
                    <div className="w-64 shrink-0">
                      <TokenInput
                        {...sizing}
                        aria-label={t('fieldVariants.entries')}
                        defaultValue={[t('fieldVariants.option')]}
                      />
                    </div>
                    <div className="w-64 shrink-0">
                      <NumberInput {...sizing} aria-label={t('fieldSizes.count')} defaultValue={1} />
                    </div>
                    <div className="w-64 shrink-0">
                      <DatePicker {...sizing} aria-label={t('fieldVariants.date')} />
                    </div>
                    <div className="w-64 shrink-0">
                      <DateRangePicker {...sizing} aria-label={t('fieldVariants.range')} />
                    </div>
                    <div className="w-64 shrink-0">
                      <TimePicker {...sizing} aria-label={t('fieldSizes.time')} defaultValue="09:00" />
                    </div>
                    <div className="w-64 shrink-0">
                      <Combobox items={options}>
                        <ComboboxInput {...sizing} aria-label={t('fieldVariants.search')} />
                        <ComboboxContent>
                          {(option: (typeof options)[number]) => (
                            <ComboboxItem key={option.value} value={option}>
                              {option.label}
                            </ComboboxItem>
                          )}
                        </ComboboxContent>
                      </Combobox>
                    </div>
                    <Button {...sizing} icon={Search}>
                      {t('fieldSizes.action')}
                    </Button>
                  </div>
                  <Textarea {...sizing} aria-label={t('fieldVariants.notes')} rows={2} />
                </div>
              );
            })}
          </div>
        </DensityProvider>
      ))}
      <div className="w-72" data-field-wrapping>
        <MultiSelect
          size="lg"
          label={t('fieldSizes.wrapping')}
          options={options}
          defaultValue={['member', 'owner', 'editor']}
        />
      </div>
    </div>
  );
}
