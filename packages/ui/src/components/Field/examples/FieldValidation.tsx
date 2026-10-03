import { useState } from 'react';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

const isWorkEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function FieldValidation() {
  const [email, setEmail] = useState('member@example');
  const [submitted, setSubmitted] = useState(true);
  const emailInvalid = submitted && !isWorkEmail(email);
  return (
    <form
      noValidate
      className="grid max-w-md gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="billing-dashboard" />
        <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
      </Field>
      <Field invalid={emailInvalid}>
        <FieldLabel required>Work email</FieldLabel>
        <Input type="email" required value={email} onValueChange={setEmail} />
        <FieldError match={emailInvalid}>Enter a valid work email.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Role</FieldLabel>
        <Input defaultValue="Owner" />
        <FieldDescription>Only an admin can change your role.</FieldDescription>
      </Field>
      <div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
