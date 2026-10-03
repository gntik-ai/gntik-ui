import { useId, useState } from 'react';
import { Checkbox, CheckboxGroup } from '../Checkbox';

const PROJECTS = ['billing-api', 'support-portal', 'data-pipeline', 'mobile-app', 'onboarding'];

export default function CheckboxSelectAll() {
  const [value, setValue] = useState(['billing-api', 'support-portal']);
  const id = useId();
  return (
    <CheckboxGroup aria-labelledby={id} value={value} onValueChange={setValue} allValues={PROJECTS} className="max-w-lg">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Checkbox parent label={<span id={id}>Include all projects</span>} />
        <span className="ms-auto font-mono text-[11px] text-muted-foreground">
          {value.length}/{PROJECTS.length}
        </span>
      </div>
      <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {PROJECTS.map((p) => (
          <Checkbox key={p} value={p} label={<span className="font-mono text-[12.5px] font-normal">{p}</span>} />
        ))}
      </div>
    </CheckboxGroup>
  );
}
