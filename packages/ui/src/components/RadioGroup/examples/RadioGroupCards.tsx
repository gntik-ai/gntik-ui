import { Fieldset, FieldsetLegend } from '../../Field';
import { Radio, RadioGroup } from '../RadioGroup';

const PLANS = [
  { value: 'shared', label: 'Shared', description: 'Shared CPU · cold starts', price: 'Free' },
  { value: 'dedicated', label: 'Dedicated', description: '2 vCPU · always warm', price: '$80/mo' },
  { value: 'isolated', label: 'Isolated', description: 'Private network · no neighbours', price: '$240/mo', disabled: true },
];

export default function RadioGroupCards() {
  return (
    <Fieldset className="max-w-lg" render={<RadioGroup variant="card" defaultValue="dedicated" name="plan" />}>
      <FieldsetLegend>Deployment plan</FieldsetLegend>
      {PLANS.map((p) => (
        <Radio key={p.value} value={p.value} label={p.label} description={p.description} trailing={p.price} disabled={p.disabled} />
      ))}
    </Fieldset>
  );
}
