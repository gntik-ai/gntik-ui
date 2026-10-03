import { Field, FieldDescription, FieldLabel } from '../../Field';
import { PasswordInput } from '../PasswordInput';

export default function PasswordInputStrength() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>New password</FieldLabel>
        <PasswordInput showStrength defaultValue="Workspace-2026" />
        <FieldDescription>Members sign in with this password.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Recovery passphrase</FieldLabel>
        <PasswordInput showStrength strength={2} defaultValue="project alpha" />
      </Field>
    </div>
  );
}
