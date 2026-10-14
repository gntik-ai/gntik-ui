import { Rows2, Rows3 } from '@gntik-ai/icons';
import { Toggle, ToggleGroup, type TableDensity } from '@gntik-ai/ui';

import { useDataTableLabels, type DataTableDensityLabels } from './data-table-labels';

export interface DensityToggleProps {
  labels?: DataTableDensityLabels;
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/** Two-icon segmented control: comfortable or compact rows. */
export function DensityToggle({ value, onChange, labels }: DensityToggleProps) {
  const l = useDataTableLabels({ density: labels }).density;
  return (
    <ToggleGroup
      aria-label={l.label}
      size="sm"
      value={[value]}
      onValueChange={(v) => {
        const next = v[0];
        if (next === 'compact' || next === 'comfortable') onChange(next);
      }}
    >
      <Toggle value="comfortable" iconOnly aria-label={l.comfortable}>
        <Rows2 size={15} aria-hidden />
      </Toggle>
      <Toggle value="compact" iconOnly aria-label={l.compact}>
        <Rows3 size={15} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
