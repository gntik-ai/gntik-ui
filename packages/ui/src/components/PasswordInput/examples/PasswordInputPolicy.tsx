import { Field, FieldDescription, FieldLabel } from '../../Field';
import { PasswordInput } from '../PasswordInput';

export default function PasswordInputPolicy() {
  return (
    <Field className="max-w-md">
      <FieldLabel>New password</FieldLabel>
      <PasswordInput
        showStrength
        rules={{ minLength: 12, lowercase: true, uppercase: true, number: true }}
        requirements={[{ id: 'noSpaces', label: 'No spaces', test: (password) => !/\s/.test(password) }]}
      />
      <FieldDescription>Your workspace policy is checked as you type.</FieldDescription>
    </Field>
  );
}
