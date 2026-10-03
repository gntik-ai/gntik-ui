import {
  Breadcrumbs,
  Button,
  MoreMenu,
  StatusTag,
  Tabs,
  TabsList,
  TabsTab,
  cn,
  type BreadcrumbItem,
  type StatusDefinition,
} from '@gntik-ai/ui';
import type { LucideIcon } from '@gntik-ai/icons';
import type { ReactNode } from 'react';
import { toMenuAction, type PageChromeAction } from '../types';
import { pageHeaderActions, pageHeaderBreadcrumbs, pageHeaderMeta, pageHeaderTabs } from './fixtures';

export interface PageHeaderMetaItem {
  /** Term (screen-reader only when an icon is shown). */
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  /** Render the value in Geist Mono (ids, regions, versions). */
  mono?: boolean;
}

export interface PageHeaderTab {
  value: string;
  label: string;
  count?: number;
}

export interface PageHeaderProps {
  /** Location trail above the title; `null` hides it. */
  breadcrumbs?: BreadcrumbItem[] | null;
  title?: ReactNode;
  description?: ReactNode;
  /** StatusTag key next to the title (e.g. `active`, `paused`, `failed`). */
  status?: string;
  statuses?: Record<string, StatusDefinition>;
  /** Meta row under the description. */
  meta?: PageHeaderMetaItem[];
  /**
   * Header actions in visual order. The primary one (first with `variant: 'primary'`, else the
   * last) stays visible on small screens; the rest fold into a MoreMenu.
   */
  actions?: PageChromeAction[];
  /** Resource-level navigation tabs under the header; `null` hides them. */
  tabs?: PageHeaderTab[] | null;
  tab?: string;
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

/** Screen header: breadcrumb, title + status, description, meta row, actions and optional tabs. */
export function PageHeader({
  breadcrumbs = pageHeaderBreadcrumbs,
  title = 'Deployments',
  description = 'Every build and release of this project across its environments.',
  status = 'active',
  statuses,
  meta = pageHeaderMeta,
  actions = pageHeaderActions,
  tabs = pageHeaderTabs,
  tab,
  defaultTab,
  onTabChange,
  className,
}: PageHeaderProps) {
  const explicitPrimary = actions.findIndex((a) => a.variant === 'primary');
  const primaryIndex = explicitPrimary >= 0 ? explicitPrimary : actions.length - 1;
  const primary = actions[primaryIndex];
  const folded = actions.filter((_, i) => i !== primaryIndex);

  const renderAction = (action: PageChromeAction, index: number) => (
    <Button
      key={action.id ?? action.label}
      variant={action.variant ?? (index === primaryIndex ? 'primary' : 'secondary')}
      icon={action.icon}
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );

  return (
    <header className={cn('min-w-0', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} maxItems={4} className="mb-2.5" />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {status && <StatusTag status={status} statuses={statuses} />}
          </div>
          {description != null && <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted-foreground">{description}</p>}
          {meta.length > 0 && (
            <dl className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted-foreground">
              {meta.map(({ label, value, icon: Icon, mono }) => (
                <div key={label} className="inline-flex items-center gap-1.5">
                  {Icon && <Icon size={14} aria-hidden />}
                  <dt className={cn(Icon && 'sr-only')}>{label}</dt>
                  <dd className={cn('text-foreground', mono && 'font-mono text-[12px]')}>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {actions.length > 0 && (
          <>
            <div className="hidden shrink-0 items-center gap-2.5 sm:flex">{actions.map(renderAction)}</div>
            <div className="flex shrink-0 items-center gap-2 sm:hidden">
              {folded.length > 0 && <MoreMenu items={folded.map(toMenuAction)} label="More actions" />}
              {primary && renderAction(primary, primaryIndex)}
            </div>
          </>
        )}
      </div>
      {tabs && tabs.length > 0 && (
        <Tabs
          value={tab}
          defaultValue={defaultTab ?? tabs[0]?.value}
          onValueChange={(value) => onTabChange?.(String(value))}
          className="mt-5"
        >
          <TabsList aria-label="Page sections" className="overflow-x-auto">
            {tabs.map((t) => (
              <TabsTab key={t.value} value={t.value} count={t.count}>
                {t.label}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      )}
    </header>
  );
}
