import { useState } from 'react';
import { MultiSelect, type MultiSelectOption } from '../MultiSelect';

const regions: MultiSelectOption[] = [
  { value: 'us-east', label: 'US East', description: 'Virginia' },
  { value: 'us-west', label: 'US West', description: 'Oregon' },
  { value: 'eu-west', label: 'EU West', description: 'Ireland' },
  { value: 'eu-central', label: 'EU Central', description: 'Frankfurt' },
  { value: 'ap-south', label: 'Asia Pacific', description: 'Mumbai' },
  { value: 'sa-east', label: 'South America', description: 'São Paulo', disabled: true },
];

export default function MultiSelectBasic() {
  const [value, setValue] = useState(['us-east', 'eu-west', 'eu-central', 'ap-south']);
  return (
    <div className="w-full max-w-sm">
      <MultiSelect label="Deployment regions" options={regions} value={value} onValueChange={setValue} maxVisibleChips={2} placeholder="Search regions…" />
      <p className="mt-2 text-[12px] text-muted-foreground">
        {value.length} of {regions.length} regions selected. South America is not available on this plan.
      </p>
    </div>
  );
}
