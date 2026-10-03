import { useState } from 'react';
import { Badge } from '../Badge';
import type { BadgeTone } from '../badge.variants';

const INITIAL: Array<{ label: string; tone: BadgeTone }> = [
  { label: 'production', tone: 'rose' },
  { label: 'eu-west-1', tone: 'cyan' },
  { label: 'billing', tone: 'violet' },
  { label: 'beta', tone: 'amber' },
];

export default function BadgeRemovable() {
  const [tags, setTags] = useState(INITIAL);
  return (
    <div className="flex min-h-[26px] flex-wrap items-center gap-2">
      {tags.map((t) => (
        <Badge
          key={t.label}
          tone={t.tone}
          variant="outline"
          size="lg"
          dot
          onRemove={() => setTags((all) => all.filter((x) => x.label !== t.label))}
        >
          {t.label}
        </Badge>
      ))}
      {tags.length === 0 && (
        <button
          type="button"
          onClick={() => setTags(INITIAL)}
          className="font-mono text-[11px] text-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Restore tags
        </button>
      )}
    </div>
  );
}
