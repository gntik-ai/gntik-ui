import { PageHeader, type PageChromeAction } from '@gntik-ai/blocks';
import { SettingsLayout, type SettingsLayoutProps } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { settingsBreadcrumbs, settingsNav, settingsTitle, type SettingsNavExtraItem, type SettingsPageId } from './settings-nav';

/** Props every settings template accepts for the frame around its content. */
export interface SettingsFrameOptions {
  /** Route base for the section nav (e.g. "/settings" → links). Without it the items are buttons. */
  basePath?: string;
  /**
   * Called when another settings section is chosen (a built-in page id, or the id of one of
   * `extraNavItems`).
   */
  // Method syntax keeps `(page: SettingsPageId) => void` handlers assignable.
  onNavigate?(page: SettingsPageId | (string & {})): void;
  /** The product's own settings pages, added to the section nav (see `settingsNav`). */
  extraNavItems?: readonly SettingsNavExtraItem[];
  /** ConsoleShell props (app nav, user, workspaces, topbar). */
  shell?: Omit<ConsoleShellProps, 'children'>;
}

export interface SettingsFrameProps extends SettingsFrameOptions {
  /** Current page: a built-in id or the id of an extra nav item. */
  page: SettingsPageId | (string & {});
  /** Header title; defaults to the built-in page title or the extra item's label. */
  title?: ReactNode;
  description?: ReactNode;
  /** Header actions (PageHeader). */
  actions?: PageChromeAction[];
  width?: SettingsLayoutProps['width'];
  children: ReactNode;
}

/**
 * Glue shared by the settings templates: ConsoleShell with SettingsLayout in its main area,
 * the nine-page section nav plus any `extraNavItems` (current page selected) and a PageHeader as the layout header.
 * SettingsLayout is `embedded`: ConsoleShell already owns <main> and the skip link.
 */
export function SettingsFrame({ page, title, description, actions = [], width, basePath, onNavigate, extraNavItems, shell, children }: SettingsFrameProps) {
  const label = extraNavItems?.find((i) => i.id === page)?.label ?? settingsTitle(page);
  return (
    <ConsoleShell currentHref="/settings" breadcrumbs={settingsBreadcrumbs(page, label)} {...shell}>
      <SettingsLayout
        embedded
        groups={settingsNav(basePath, extraNavItems)}
        value={page}
        onValueChange={(key) => onNavigate?.(key)}
        mainId="settings-content"
        width={width}
        header={<PageHeader breadcrumbs={null} title={title ?? label} description={description} status="" meta={[]} tabs={null} actions={actions} />}
      >
        {children}
      </SettingsLayout>
    </ConsoleShell>
  );
}
