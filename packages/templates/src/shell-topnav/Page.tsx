import { AppTopbar, FirstRunEmpty, PageHeader } from '@gntik-ai/blocks';
import { Logo, Stack, StackedLayout, type NavItem, type NotificationItem, type UserMenuUser } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { shellTopnavCopy, shellTopnavLinks, shellTopnavNotifications, shellTopnavUser } from './data';

export interface ShellTopnavPageProps {
  /** Brand at the start of the navbar; defaults to the preset Logo with wordmark. */
  brand: ReactNode;
  links: NavItem[];
  /** Initial current link (uncontrolled). */
  defaultHref: string;
  onNavigate: (item: NavItem) => void;
  user: UserMenuUser | null;
  notifications: NotificationItem[] | null;
  onSignOut: () => void;
  title: ReactNode;
  description: ReactNode;
  emptyTitle: ReactNode;
  emptyDescription: ReactNode;
  emptyActionLabel: string;
  emptySteps: string[];
  onCreate: () => void;
  footer: ReactNode;
  /** Replaces the empty state with real page content. */
  children: ReactNode;
}

/** Top-navigation starter: StackedLayout with brand, links, AppTopbar actions, a PageHeader and an empty body. */
export default function ShellTopnavPage({
  brand = <Logo size={24} wordmark />,
  links = shellTopnavLinks,
  defaultHref = shellTopnavCopy.currentHref,
  onNavigate,
  user = shellTopnavUser,
  notifications = shellTopnavNotifications,
  onSignOut,
  title = shellTopnavCopy.title,
  description = shellTopnavCopy.description,
  emptyTitle = shellTopnavCopy.emptyTitle,
  emptyDescription = shellTopnavCopy.emptyDescription,
  emptyActionLabel = shellTopnavCopy.emptyActionLabel,
  emptySteps = shellTopnavCopy.emptySteps,
  onCreate,
  footer = shellTopnavCopy.footer,
  children,
}: Partial<ShellTopnavPageProps>) {
  const [current, setCurrent] = useState(defaultHref);
  return (
    <StackedLayout
      fullScreen
      brand={brand}
      links={links}
      currentHref={current}
      onNavigate={(item) => {
        if (item.href) setCurrent(item.href);
        onNavigate?.(item);
      }}
      mobileTitle="Navigation"
      actions={<AppTopbar breadcrumbs={null} environment={null} notifications={notifications} user={user} onSignOut={onSignOut} />}
      footer={footer}
    >
      {/* PageHeader renders a <header>: inside <main> it is not a second banner landmark. */}
      <Stack gap={6}>
        <PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} actions={[]} tabs={null} />
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
      </Stack>
    </StackedLayout>
  );
}
