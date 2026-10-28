import { useState } from 'react';
import { MultiSelect, type MultiSelectOption } from '../MultiSelect';

const REGIONS: MultiSelectOption[] = [
  { value: 'all', label: 'All regions' },
  { value: 'madrid', label: 'Madrid', group: 'Europe' },
  { value: 'toronto', label: 'Toronto', group: 'Americas' },
  { value: 'paris', label: 'Paris', group: 'Europe' },
  { value: 'lima', label: 'Lima', group: 'Americas', disabled: true },
];

export default function MultiSelectGrouped() {
  const [options, setOptions] = useState(REGIONS);
  return (
    <div className="w-full max-w-sm" data-example="multi-select-grouped">
      <MultiSelect
        label="Cities by region"
        options={options}
        onCreate={(label) => {
          const option = { value: label, label, group: 'Custom' };
          setOptions((previous) => [...previous, option]);
          return option;
        }}
      />
    </div>
  );
}
