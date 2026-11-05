import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete } from '../Autocomplete';

interface Model {
  id: string;
  family: 'familyLarge' | 'familySmall' | 'familyMini';
}

const MODELS: Model[] = [
  { id: 'model-large', family: 'familyLarge' },
  { id: 'model-small', family: 'familySmall' },
  { id: 'model-mini', family: 'familyMini' },
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
            <span className="text-[12px] text-muted-foreground">{t(`autocomplete.examples.${model.family}`)}</span>
          </span>
        )}
        onItemSelect={setPicked}
      />
      <p className="mt-2 text-[12px] text-muted-foreground">
        {picked
          ? t('autocomplete.examples.modelPicked', { family: t(`autocomplete.examples.${picked.family}`) })
          : t('autocomplete.examples.modelHint')}
      </p>
    </div>
  );
}
