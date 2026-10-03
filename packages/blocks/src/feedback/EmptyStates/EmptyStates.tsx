import { Check, FolderPlus, Lock, SearchX } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import { Button, EmptyState, Link, cn } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { firstRunSteps, noAccessSample, noResultsSample } from './fixtures';

interface SharedEmptyProps {
  /** Heading level that fits the page outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Dashed border around the state (use inside a card or table). */
  bordered?: boolean;
  className?: string;
}

export interface FirstRunEmptyProps extends SharedEmptyProps {
  icon?: LucideIcon;
  title?: ReactNode;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Secondary link (docs, guide). `null` hides it. */
  secondary?: { label: string; href: string } | null;
  /** Short checklist of what the first run involves. */
  steps?: string[];
}

/** First-run state: nothing created yet; explains the value and offers the first action. */
export function FirstRunEmpty({
  icon = FolderPlus,
  title = 'Create your first project',
  description = 'Projects group your services, environments and deployments. Start one from a repository in a couple of minutes.',
  actionLabel = 'New project',
  onAction,
  secondary = { label: 'Read the guide', href: '#guide' },
  steps = firstRunSteps,
  titleAs,
  bordered = true,
  className,
}: FirstRunEmptyProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      titleAs={titleAs}
      description={description}
      bordered={bordered}
      className={cn('mx-auto', className)}
      primaryAction={<Button onClick={onAction}>{actionLabel}</Button>}
      secondaryAction={
        secondary ? (
          <Link href={secondary.href} className="inline-flex h-9 items-center px-2 text-[13px] font-semibold">
            {secondary.label}
          </Link>
        ) : undefined
      }
    >
      {steps.length > 0 && (
        <ol className="mt-6 grid gap-2 text-left text-[12.5px] text-muted-foreground">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/14 font-mono text-[10.5px] font-semibold text-primary-text">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </EmptyState>
  );
}

export interface NoResultsEmptyProps extends SharedEmptyProps {
  /** The search text that matched nothing. */
  query?: string;
  /** Number of active filters (shows "Clear filters" when > 0). */
  filterCount?: number;
  /** Plural noun for what is being searched. */
  entity?: string;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
}

/** No-results state for a filtered list or table: echoes the query and offers ways out. */
export function NoResultsEmpty({
  query = noResultsSample.query,
  filterCount = noResultsSample.filterCount,
  entity = noResultsSample.entity,
  onClearFilters,
  onClearSearch,
  titleAs,
  bordered = false,
  className,
}: NoResultsEmptyProps) {
  const filters = filterCount > 0 ? ` with ${filterCount} ${filterCount === 1 ? 'filter' : 'filters'} applied` : '';
  return (
    <EmptyState
      icon={SearchX}
      size="sm"
      titleAs={titleAs}
      bordered={bordered}
      className={cn('mx-auto', className)}
      title={query ? <>No {entity} match “<span className="font-mono">{query}</span>”</> : `No ${entity} found`}
      description={`Check the spelling or try a broader search${filters}.`}
      primaryAction={
        filterCount > 0 ? (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : undefined
      }
      secondaryAction={
        query ? (
          <Button variant="ghost" size="sm" onClick={onClearSearch}>
            Clear search
          </Button>
        ) : undefined
      }
    />
  );
}

export interface NoAccessEmptyProps extends SharedEmptyProps {
  /** What the viewer cannot see. */
  resource?: string;
  /** Who can grant access. */
  owner?: string;
  /** Called on "Request access"; may return a promise (the button shows a spinner). */
  onRequestAccess?: () => void | Promise<void>;
  /** Start in the "requested" state (e.g. a pending request exists). */
  defaultRequested?: boolean;
}

/** Permission state: the viewer lacks access; explains who can grant it and lets them ask. */
export function NoAccessEmpty({
  resource = noAccessSample.resource,
  owner = noAccessSample.owner,
  onRequestAccess,
  defaultRequested = false,
  titleAs,
  bordered = true,
  className,
}: NoAccessEmptyProps) {
  const [state, setState] = useState<'idle' | 'pending' | 'requested'>(defaultRequested ? 'requested' : 'idle');
  const request = async () => {
    setState('pending');
    try {
      await onRequestAccess?.();
      setState('requested');
    } catch {
      setState('idle');
    }
  };
  return (
    <EmptyState
      icon={Lock}
      titleAs={titleAs}
      bordered={bordered}
      className={cn('mx-auto', className)}
      title={`You don’t have access to ${resource}`}
      description={`Ask ${owner} to grant you a role that includes ${resource.toLowerCase()} permissions.`}
      primaryAction={
        <Button
          variant={state === 'requested' ? 'secondary' : 'primary'}
          icon={state === 'requested' ? Check : undefined}
          loading={state === 'pending'}
          disabled={state === 'requested'}
          onClick={() => void request()}
        >
          {state === 'requested' ? 'Access requested' : 'Request access'}
        </Button>
      }
    >
      <p role="status" className="sr-only">
        {state === 'requested' ? 'Access request sent' : ''}
      </p>
    </EmptyState>
  );
}
