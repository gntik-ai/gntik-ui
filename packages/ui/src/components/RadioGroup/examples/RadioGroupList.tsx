import { useId, useState } from 'react';
import { Radio, RadioGroup } from '../RadioGroup';

const STRATEGIES = [
  { value: 'retry', label: 'Retry three times', description: 'Calls the same service again with backoff before failing.' },
  { value: 'fallback', label: 'Use the backup region', description: 'Switches traffic to the secondary region to keep latency targets.' },
  { value: 'escalate', label: 'Escalate to on-call', description: 'Opens an incident for the on-call member and pauses the job.' },
];

export default function RadioGroupList() {
  const [value, setValue] = useState('retry');
  const id = useId();
  return (
    <div className="max-w-lg">
      <div id={id} className="mb-3 text-[13px] font-semibold text-foreground">
        Failure strategy
      </div>
      <RadioGroup aria-labelledby={id} variant="list" value={value} onValueChange={(v) => setValue(String(v))}>
        {STRATEGIES.map((s) => (
          <Radio key={s.value} value={s.value} label={s.label} description={s.description} />
        ))}
      </RadioGroup>
    </div>
  );
}
