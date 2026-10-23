import { Check, FolderPlus, Lock, SearchX } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import { Button, EmptyState, Link, cn, useI18n } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { firstRunSteps, noAccessSample, noResultsSample, notFoundSample } from './fixtures';

interface SharedEmptyProps {
  /** Heading level that fits the page outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Dashed border around the state (use inside a card or table). */
  bordered?: boolean;
  className?: string;
}

export interface NotFoundEmptyProps extends SharedEmptyProps {
  icon?: LucideIcon;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** Missing resource state; consumers may supply an optional way back. */
export function NotFoundEmpty({
  icon = SearchX,
  title = notFoundSample.title,
  description = notFoundSample.description,
  action,
  titleAs,
  bordered = true,
  className,
}: NotFoundEmptyProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      primaryAction={action}
      titleAs={titleAs}
      bordered={bordered}
      className={cn('mx-auto', className)}
    />
  );
}

export interface FirstRunEmptyLabels {
  title: string;
  description: string;
  action: string;
  guide: string;
}

export interface FirstRunEmptyProps extends SharedEmptyProps {
  /** Per-key copy overrides; explicit props take precedence over labels and catalog defaults. */
  labels?: Partial<FirstRunEmptyLabels>;
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
  title: titleProp,
  labels,
  description: descriptionProp,
  actionLabel: actionLabelProp,
  onAction,
  secondary: secondaryProp,
  steps = firstRunSteps,
  titleAs,
  bordered = true,
  className,
}: FirstRunEmptyProps) {
  const { t } = useI18n();
  const title = titleProp === undefined ? (labels?.title ?? t('emptyState.firstRun.title')) : titleProp;
  const description =
    descriptionProp === undefined ? (labels?.description ?? t('emptyState.firstRun.description')) : descriptionProp;
  const actionLabel = actionLabelProp ?? labels?.action ?? t('emptyState.firstRun.action');
  const secondary =
    secondaryProp === undefined
      ? { label: labels?.guide ?? t('emptyState.firstRun.guide'), href: '#guide' }
      : secondaryProp;
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
          <Link
            underline="hover"
            href={secondary.href}
            className="inline-flex h-9 items-center px-2 text-[13px] font-semibold"
          >
            {secondary.label}
          </Link>
        ) : undefined
      }
    >
      {steps.length > 0 && (
        <ol className="mt-6 grid gap-2 text-start text-[12.5px] text-muted-foreground">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/14 font-mono text-[10.5px] font-semibold text-primary-chip-text">
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

export interface NoResultsEmptyLabels {
  /** Replaces the complete query heading; catalog defaults retain the query’s monospace span. */
  queryTitle: (entity: string, query: string) => string;
  title: (entity: string) => string;
  description: (filterCount: number) => string;
  clearFilters: string;
  clearSearch: string;
}

export interface NoResultsEmptyProps extends SharedEmptyProps {
  /** Per-key overrides; formatter arguments are caller data and results render verbatim. */
  labels?: Partial<NoResultsEmptyLabels>;
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
  labels,
  filterCount = noResultsSample.filterCount,
  entity = noResultsSample.entity,
  onClearFilters,
  onClearSearch,
  titleAs,
  bordered = false,
  className,
}: NoResultsEmptyProps) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={SearchX}
      size="sm"
      titleAs={titleAs}
      bordered={bordered}
      className={cn('mx-auto', className)}
      title={
        query
          ? (labels?.queryTitle?.(entity, query) ?? (
              <>
                {t('emptyState.noResults.queryTitleBefore', { entity })}
                <span className="font-mono">{query}</span>
                {t('emptyState.noResults.queryTitleAfter')}
              </>
            ))
          : (labels?.title?.(entity) ?? t('emptyState.noResults.title', { entity }))
      }
      description={
        labels?.description?.(filterCount) ??
        t('emptyState.noResults.description', { count: filterCount > 0 ? filterCount : 0 })
      }
      primaryAction={
        filterCount > 0 ? (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            {labels?.clearFilters ?? t('emptyState.noResults.clearFilters')}
          </Button>
        ) : undefined
      }
      secondaryAction={
        query ? (
          <Button variant="ghost" size="sm" onClick={onClearSearch}>
            {labels?.clearSearch ?? t('emptyState.noResults.clearSearch')}
          </Button>
        ) : undefined
      }
    />
  );
}

export interface NoAccessEmptyLabels {
  title: (resource: string) => string;
  description: (resource: string, owner: string) => string;
  request: string;
  requested: string;
  sent: string;
}

export interface NoAccessEmptyProps extends SharedEmptyProps {
  /** Per-key overrides; formatters receive the original resource and owner, without translation. */
  labels?: Partial<NoAccessEmptyLabels>;
  /** What the viewer cannot see. */
  resource?: string;
  /** Who can grant access. */
  owner?: string;
  /** Called on "Request access"; may return a promise (the button shows a spinner). */
  onRequestAccess?: () => void | Promise<void>;
  /** Show the request button and its status announcement (default true). */
  showRequestAccess?: boolean;
  /** One href link; secondary to the request button, or primary when the button is hidden. */
  action?: { label: string; href: string };
  /** Start in the "requested" state (e.g. a pending request exists). */
  defaultRequested?: boolean;
}

/** Permission state: the viewer lacks access; explains who can grant it and lets them ask. */
export function NoAccessEmpty({
  resource = noAccessSample.resource,
  labels,
  owner = noAccessSample.owner,
  onRequestAccess,
  showRequestAccess = true,
  action,
  defaultRequested = false,
  titleAs,
  bordered = true,
  className,
}: NoAccessEmptyProps) {
  const { t } = useI18n();
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
  const actionLink = action ? (
    <Link underline="hover" href={action.href} className="inline-flex h-9 items-center px-2 text-[13px] font-semibold">
      {action.label}
    </Link>
  ) : undefined;
  return (
    <EmptyState
      icon={Lock}
      titleAs={titleAs}
      bordered={bordered}
      className={cn('mx-auto', className)}
      title={labels?.title?.(resource) ?? t('emptyState.noAccess.title', { resource })}
      description={
        labels?.description?.(resource, owner) ??
        t('emptyState.noAccess.description', { resource: resource.toLowerCase(), owner })
      }
      primaryAction={
        showRequestAccess ? (
          <Button
            variant={state === 'requested' ? 'secondary' : 'primary'}
            icon={state === 'requested' ? Check : undefined}
            loading={state === 'pending'}
            disabled={state === 'requested'}
            onClick={() => void request()}
          >
            {state === 'requested'
              ? (labels?.requested ?? t('emptyState.noAccess.requested'))
              : (labels?.request ?? t('emptyState.noAccess.request'))}
          </Button>
        ) : (
          actionLink
        )
      }
      secondaryAction={showRequestAccess ? actionLink : undefined}
    >
      {showRequestAccess && (
        <p role="status" className="sr-only">
          {state === 'requested' ? (labels?.sent ?? t('emptyState.noAccess.sent')) : ''}
        </p>
      )}
    </EmptyState>
  );
}
