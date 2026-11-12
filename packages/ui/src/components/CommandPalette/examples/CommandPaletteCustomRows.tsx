import { Rocket } from 'lucide-react';
import { useState } from 'react';
import { CommandPalette, CommandPaletteTrigger } from '../CommandPalette';
import type { CommandGroup, CommandItem } from '../command-filter';

const STATUS = ['succeeded', 'running', 'failed'] as const;

const DEPLOYS: CommandItem[] = Array.from({ length: 120 }, (_, i) => ({
  id: `deploy-${i + 1}`,
  label: `deploy-${i + 1}`,
  mono: true,
  icon: Rocket,
}));

const groups: CommandGroup[] = [{ label: 'Deployments', items: DEPLOYS }];

/** 120 static rows capped at 50, ranked by prefix only, with a status tag next to the visible label. */
export default function CommandPaletteCustomRows() {
  const [chosen, setChosen] = useState('');
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <CommandPalette
        groups={groups}
        limit={50}
        filter={(item, q) => (item.id.startsWith(q.toLowerCase()) ? 1 : -1)}
        renderItem={(item) => (
          <>
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{item.label}</span>
            <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground group-data-highlighted:text-accent-foreground">
              {STATUS[Number(item.id.split('-')[1]) % STATUS.length]}
            </span>
          </>
        )}
        onSelect={(item) => setChosen(item.label)}
      >
        <CommandPaletteTrigger />
      </CommandPalette>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        The footer reads “Showing 50 of 120”; only ids that start with the query match.
        {chosen ? (
          <>
            {' '}
            Chosen: <span className="font-mono text-foreground">{chosen}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
