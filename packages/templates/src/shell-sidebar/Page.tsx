import { FirstRunEmpty, PageHeader } from '@gntik-ai/blocks';
import { Page, type BreadcrumbItem, type NavGroup, type UserMenuUser, type Workspace } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { ConsoleShell } from '../shared/ConsoleShell';
import { shellSidebarBreadcrumbs, shellSidebarCopy, shellSidebarNav, shellSidebarUser, shellSidebarWorkspaces } from './data';

export interface ShellSidebarPageProps {
  nav: NavGroup[];
  currentHref: string;
  breadcrumbs: BreadcrumbItem[] | null;
  workspaces: Workspace[] | null;
  user: UserMenuUser | null;
  title: ReactNode;
  description: ReactNode;
  emptyTitle: ReactNode;
  emptyDescription: ReactNode;
  emptyActionLabel: string;
  emptySteps: string[];
  /** Primary action of the empty state. */
  onCreate: () => void;
  /** Replaces the empty state with real page content. */
  children: ReactNode;
}

/** Console starter: ConsoleShell around an empty Page (title, description, first-run state). */
export default function ShellSidebarPage({
  nav = shellSidebarNav,
  currentHref = shellSidebarCopy.currentHref,
  breadcrumbs = shellSidebarBreadcrumbs,
  workspaces = shellSidebarWorkspaces,
  user = shellSidebarUser,
  title = shellSidebarCopy.title,
  description = shellSidebarCopy.description,
  emptyTitle = shellSidebarCopy.emptyTitle,
  emptyDescription = shellSidebarCopy.emptyDescription,
  emptyActionLabel = shellSidebarCopy.emptyActionLabel,
  emptySteps = shellSidebarCopy.emptySteps,
  onCreate,
  children,
}: Partial<ShellSidebarPageProps>) {
  return (
    <ConsoleShell nav={nav} currentHref={currentHref} breadcrumbs={breadcrumbs} workspaces={workspaces} user={user}>
      <Page header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} actions={[]} tabs={null} />}>
        {children ?? (
          <FirstRunEmpty
            titleAs="h2"
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onCreate}
            steps={emptySteps}
          />
        )}
      </Page>
    </ConsoleShell>
  );
}
