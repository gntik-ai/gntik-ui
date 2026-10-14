import { Rows2, Rows3 } from '@gntik-ai/icons';
import { Toggle, ToggleGroup, type TableDensity, useI18n } from '@gntik-ai/ui';

import type { DataTableLabels } from './labels';

export interface DensityToggleProps {
  labels?: Partial<DataTableLabels>;
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/** Two-icon segmented control: comfortable or compact rows. */
export function DensityToggle({ value, onChange, labels }: DensityToggleProps) {
  const { t } = useI18n();
  return (
    <ToggleGroup
      aria-label={labels?.density ?? t('table.density')}
      size="sm"
      value={[value]}
      onValueChange={(v) => {
        const next = v[0];
        if (next === 'compact' || next === 'comfortable') onChange(next);
      }}
    >
      <Toggle value="comfortable" iconOnly aria-label={labels?.comfortable ?? t('table.comfortable')}>
        <Rows2 size={15} aria-hidden />
      </Toggle>
      <Toggle value="compact" iconOnly aria-label={labels?.compact ?? t('table.compact')}>
        <Rows3 size={15} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
