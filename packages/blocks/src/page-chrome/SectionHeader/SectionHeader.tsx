import { Button, cn } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import type { PageChromeAction } from '../types';

export interface SectionHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Count pill after the title (members, items…). */
  count?: number;
  /** Small actions on the right; the last one without a variant is secondary. */
  actions?: PageChromeAction[];
  /** Heading level that fits the page outline. */
  as?: 'h2' | 'h3';
  /** Hairline under the header. */
  bordered?: boolean;
  /** Id for the heading, so a section can use `aria-labelledby`. */
  headingId?: string;
  className?: string;
}

const sectionHeaderDefaultActions: PageChromeAction[] = [{ label: 'Add policy', variant: 'secondary' }];

/** Heading for a section inside a page: title (+ count), description and small actions. */
export function SectionHeader({
  title = 'Policies',
  description = 'Guardrails applied to every deployment in this project.',
  count,
  actions = sectionHeaderDefaultActions,
  as: Heading = 'h2',
  bordered = true,
  headingId,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-3', bordered && 'border-b border-border pb-3', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <Heading id={headingId} className="text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </Heading>
          {count != null && (
            <span className="inline-flex h-5 items-center rounded-full bg-secondary px-2 font-mono text-[11px] text-muted-foreground">
              {count.toLocaleString('en-US')}
            </span>
          )}
        </div>
        {description != null && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions.map((a) => (
            <Button key={a.id ?? a.label} size="sm" variant={a.variant ?? 'secondary'} icon={a.icon} disabled={a.disabled} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
