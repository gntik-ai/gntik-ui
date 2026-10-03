import { ScrollArea } from '../ScrollArea';

const EVENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  who: ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson'][i % 4],
  what: ['deployed Billing API', 'invited 2 members', 'paid invoice INV-0' + (40 + i), 'rolled back Search'][i % 4],
  when: `${i + 2} min ago`,
}));

export default function ScrollAreaActivity() {
  return (
    <ScrollArea bordered aria-label="Recent activity" className="h-64 max-w-[420px]">
      <ul className="divide-y divide-border">
        {EVENTS.map((e) => (
          <li key={e.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-[13px]">
            <span className="min-w-0 truncate text-foreground">
              <span className="font-medium">{e.who}</span> <span className="text-muted-foreground">{e.what}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{e.when}</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
