import { useState } from 'react';
import { SelectableCard, SelectableCardGroup } from '../SelectableCard';

const PLANS = [
  { value: 'shared', title: 'Shared', description: 'Shared CPU · cold starts', price: 'Free' },
  { value: 'dedicated', title: 'Dedicated', description: '2 vCPU · always warm', price: '$80/mo' },
  { value: 'isolated', title: 'Isolated', description: 'Private network · no neighbours', price: '$240/mo', disabled: true },
];

export default function SelectableCardPlans() {
  const [plan, setPlan] = useState('dedicated');
  return (
    <div className="w-full max-w-lg">
      <p id="plan-label" className="mb-3 text-[13px] font-semibold text-foreground">
        Deployment plan
      </p>
      <SelectableCardGroup aria-labelledby="plan-label" value={plan} onValueChange={setPlan} name="plan">
        {PLANS.map((p) => (
          <SelectableCard
            key={p.value}
            value={p.value}
            title={p.title}
            description={p.description}
            meta={<span className="font-semibold text-foreground">{p.price}</span>}
            disabled={p.disabled}
          />
        ))}
      </SelectableCardGroup>
    </div>
  );
}
