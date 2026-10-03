import { useState } from 'react';
import { VirtualList } from '../VirtualList';

const first = ['Ada', 'Grace', 'Linus', 'Margaret', 'Ken', 'Barbara', 'Dennis', 'Frances'];
const last = ['Hopper', 'Lovelace', 'Hamilton', 'Liskov', 'Thompson', 'Allen', 'Ritchie', 'Torvalds'];
const members = Array.from({ length: 1200 }, (_, i) => {
  const name = `${first[i % first.length]} ${last[(i * 3) % last.length]}`;
  return { id: `m${i}`, name, email: `${name.toLowerCase().replace(' ', '.')}${i}@example.com`, note: i % 4 === 0 ? 'Owner of 3 projects · invited 2 days ago' : '' };
});

export default function VirtualListMembers() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <p id="member-picker" className="text-[13px] font-medium text-foreground">
        Assign to member
      </p>
      <VirtualList
        role="listbox"
        aria-labelledby="member-picker"
        items={members}
        getKey={(m) => m.id}
        estimatedItemHeight={48}
        height={260}
        onSelectedKeyChange={(_key, m) => setPicked(m.name)}
        rowClassName="px-3 py-2"
        renderItem={(m) => (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium text-foreground">{m.name}</span>
            <span className="truncate text-[11.5px] text-muted-foreground">{m.email}</span>
            {m.note && <span className="text-[11.5px] text-muted-foreground">{m.note}</span>}
          </span>
        )}
      />
      <p className="text-[12px] text-muted-foreground" aria-live="polite">
        {picked ? `Assigned to ${picked}.` : 'Nobody assigned yet.'}
      </p>
    </div>
  );
}
