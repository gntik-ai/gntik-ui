import { cn } from '@gntik-ai/ui';
import { TONE, type EventKind } from './events';

/** Square type tile (no avatars on scheduled work). */
export function EventTile({ kind, className }: { kind: EventKind; className?: string }) {
  const Glyph = kind.icon;
  const tone = TONE[kind.tone];
  return (
    <span aria-hidden className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', tone.soft, tone.icon, className)}>
      <Glyph size={17} />
    </span>
  );
}
