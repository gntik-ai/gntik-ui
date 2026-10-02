import { CircleAlert, Search } from 'lucide-react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { Input } from '../Input';

export default function InputStates() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <Input defaultValue="member@example" trailingIcon={CircleAlert} />
        <FieldError match hideIcon>Enter a valid work email.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Deployment</FieldLabel>
        <Input defaultValue="prod-eu" />
        <FieldDescription>Available in the EU-West region.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Role</FieldLabel>
        <Input defaultValue="Senior member" />
      </Field>
      <Field>
        <FieldLabel>Token</FieldLabel>
        <Input readOnly defaultValue="sk-live-9f2c…a71" inputClassName="font-mono text-[12px]" />
      </Field>
      <Input size="sm" leadingIcon={Search} placeholder="Small" aria-label="Small search" />
      <Input size="md" leadingIcon={Search} placeholder="Medium" aria-label="Medium search" />
    </div>
  );
}
