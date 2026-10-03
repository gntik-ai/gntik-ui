import { PageHeader, type PageChromeAction } from '@gntik-ai/blocks';
import { SettingsLayout, type SettingsLayoutProps } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { SETTINGS_TITLES, settingsBreadcrumbs, settingsNav, type SettingsPageId } from './settings-nav';

/** Props every settings template accepts for the frame around its content. */
export interface SettingsFrameOptions {
  /** Route base for the section nav (e.g. "/settings" → links). Without it the items are buttons. */
  basePath?: string;
  /** Called when another settings section is chosen. */
  onNavigate?: (page: SettingsPageId) => void;
  /** ConsoleShell props (app nav, user, workspaces, topbar). */
  shell?: Omit<ConsoleShellProps, 'children'>;
}

export interface SettingsFrameProps extends SettingsFrameOptions {
  page: SettingsPageId;
  description?: ReactNode;
  /** Header actions (PageHeader). */
  actions?: PageChromeAction[];
  width?: SettingsLayoutProps['width'];
  children: ReactNode;
}

/**
 * Glue shared by the settings templates: ConsoleShell with SettingsLayout in its main area,
 * the nine-page section nav (current page selected) and a PageHeader as the layout header.
 * SettingsLayout is `embedded`: ConsoleShell already owns <main> and the skip link.
 */
export function SettingsFrame({ page, description, actions = [], width, basePath, onNavigate, shell, children }: SettingsFrameProps) {
  return (
    <ConsoleShell currentHref="/settings" breadcrumbs={settingsBreadcrumbs(page)} {...shell}>
      <SettingsLayout
        embedded
        groups={settingsNav(basePath)}
        value={page}
        onValueChange={(key) => onNavigate?.(key as SettingsPageId)}
        mainId="settings-content"
        width={width}
        header={<PageHeader breadcrumbs={null} title={SETTINGS_TITLES[page]} description={description} status="" meta={[]} tabs={null} actions={actions} />}
      >
        {children}
      </SettingsLayout>
    </ConsoleShell>
  );
}
