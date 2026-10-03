'use client';
import {
  SettingsApiKeysPage,
  SettingsAppearancePage,
  SettingsBillingPage,
  SettingsIntegrationsPage,
  SettingsNotificationsPage,
  SettingsSecurityPage,
  SettingsWorkspacePage,
} from '@gntik-ai/templates';
import { shellFor } from '../../../../data/console';
import { apiKeysAt, deliveriesAt, endpointsAt, sessionsAt, type SettingsSection } from '../../../../data/settings';

export function SettingsSectionView({ section, now }: { section: SettingsSection; now: number }) {
  const frame = { basePath: '/settings', shell: shellFor('/settings/profile') };
  switch (section) {
    case 'security':
      return <SettingsSecurityPage {...frame} sessions={sessionsAt(now)} />;
    case 'notifications':
      return <SettingsNotificationsPage {...frame} />;
    case 'appearance':
      return <SettingsAppearancePage {...frame} />;
    case 'workspace':
      return <SettingsWorkspacePage {...frame} />;
    case 'billing':
      return <SettingsBillingPage {...frame} />;
    case 'api-keys':
      return <SettingsApiKeysPage {...frame} keys={apiKeysAt(now)} />;
    case 'integrations':
      return <SettingsIntegrationsPage {...frame} endpoints={endpointsAt(now)} deliveries={deliveriesAt(now)} />;
  }
}
