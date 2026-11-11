import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Slider } from '../Slider';

export default function SliderWithInput() {
  const { t } = useI18n();
  const [tokens, setTokens] = useState<number | readonly number[]>(4001);
  return (
    <div className="grid w-full max-w-md gap-7">
      <Slider
        label={t('sliderWithInput.temperature')}
        withInput
        min={0}
        max={2}
        step={0.1}
        defaultValue={0.7}
        inputProps={{ hideSteppers: true }}
      />
      <Slider
        label={t('sliderWithInput.maxTokens')}
        withInput
        size="sm"
        min={1}
        max={8000}
        step={50}
        largeStep={500}
        value={tokens}
        onValueChange={setTokens}
        inputProps={{ size: 'md', hideSteppers: true }}
      />
      <Slider
        label={t('sliderWithInput.bounds')}
        thumbLabels={[t('sliderWithInput.minimum'), t('sliderWithInput.maximum')]}
        withInput
        showValue
        min={0}
        max={100}
        defaultValue={[20, 80]}
        inputProps={{ unit: '%', hideSteppers: true }}
      />
    </div>
  );
}
