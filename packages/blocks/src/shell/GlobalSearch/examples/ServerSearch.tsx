import { Button, createCommandPaletteStore, useI18n, type CommandGroup } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { GlobalSearch, type GlobalSearchGroup } from '../GlobalSearch';

const AGENTS = ['Support triage', 'Billing reconciler', 'Research assistant', 'Deploy guard'];
const RUNS = ['Run 4812 · Support triage', 'Run 4813 · Billing reconciler', 'Run 4814 · Deploy guard'];

/**
 * Stands in for `fetch('/api/search?q=…', { signal })`: resolves after a short delay in the order the
 * server ranks it, and honours abort. “fail” rejects the first time so the Retry option shows.
 */
function searchServer(query: string, signal: AbortSignal, attempts: Map<string, number>): Promise<CommandGroup[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const tries = (attempts.get(query) ?? 0) + 1;
      attempts.set(query, tries);
      if (query.includes('fail') && tries === 1) return reject(new Error('Search is unavailable'));
      const pick = (kind: string, names: string[]) =>
        names
          .filter((name) => `${kind} ${name}`.toLowerCase().includes(query.toLowerCase()))
          .map((name) => ({ id: `${kind}:${name}`, label: name }));
      resolve(
        [
          { label: 'Agents', items: pick('agent', AGENTS) },
          { label: 'Runs', items: pick('run', RUNS) },
        ].filter((group) => group.items.length),
      );
    }, 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/** Server-backed ⌘K search: loadItems, minQueryLength, onQueryChange and a store; loaded rows report `records`. */
export default function ServerSearch() {
  const { t } = useI18n();
  const [store] = useState(createCommandPaletteStore);
  const attempts = useRef(new Map<string, number>());
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState('');
  const onSelect = (item: { label: string }, group: GlobalSearchGroup) => setChosen(`${item.label} (${group})`);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-2">
        <GlobalSearch
          pages={[{ id: 'page-overview', label: 'Overview' }]}
          records={[]}
          actions={[]}
          recent={[]}
          store={store}
          shortcut={false}
          loadItems={(q, { signal }) => searchServer(q, signal, attempts.current)}
          minQueryLength={2}
          onQueryChange={setQuery}
          onSelect={onSelect}
        />
        <Button variant="secondary" onClick={store.open}>
          {t('commandPalette.examples.openFromButton')}
        </Button>
      </div>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        {t('commandPalette.examples.asyncHelp')} {t('commandPalette.examples.queryLabel')}:{' '}
        <span className="font-mono text-foreground">{query || '—'}</span>
        {chosen ? (
          <>
            {' '}
            · {t('commandPalette.examples.chosenLabel')}: <span className="font-mono text-foreground">{chosen}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
