import { Field, FieldError, FieldLabel } from '../../Field';
import { NumberInput } from '../NumberInput';

export default function NumberInputStates() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field invalid>
        <FieldLabel>Rate limit (req/s)</FieldLabel>
        <NumberInput defaultValue={12000} unit="req/s" />
        <FieldError match>Your plan allows up to 10,000 requests per second.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Seats</FieldLabel>
        <NumberInput defaultValue={25} />
      </Field>
      <Field>
        <FieldLabel>Retention (days)</FieldLabel>
        <NumberInput defaultValue={30} readOnly unit="days" />
      </Field>
      <div className="flex flex-col gap-3">
        <NumberInput aria-label="Small quantity" size="sm" defaultValue={1} min={0} />
        <NumberInput aria-label="Medium quantity" size="md" defaultValue={1} min={0} />
      </div>
    </div>
  );
}
