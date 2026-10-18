import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Input } from '../Input';

export default function InputClearable() {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="grid max-w-sm gap-4">
      <Field>
        <FieldLabel>Search projects</FieldLabel>
        <Input clearable clearOnEscape defaultValue="billing" onClear={() => setCleared(true)} />
        <FieldDescription>
          {cleared ? 'Search cleared.' : 'Press Escape or use the clear button to reset the search.'}
        </FieldDescription>
      </Field>
      <Input clearable clearLabel="Reset reference" aria-label="Reference" defaultValue="optional" />
      <Input clearable disabled aria-label="Disabled search" defaultValue="billing" />
      <Input clearable readOnly aria-label="Read-only search" defaultValue="billing" />
    </div>
  );
}
