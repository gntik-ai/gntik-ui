import { useId, useState } from 'react';
import { Checkbox, CheckboxGroup } from '../Checkbox';

const OPTIONS = [
  { value: 'mentions', label: 'Mentions', description: 'When someone mentions you in a comment or review.' },
  { value: 'deployments', label: 'Deployments', description: 'When a deployment you own succeeds or fails.' },
  { value: 'billing', label: 'Billing', description: 'Invoices, failed payments and plan changes.' },
];

export default function CheckboxList() {
  const [value, setValue] = useState(['mentions', 'deployments']);
  const id = useId();
  return (
    <div className="grid max-w-lg gap-6">
      <div>
        <div id={id} className="mb-3 text-[13px] font-semibold text-foreground">
          Email notifications
        </div>
        <CheckboxGroup aria-labelledby={id} variant="list" value={value} onValueChange={setValue}>
          {OPTIONS.map((o) => (
            <Checkbox key={o.value} name="notifications" value={o.value} label={o.label} description={o.description} />
          ))}
        </CheckboxGroup>
      </div>
      <Checkbox label="I agree to the terms of service" defaultChecked />
      <Checkbox label="Archived projects (locked)" disabled />
    </div>
  );
}
