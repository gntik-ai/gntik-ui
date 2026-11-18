import { useI18n } from '../../../i18n/I18nProvider';
import { Slider } from '../Slider';

export default function SliderMarks() {
  const { t } = useI18n();
  return (
    <div data-slider-marks-example="" className="grid w-full max-w-md gap-7">
      <Slider
        label={t('sliderMarks.temperature')}
        min={0}
        max={2}
        step={0.1}
        defaultValue={1}
        marks={[
          { value: 0, label: t('sliderMarks.precise') },
          { value: 1, label: t('sliderMarks.balanced') },
          { value: 2, label: t('sliderMarks.creative') },
        ]}
      />
      <div className="grid gap-2">
        <Slider
          label={t('sliderMarks.replicas')}
          min={1}
          max={16}
          defaultValue={4}
          size="sm"
          showValue
          marks={[1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }))}
          restrictToMarks
        />
        <p className="text-xs text-muted-foreground">{t('sliderMarks.keyboardOnly')}</p>
      </div>
    </div>
  );
}
