import { Rows2, Rows3 } from '@gntik-ai/icons';
import { Toggle, ToggleGroup, type TableDensity, useI18n } from '@gntik-ai/ui';

export interface DensityToggleProps {
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/** Two-icon segmented control: comfortable or compact rows. */
export function DensityToggle({ value, onChange }: DensityToggleProps) {
  const { t } = useI18n();
  return (
    <ToggleGroup
      aria-label={t('table.density')}
      size="sm"
      value={[value]}
      onValueChange={(v) => {
        const next = v[0];
        if (next === 'compact' || next === 'comfortable') onChange(next);
      }}
    >
      <Toggle value="comfortable" iconOnly aria-label={t('table.comfortable')}>
        <Rows2 size={15} aria-hidden />
      </Toggle>
      <Toggle value="compact" iconOnly aria-label={t('table.compact')}>
        <Rows3 size={15} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
