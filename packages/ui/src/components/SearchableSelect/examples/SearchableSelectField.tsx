import { useState } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { useI18n } from '../../../i18n/I18nProvider';
import { whichPicker } from '../SearchableSelect.doc';
import { useRegions } from './regions';

export default function SearchableSelectField() {
  const { t } = useI18n();
  const options = useRegions();
  const [value, setValue] = useState<{ id: string } | null>({ id: 'eu-west-1' });
  return (
    <form data-example="searchable-select-field" className="grid w-full max-w-sm gap-4">
      <div>
        <SearchableSelect
          options={options.map((option) => ({ ...option, value: { id: option.value } }))}
          getOptionKey={(option) => option.id}
          label={t('searchableSelect.examples.region')}
          name="region"
          required
          value={value}
          onValueChange={setValue}
        />
      </div>
      <div>
        <SearchableSelect
          options={options}
          label={t('searchableSelect.examples.readonly')}
          defaultValue="eu-west-1"
          readOnly
          size="sm"
        />
      </div>
      <div>
        <SearchableSelect options={options} label={t('searchableSelect.examples.disabled')} disabled size="lg" />
      </div>
      <table className="w-full text-start text-xs text-muted-foreground">
        <caption className="mb-2 text-start font-medium text-foreground">
          {t('searchableSelect.examples.pickerCaption')}
        </caption>
        <thead>
          <tr>
            <th className="p-2 text-start">{t('searchableSelect.examples.pickerComponent')}</th>
            <th className="p-2 text-start">{t('searchableSelect.examples.pickerUse')}</th>
          </tr>
        </thead>
        <tbody>
          {whichPicker.map(([name]) => (
            <tr key={name}>
              <th scope="row" className="p-2 text-start font-medium text-foreground">
                {name}
              </th>
              <td className="p-2">{t(`searchableSelect.examples.picker${name}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
}
