import { useState } from 'react';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxSeparator,
  useComboboxFilter,
} from '../index';

const REGIONS = [
  { value: 'Europe', items: ['Madrid', 'Paris'] },
  { value: 'Americas', items: ['Toronto'] },
];
type Region = (typeof REGIONS)[number];

function renderGroup(group: Region) {
  return (
    <ComboboxGroup key={group.value} items={group.items} className="py-1">
      <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
      <ComboboxCollection>
        {(city: string) => (
          <ComboboxItem key={city} value={city}>
            {city}
          </ComboboxItem>
        )}
      </ComboboxCollection>
      <ComboboxSeparator />
    </ComboboxGroup>
  );
}

export default function ComboboxGrouped() {
  const [regions, setRegions] = useState(REGIONS);
  const { contains } = useComboboxFilter();
  return (
    <div className="grid w-full max-w-sm gap-6" data-example="combobox-grouped">
      <Combobox<string>
        items={regions}
        filter={(city, query) => contains(city, query)}
        onCreate={(city) => {
          setRegions((previous) => [...previous, { value: city, items: [city] }]);
          return city;
        }}
      >
        <ComboboxInput label="City by region" placeholder="Search or create a city…" />
        <ComboboxContent>{renderGroup}</ComboboxContent>
      </Combobox>
      <Combobox<string>
        loadOptions={async (query) =>
          REGIONS.map((group) => ({ ...group, items: group.items.filter((city) => contains(city, query)) })).filter(
            (group) => group.items.length > 0,
          )
        }
      >
        <ComboboxInput label="Remote city by region" />
        <ComboboxContent>{renderGroup}</ComboboxContent>
      </Combobox>
    </div>
  );
}
