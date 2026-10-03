import { Field, FieldLabel } from '../../Field';
import { TokenInput } from '../TokenInput';

export default function TokenInputLabels() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Deployment labels</FieldLabel>
        <TokenInput defaultValue={['production', 'eu-west']} placeholder="Add label…" size="sm" listLabel="Labels" />
      </Field>
      <Field disabled>
        <FieldLabel>Allowed hosts</FieldLabel>
        <TokenInput defaultValue={['api.example.com']} disabled listLabel="Hosts" />
      </Field>
    </div>
  );
}
