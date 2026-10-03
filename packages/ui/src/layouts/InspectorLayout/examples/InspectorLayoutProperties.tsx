import { useState } from 'react';
import { InspectorLayout, InspectorToggle } from '../InspectorLayout';

const SERVICES = ['web-frontend', 'billing-api', 'auth-service', 'search-indexer'];

export default function InspectorLayoutProperties() {
  const [selected, setSelected] = useState('billing-api');
  return (
    <div className="h-[460px] overflow-hidden rounded-lg border border-border">
      <InspectorLayout
        panelTitle="Properties"
        defaultPinned={false}
        panel={
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[13px]">
            <dt className="text-muted-foreground">Service</dt>
            <dd className="font-mono">{selected}</dd>
            <dt className="text-muted-foreground">Region</dt>
            <dd>eu-west</dd>
            <dt className="text-muted-foreground">Replicas</dt>
            <dd className="font-mono">3</dd>
            <dt className="text-muted-foreground">Owner</dt>
            <dd>Platform team</dd>
          </dl>
        }
      >
        <div className="flex h-12 items-center justify-between border-b border-border/60 px-4">
          <h2 className="text-[13px] font-semibold">Services</h2>
          <InspectorToggle label="Toggle properties" />
        </div>
        <ul className="grid gap-2 p-4 sm:grid-cols-2">
          {SERVICES.map((name) => (
            <li key={name}>
              <button
                type="button"
                aria-pressed={name === selected}
                onClick={() => setSelected(name)}
                className="w-full rounded-[10px] border border-border bg-card p-4 text-start font-mono text-[13px] hover:bg-accent/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:border-primary"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </InspectorLayout>
    </div>
  );
}
