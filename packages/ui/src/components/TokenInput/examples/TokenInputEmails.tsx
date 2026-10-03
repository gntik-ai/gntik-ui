import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { TokenInput } from '../TokenInput';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TokenInputEmails() {
  const [emails, setEmails] = useState(['ana@example.com', 'devops@example', 'li.wei@example.com']);
  const invalid = emails.filter((e) => !EMAIL.test(e)).length;
  return (
    <div className="max-w-lg">
      <Field invalid={invalid > 0}>
        <FieldLabel>Invite members</FieldLabel>
        <TokenInput
          value={emails}
          onValueChange={setEmails}
          transform={(raw) => raw.trim().toLowerCase()}
          validate={(e) => (EMAIL.test(e) ? null : 'Not a valid email address')}
          maxItems={10}
          placeholder="name@company.com"
          name="invites"
          listLabel="Invitees"
        />
        <FieldDescription>
          {invalid > 0 ? `Fix ${invalid} invalid address${invalid > 1 ? 'es' : ''} before sending.` : 'Press Enter or comma to add. Paste a list to add several.'}
        </FieldDescription>
      </Field>
    </div>
  );
}
