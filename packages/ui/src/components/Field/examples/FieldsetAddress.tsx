import { Input } from '../../Input';
import { Field, FieldLabel, Fieldset, FieldsetDescription, FieldsetLegend } from '../Field';

export default function FieldsetAddress() {
  return (
    <Fieldset className="max-w-xl">
      <FieldsetLegend>Billing address</FieldsetLegend>
      <FieldsetDescription>Shown on invoices for every project in this workspace.</FieldsetDescription>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field className="sm:col-span-6">
          <FieldLabel>Street address</FieldLabel>
          <Input autoComplete="street-address" />
        </Field>
        <Field className="sm:col-span-3">
          <FieldLabel>City</FieldLabel>
          <Input autoComplete="address-level2" />
        </Field>
        <Field className="sm:col-span-3">
          <FieldLabel>Postal code</FieldLabel>
          <Input autoComplete="postal-code" />
        </Field>
      </div>
    </Fieldset>
  );
}
