import {
  SettingsApiKeysPage,
  SettingsAppearancePage,
  SettingsBillingPage,
  SettingsIntegrationsPage,
  SettingsMembersPage,
  SettingsNotificationsPage,
  SettingsProfilePage,
  SettingsSecurityPage,
  SettingsWorkspacePage,
} from '@gntik-ai/templates';
import type { ComponentType } from 'react';
import { invitations, invoices, members, paymentMethod, permissions, plan, profile, profileValues, quotas, roles } from '../data/account';
import { shell } from '../shell';
import { NotFound } from './status';

/** Props every settings template takes: the section nav renders links under /settings. */
const frame = (currentHref = '/settings') => ({ basePath: '/settings', shell: shell(currentHref) });

const pages: Record<string, ComponentType> = {
  profile: () => <SettingsProfilePage profile={profile} values={profileValues} {...frame()} />,
  members: () => <SettingsMembersPage members={members} invitations={invitations} roles={roles} permissions={permissions} currentUserId="u1" {...frame('/settings/members')} />,
  billing: () => <SettingsBillingPage plan={plan} quotas={quotas} paymentMethod={paymentMethod} invoices={invoices} {...frame('/settings/billing')} />,
  appearance: () => <SettingsAppearancePage {...frame()} />,
  // The rest of the settings nav, on the templates' neutral sample data until the product wires them.
  security: () => <SettingsSecurityPage {...frame()} />,
  notifications: () => <SettingsNotificationsPage {...frame()} />,
  workspace: () => <SettingsWorkspacePage {...frame()} />,
  'api-keys': () => <SettingsApiKeysPage {...frame()} />,
  integrations: () => <SettingsIntegrationsPage {...frame()} />,
};

export function Settings({ page }: { page: string }) {
  const Page = pages[page];
  return Page ? <Page /> : <NotFound />;
}
