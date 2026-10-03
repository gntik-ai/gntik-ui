import { Field, FieldDescription, FieldLabel } from '../../Field';
import { NumberInput } from '../NumberInput';

export default function NumberInputBasic() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Replicas</FieldLabel>
        <NumberInput defaultValue={3} min={1} max={20} />
        <FieldDescription>Between 1 and 20 instances per region.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Storage (GB)</FieldLabel>
        <NumberInput defaultValue={100} min={10} max={2000} step={10} largeStep={100} unit="GB" />
        <FieldDescription>Steps of 10 GB; PageUp / PageDown jump by 100.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Monthly budget</FieldLabel>
        <NumberInput defaultValue={1250} min={0} step={50} locale="en-US" format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} />
      </Field>
      <NumberInput scrubLabel="Opacity (%)" defaultValue={80} min={0} max={100} unit="%" size="sm" hideSteppers />
    </div>
  );
}
