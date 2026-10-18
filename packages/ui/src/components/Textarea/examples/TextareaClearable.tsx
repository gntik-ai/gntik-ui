import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Textarea } from '../Textarea';

export default function TextareaClearable() {
  const [cleared, setCleared] = useState(false);
  return (
    <Field className="max-w-sm">
      <FieldLabel>Notes</FieldLabel>
      <Textarea
        clearable
        clearLabel="Reset notes"
        defaultValue="Optional project notes can be cleared."
        onClear={() => setCleared(true)}
      />
      <FieldDescription>{cleared ? 'Notes cleared.' : 'The clear button returns focus to the notes.'}</FieldDescription>
    </Field>
  );
}
