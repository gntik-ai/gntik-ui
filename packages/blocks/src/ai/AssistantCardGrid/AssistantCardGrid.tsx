import { useId } from 'react';
import { Bot, Plus } from '@gntik-ai/icons';
import { Button, ClickableCard, EmptyState, StatusTag, cn, type StatusDefinition } from '@gntik-ai/ui';
import { assistants as defaultAssistants, type Assistant, type AssistantStatus } from './fixtures';

export type { Assistant, AssistantStatus } from './fixtures';

export const ASSISTANT_STATUSES: Record<AssistantStatus, StatusDefinition> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'neutral' },
  draft: { label: 'Draft', tone: 'neutral' },
  degraded: { label: 'Degraded', tone: 'warning' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export interface AssistantCardGridProps {
  assistants?: Assistant[];
  title?: string;
  /** Called when a card is activated (cards with `href` also navigate). */
  onSelect?: (assistant: Assistant) => void;
  /** Shows a "New assistant" button. */
  onCreate?: () => void;
  /** Heading level of the section title (default h2); card names use the next level. */
  titleAs?: 'h2' | 'h3';
  className?: string;
}

/** Grid of assistants as clickable cards (1 → 2 → 3 columns). */
export function AssistantCardGrid({
  assistants = defaultAssistants,
  title = 'Assistants',
  onSelect,
  onCreate,
  titleAs: TitleTag = 'h2',
  className,
}: AssistantCardGridProps) {
  const titleId = useId();
  const active = assistants.filter((a) => a.status === 'active').length;
  return (
    <section aria-labelledby={titleId} className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <TitleTag id={titleId} className="text-[15px] font-semibold tracking-tight text-foreground">
            {title}
          </TitleTag>
          <p className="text-[12.5px] text-muted-foreground">
            {assistants.length} total · {active} active
          </p>
        </div>
        {onCreate && (
          <Button size="sm" icon={Plus} onClick={onCreate}>
            New assistant
          </Button>
        )}
      </div>
      {assistants.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No assistants yet"
          titleAs={TitleTag === 'h2' ? 'h3' : 'h4'}
          description="Create an assistant to automate a task with a model."
          primaryAction={onCreate ? <Button size="sm" icon={Plus} onClick={onCreate}>New assistant</Button> : undefined}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assistants.map((a) => (
            <li key={a.id} className="flex">
              <ClickableCard
                className="w-full"
                titleAs={TitleTag === 'h2' ? 'h3' : 'h4'}
                href={a.href}
                onClick={() => onSelect?.(a)}
                icon={<Bot aria-hidden />}
                title={a.name}
                description={a.description}
                meta={
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <StatusTag status={a.status} statuses={ASSISTANT_STATUSES} />
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {a.model} · {a.runtime}
                    </span>
                    {a.updated && <span className="text-[11px] text-muted-foreground">Updated {a.updated}</span>}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
