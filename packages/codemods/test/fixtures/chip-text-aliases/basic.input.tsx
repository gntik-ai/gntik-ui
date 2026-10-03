import { cn } from './cn';

const tones = {
  ok: 'bg-success/14 text-success-text ring-1',
  warn: "rounded bg-warning/12 hover:text-warning-text",
  plain: 'text-primary-text underline',
  mixed: 'bg-primary/14 text-destructive-text',
};

export function Chip({ active, tone }: { active: boolean; tone: 'primary' | 'destructive' }) {
  return (
    <span
      className={`inline-flex ${active ? 'font-medium' : ''} bg-${tone}/14 bg-destructive/10 text-destructive-text`}
      data-x={cn('bg-primary/10', 'text-primary-text')}
    >
      <b className="bg-primary/14 px-2 text-primary-text">{tones.ok}</b>
    </span>
  );
}
