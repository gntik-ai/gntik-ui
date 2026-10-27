import { FieldVariantProvider } from '../../../field-variant';
import { useI18n } from '../../../i18n/I18nProvider';
import { Input } from '../Input';
import { SimpleSelect } from '../../Select/Select';
import { DatePicker } from '../../DatePicker/DatePicker';

/** Ghost belongs in an obvious editing context; filled fields suit toolbars. */
export default function InputVariants() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <FieldVariantProvider variant="ghost">
        <div
          role="group"
          aria-label={t('fieldVariants.inlineEdit')}
          className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-3"
        >
          <Input aria-label={t('fieldVariants.name')} defaultValue={t('fieldVariants.value')} />
          <SimpleSelect
            aria-label={t('fieldVariants.choice')}
            items={[{ value: 'member', label: t('fieldVariants.option') }]}
            defaultValue="member"
          />
          <DatePicker aria-label={t('fieldVariants.date')} />
          <Input invalid aria-label={t('fieldVariants.ghost')} defaultValue={t('fieldVariants.value')} />
          <Input variant="outline" aria-label={t('fieldVariants.outline')} defaultValue={t('fieldVariants.value')} />
        </div>
      </FieldVariantProvider>
      <FieldVariantProvider variant="filled">
        <div role="toolbar" aria-label={t('fieldVariants.toolbar')} className="flex flex-wrap gap-3">
          <Input aria-label={t('fieldVariants.search')} placeholder={t('fieldVariants.searchPlaceholder')} />
          <SimpleSelect
            aria-label={t('fieldVariants.choice')}
            items={[{ value: 'member', label: t('fieldVariants.option') }]}
          />
        </div>
      </FieldVariantProvider>
    </div>
  );
}
