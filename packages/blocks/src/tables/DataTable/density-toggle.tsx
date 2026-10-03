import { Rows2, Rows3 } from '@gntik-ai/icons';
import { Toggle, ToggleGroup, type TableDensity } from '@gntik-ai/ui';

export interface DensityToggleProps {
  value: TableDensity;
  onChange: (density: TableDensity) => void;
}

/** Two-icon segmented control: comfortable or compact rows. */
export function DensityToggle({ value, onChange }: DensityToggleProps) {
  return (
    <ToggleGroup
      aria-label="Row density"
      size="sm"
      value={[value]}
      onValueChange={(v) => {
        const next = v[0];
        if (next === 'compact' || next === 'comfortable') onChange(next);
      }}
    >
      <Toggle value="comfortable" iconOnly aria-label="Comfortable rows">
        <Rows2 size={15} aria-hidden />
      </Toggle>
      <Toggle value="compact" iconOnly aria-label="Compact rows">
        <Rows3 size={15} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
