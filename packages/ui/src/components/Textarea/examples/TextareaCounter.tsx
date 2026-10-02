import { useState } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { Textarea } from '../Textarea';

const MAX = 280;

export default function TextareaCounter() {
  const [note, setNote] = useState('Retries three times before falling back to the backup region.');
  const tooLong = note.length > MAX;
  return (
    <Field invalid={tooLong} className="max-w-xl">
      <div className="flex items-baseline justify-between">
        <FieldLabel>Deployment note</FieldLabel>
        <span className={tooLong ? 'font-mono text-[11px] text-destructive-text' : 'font-mono text-[11px] text-muted-foreground'}>
          {note.length}/{MAX}
        </span>
      </div>
      <Textarea value={note} onValueChange={setNote} placeholder="Add context for the next reviewer…" />
      <FieldDescription>Basic Markdown is allowed. The note is kept in the audit log.</FieldDescription>
      <FieldError match={tooLong}>Keep the note under {MAX} characters.</FieldError>
    </Field>
  );
}
