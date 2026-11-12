import { Bot, Home, Settings, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../../Button';
import { matchText } from '../../../utils/match-text';
import { CommandPalette, CommandPaletteTrigger } from '../CommandPalette';
import type { CommandGroup, CommandItem } from '../command-filter';
import { createCommandPaletteStore } from '../commandPaletteStore';

const AGENTS = [
  ['agent-support', 'Support triage', 'Routes inbound tickets'],
  ['agent-billing', 'Billing reconciler', 'Matches invoices to payments'],
  ['agent-research', 'Research assistant', 'Summarises long documents'],
  ['agent-deploy', 'Deploy guard', 'Checks releases before they ship'],
] as const;

const RUNS = [
  ['run-4812', 'Run 4812', 'Support triage · succeeded'],
  ['run-4813', 'Run 4813', 'Billing reconciler · running'],
  ['run-4814', 'Run 4814', 'Deploy guard · failed'],
] as const;

/**
 * Stands in for `fetch('/api/search?q=…', { signal })`: resolves after a short delay in the order the
 * server ranks it, honours abort, and fails the first time a query contains “fail” so Retry is visible.
 */
function searchServer(
  query: string,
  { signal }: { signal: AbortSignal },
  attempts: Map<string, number>,
): Promise<CommandGroup[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const tries = (attempts.get(query) ?? 0) + 1;
      attempts.set(query, tries);
      if (query.includes('fail') && tries === 1) return reject(new Error('Search is unavailable'));
      const pick = (rows: readonly (readonly [string, string, string])[]): CommandItem[] =>
        rows
          .filter(([id, label, description]) => matchText(`${id} ${label} ${description}`, query))
          .map(([id, label, description]) => ({ id, label, description, icon: Bot }));
      resolve(
        [
          { label: 'Agents', items: pick(AGENTS) },
          { label: 'Runs', items: pick(RUNS) },
        ].filter((group) => group.items.length),
      );
    }, 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function CommandPaletteAsync() {
  const [store] = useState(createCommandPaletteStore);
  const attempts = useRef(new Map<string, number>());
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState('');
  const groups: CommandGroup[] = [
    {
      label: 'Go to',
      items: [
        { id: 'overview', label: 'Overview', icon: Home, onSelect: () => setChosen('Overview') },
        { id: 'agents-page', label: 'Agents', icon: Users, keywords: ['agent'], onSelect: () => setChosen('Agents') },
        { id: 'settings', label: 'Settings', icon: Settings, onSelect: () => setChosen('Settings') },
      ],
    },
  ];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-2">
        <CommandPalette
          groups={groups}
          store={store}
          loadItems={(q, context) => searchServer(q, context, attempts.current)}
          debounceMs={250}
          minQueryLength={2}
          onQueryChange={setQuery}
          onSelect={(item) => setChosen(item.label)}
        >
          <CommandPaletteTrigger />
        </CommandPalette>
        <Button variant="secondary" onClick={store.open}>
          Open from a button
        </Button>
      </div>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        Type two letters (“agent”, “run”) to search the server; “fail” shows the error and Retry. Query:{' '}
        <span className="font-mono text-foreground">{query || '—'}</span>
        {chosen ? (
          <>
            {' '}
            · Chosen: <span className="font-mono text-foreground">{chosen}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
