import type { UserMenuUser, Workspace } from '@gntik-ai/ui';

/** The signed-in operator. */
export const currentUser: UserMenuUser = { name: 'Ingrid Halvorsen', email: 'ingrid@northwind-labs.io' };
export const currentUserId = 'm1';

/** Tenants this operator can switch between (the sidebar switcher). */
export const tenants: Workspace[] = [
  { id: 'northwind', name: 'Northwind Labs', meta: 'Scale plan · eu-west' },
  { id: 'acme-retail', name: 'Acme Retail', meta: 'Growth plan · us-east' },
  { id: 'kestrel', name: 'Kestrel Health', meta: 'Enterprise · eu-central' },
];

export const currentTenant = { id: 'northwind', name: 'Northwind Labs', slug: 'northwind-labs', region: 'eu-west' };
