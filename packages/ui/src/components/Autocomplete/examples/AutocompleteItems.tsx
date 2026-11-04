import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete } from '../Autocomplete';

interface Model {
  id: string;
  family: string;
}

const MODELS: Model[] = [
  { id: 'model-large', family: 'Large' },
  { id: 'model-small', family: 'Small' },
  { id: 'model-mini', family: 'Mini' },
];

/** Object items: `itemToString` fills the input, `renderItem` shapes each row and `onItemSelect` gets the full item. */
export default function AutocompleteItems() {
  const { t } = useI18n();
  const [picked, setPicked] = useState<Model | null>(null);
  return (
    <div className="w-full max-w-sm">
      <Autocomplete<Model>
        label={t('autocomplete.examples.model')}
        placeholder={t('autocomplete.examples.modelPlaceholder')}
        items={MODELS}
        itemToString={(model) => model.id}
        renderItem={(model) => (
          <span className="flex w-full items-center justify-between gap-3">
            <span>{model.id}</span>
            <span className="text-[12px] text-muted-foreground">{model.family}</span>
          </span>
        )}
        onItemSelect={setPicked}
      />
      <p className="mt-2 text-[12px] text-muted-foreground">
        {picked
          ? t('autocomplete.examples.modelPicked', { family: picked.family })
          : t('autocomplete.examples.modelHint')}
      </p>
    </div>
  );
}
