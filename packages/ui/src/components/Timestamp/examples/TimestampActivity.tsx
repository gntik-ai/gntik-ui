import { useState } from 'react';
import { TooltipProvider } from '../../Tooltip';
import { Timestamp } from '../Timestamp';

const MINUTE = 60_000;

export default function TimestampActivity() {
  const [now] = useState(() => Date.now());
  const events = [
    { id: 1, text: 'Maria Ruiz deployed api-gateway to production', at: now - 3 * MINUTE },
    { id: 2, text: 'Invoice INV-2041 was paid', at: now - 2 * 60 * MINUTE },
    { id: 3, text: 'Daniel Okafor joined the Platform project', at: new Date(now - 3 * 24 * 60 * MINUTE).toISOString() },
  ];
  return (
    <TooltipProvider>
      <ul className="w-full max-w-md divide-y divide-border rounded-md border border-border bg-card">
        {events.map((e) => (
          <li key={e.id} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-[13px] text-foreground">
            <span>{e.text}</span>
            <Timestamp value={e.at} className="shrink-0 text-[12px]" />
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}
