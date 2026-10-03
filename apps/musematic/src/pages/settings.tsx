import { ModelKeysList, PageHeader } from '@gntik-ai/blocks';
import { Bell, Building2, CreditCard, KeyRound, Palette, Plug, ShieldCheck, Sparkles, User, Users } from '@gntik-ai/icons';
import {
  ConsoleShell,
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
import { SettingsLayout, type NavGroup } from '@gntik-ai/ui';
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
import { currentUserId } from '../data/workspace';
import { navigate } from '../router';
import { shellFor } from '../shell';
import { NotFound } from './not-found';

const BASE = '/settings';
const frame = { basePath: BASE, onNavigate: (page: string) => navigate(`${BASE}/${page}`), shell: shellFor(BASE) };

const PAGES: Record<string, () => ReactNode> = {
  profile: () => <SettingsProfilePage {...frame} profile={profile} values={profileValues} />,
  security: () => <SettingsSecurityPage {...frame} />,
  notifications: () => <SettingsNotificationsPage {...frame} events={notificationEvents} value={notificationValue} />,
  appearance: () => <SettingsAppearancePage {...frame} />,
  workspace: () => (
    <SettingsWorkspacePage {...frame} values={workspaceValues} regions={workspaceRegions} urlPrefix="app.musematic.ai/" onDangerAction={(id) => (id === 'delete' ? navigate('/sign-in') : undefined)} />
  ),
  members: () => <SettingsMembersPage {...frame} members={members} invitations={invitations} permissions={rolePermissions} currentUserId={currentUserId} />,
  billing: () => <SettingsBillingPage {...frame} plan={plan} quotas={quotas} paymentMethod={paymentMethod} invoices={invoices} currency="USD" />,
  'api-keys': () => <SettingsApiKeysPage {...frame} keys={apiKeys} scopes={apiScopes} />,
  integrations: () => <SettingsIntegrationsPage {...frame} connectors={connectors} endpoints={webhookEndpoints} deliveries={webhookDeliveries} />,
  'model-keys': () => <ModelKeysSettings />,
};

/** The settings section nav plus musematic's "Model keys" page. */
const settingsGroups: NavGroup[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: User, href: `${BASE}/profile` },
      { id: 'security', label: 'Security', icon: ShieldCheck, href: `${BASE}/security` },
      { id: 'notifications', label: 'Notifications', icon: Bell, href: `${BASE}/notifications` },
      { id: 'appearance', label: 'Appearance', icon: Palette, href: `${BASE}/appearance` },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'workspace', label: 'Workspace', icon: Building2, href: `${BASE}/workspace` },
      { id: 'members', label: 'Members', icon: Users, href: `${BASE}/members` },
      { id: 'billing', label: 'Billing', icon: CreditCard, href: `${BASE}/billing` },
      { id: 'api-keys', label: 'API keys', icon: KeyRound, href: `${BASE}/api-keys` },
      { id: 'model-keys', label: 'Model keys', icon: Sparkles, href: `${BASE}/model-keys` },
      { id: 'integrations', label: 'Integrations', icon: Plug, href: `${BASE}/integrations` },
    ],
  },
];

/** Model keys: ConsoleShell + SettingsLayout (embedded) + PageHeader + ModelKeysList. */
function ModelKeysSettings() {
  return (
    <ConsoleShell {...shellFor('/settings/model-keys')} breadcrumbs={[{ label: 'Settings', href: BASE }, { label: 'Model keys' }]}>
      <SettingsLayout
        embedded
        groups={settingsGroups}
        value="model-keys"
        onValueChange={(key) => navigate(`${BASE}/${key}`)}
        mainId="settings-content"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Model keys"
            description="Provider keys and compatible endpoints your agents run on. Secrets stay masked; test a key before routing traffic to it."
            status=""
            meta={[]}
            tabs={null}
            actions={[]}
          />
        }
      >
        <ModelKeysList keys={modelKeys} title="Providers" onAdd={() => undefined} />
      </SettingsLayout>
    </ConsoleShell>
  );
}

export function Settings({ page }: { page: string }) {
  const render = PAGES[page];
  return render ? <>{render()}</> : <NotFound />;
}
