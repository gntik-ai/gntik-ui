import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { SearchField } from '../SearchField';

export default function SearchFieldBasic() {
  const [last, setLast] = useState('');
  return (
    <div className="grid max-w-sm gap-4">
      <Field>
        <FieldLabel>Search deployments</FieldLabel>
        <SearchField defaultValue="api" onSearch={(value, source) => setLast(`${source}: ${value || '(empty)'}`)} />
        <FieldDescription>
          {last ? `Last search — ${last}` : 'Press Enter to search, Escape or × to clear.'}
        </FieldDescription>
      </Field>
      <SearchField aria-label="Search logs" size="sm" />
      <SearchField aria-label="Search disabled" disabled defaultValue="api" />
      <SearchField aria-label="Search read-only" readOnly defaultValue="api" />
    </div>
  );
}
