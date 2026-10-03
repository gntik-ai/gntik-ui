import { Lock, Tag } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../../Avatar';
import { Token } from '../Token';

const PEOPLE = ['Maria Ruiz', 'Daniel Okafor', 'Lena Fischer'];

export default function TokenRecipients() {
  const [people, setPeople] = useState(PEOPLE);
  return (
    <div className="flex max-w-md flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background p-1.5" aria-label="Recipients" role="group">
        {people.map((name) => (
          <Token
            key={name}
            size="sm"
            icon={<Avatar name={name} size="xs" tone="accent" aria-hidden className="-ml-1 size-4" />}
            label={name}
            onRemove={() => setPeople((list) => list.filter((n) => n !== name))}
          />
        ))}
        <Token size="sm" icon={<Lock size={11} aria-hidden />} label="Billing owner" onRemove={() => {}} disabled />
      </div>
      <div className="flex flex-wrap gap-2">
        <Token tone="primary" icon={<Tag size={12} aria-hidden />} label="release-2.4" />
        <Token tone="success" label="Paid" />
        <Token tone="warning" label="Due soon" />
        <Token tone="destructive" label="Overdue" />
      </div>
    </div>
  );
}
