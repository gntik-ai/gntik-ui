import { Lock } from 'lucide-react';
import { Field, FieldLabel } from '../../Field';
import { PasswordInput } from '../PasswordInput';

export default function PasswordInputBasic() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput leadingIcon={Lock} placeholder="Enter your password" />
      </Field>
      <Field>
        <FieldLabel>API secret</FieldLabel>
        <PasswordInput size="sm" defaultValue="sk-live-example-secret" inputClassName="font-mono text-[12px]" />
      </Field>
    </div>
  );
}
