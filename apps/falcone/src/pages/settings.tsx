import { ModelKeysList } from '@gntik-ai/blocks';
import { Sparkles } from '@gntik-ai/icons';
import {
  SettingsApiKeysPage,
  SettingsAppearancePage,
  SettingsBillingPage,
  SettingsFrame,
  SettingsIntegrationsPage,
  SettingsMembersPage,
  SettingsNotificationsPage,
  SettingsProfilePage,
  SettingsSecurityPage,
  SettingsWorkspacePage,
  type SettingsFrameOptions,
  type SettingsNavExtraItem,
} from '@gntik-ai/templates';
import type { ReactNode } from 'react';
import { modelKeys } from '../data/model-keys';
import {
  apiKeys,
  apiScopes,
  connectors,
  invitations,
  invoices,
  members,
  notificationEvents,
  notificationValue,
  paymentMethod,
  plan,
  profile,
  profileValues,
  quotas,
  rolePermissions,
  webhookDeliveries,
  webhookEndpoints,
  workspaceRegions,
  workspaceValues,
} from '../data/settings';
import { currentUserId } from '../data/tenant';
import { navigate } from '../router';
import { shellFor } from '../shell';
import { NotFound } from './not-found';

const BASE = '/settings';

/** Falcone's own settings page, added to the shared settings nav. */
const extraNavItems: SettingsNavExtraItem[] = [{ id: 'model-providers', label: 'Model providers', icon: Sparkles }];

const frame = (page: string): SettingsFrameOptions => ({
  basePath: BASE,
  onNavigate: (next) => navigate(`${BASE}/${next}`),
  extraNavItems,
  shell: { ...shellFor(page === 'model-providers' ? `${BASE}/model-providers` : BASE) },
});

const PAGES: Record<string, () => ReactNode> = {
  profile: () => <SettingsProfilePage {...frame('profile')} profile={profile} values={profileValues} />,
  security: () => <SettingsSecurityPage {...frame('security')} />,
  notifications: () => <SettingsNotificationsPage {...frame('notifications')} events={notificationEvents} value={notificationValue} />,
  appearance: () => <SettingsAppearancePage {...frame('appearance')} />,
  workspace: () => (
    <SettingsWorkspacePage
      {...frame('workspace')}
      values={workspaceValues}
      regions={workspaceRegions}
      urlPrefix="console.falcone.dev/"
      onDangerAction={(id) => (id === 'delete' ? navigate('/sign-in') : undefined)}
    />
  ),
  members: () => <SettingsMembersPage {...frame('members')} members={members} invitations={invitations} permissions={rolePermissions} currentUserId={currentUserId} />,
  billing: () => <SettingsBillingPage {...frame('billing')} plan={plan} quotas={quotas} paymentMethod={paymentMethod} invoices={invoices} currency="USD" />,
  'api-keys': () => <SettingsApiKeysPage {...frame('api-keys')} keys={apiKeys} scopes={apiScopes} />,
  integrations: () => <SettingsIntegrationsPage {...frame('integrations')} connectors={connectors} endpoints={webhookEndpoints} deliveries={webhookDeliveries} />,
  'model-providers': () => (
    <SettingsFrame
      {...frame('model-providers')}
      page="model-providers"
      description="Bring-your-own-key LLM providers this tenant's functions call. Usage is metered per tenant; secrets stay masked. Test a key before routing traffic to it."
    >
      <ModelKeysList keys={modelKeys} title="Providers" onAdd={() => undefined} />
    </SettingsFrame>
  ),
};

export function Settings({ page }: { page: string }) {
  const render = PAGES[page];
  return render ? <>{render()}</> : <NotFound />;
}
