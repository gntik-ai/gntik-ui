import { memberRoles, type BillingPlan, type Invitation, type Invoice, type Member, type PaymentMethod, type Profile, type Quota } from '@gntik-ai/blocks';
import { Building2, CalendarDays, Mail, MapPin } from '@gntik-ai/icons';
import type { SettingsMembersPage, SettingsProfilePage } from '@gntik-ai/templates';
import type { ItemOf, PropOf } from './types';

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

// ---- Profile ----

export const profile: Profile = {
  name: 'Alex Rivera',
  role: 'Owner',
  headline: 'Founder · runs the Acme workspace',
  meta: [
    { icon: Mail, label: 'alex@acme.example' },
    { icon: Building2, label: 'Acme Inc.' },
    { icon: MapPin, label: 'Lisbon, Portugal' },
    { icon: CalendarDays, label: 'Joined January 2026' },
  ],
};

export const profileValues: PropOf<typeof SettingsProfilePage, 'values'> = {
  name: 'Alex Rivera',
  email: 'alex@acme.example',
  locale: 'en-US',
  timeZone: 'Europe/Lisbon',
};

// ---- Members ----

export const members: Member[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@acme.example', role: 'owner', lastActive: ago(1) },
  { id: 'u2', name: 'Jamie Chen', email: 'jamie@acme.example', role: 'admin', lastActive: ago(40) },
  { id: 'u3', name: 'Sam Okafor', email: 'sam@acme.example', role: 'member', lastActive: ago(60 * 20) },
  { id: 'u4', name: 'Priya Shah', email: 'priya@acme.example', role: 'member', lastActive: ago(60 * 24 * 3) },
];

export const invitations: Invitation[] = [
  { id: 'i1', email: 'morgan@acme.example', role: 'Member', invitedBy: 'Priya Shah', invitedAt: inDays(-1), expiresAt: inDays(6) },
  { id: 'i2', email: 'taylor@acme.example', role: 'Viewer', invitedBy: 'Alex Rivera', invitedAt: inDays(-8), expiresAt: inDays(-1) },
];

export const roles = memberRoles;

export const permissions: ItemOf<typeof SettingsMembersPage, 'permissions'>[] = [
  { id: 'view', label: 'View projects', roles: ['owner', 'admin', 'member', 'viewer'] },
  { id: 'create', label: 'Create and change projects', roles: ['owner', 'admin', 'member'] },
  { id: 'members', label: 'Invite and remove members', roles: ['owner', 'admin'] },
  { id: 'billing', label: 'Manage billing and plans', roles: ['owner'] },
  { id: 'delete', label: 'Delete the workspace', roles: ['owner'] },
];

// ---- Billing ----

export const plan: BillingPlan = {
  name: 'Team',
  status: 'active',
  priceMonthly: 49,
  priceAnnual: 39,
  currency: 'USD',
  renewsOn: inDays(18),
  summary: '10 seats · 1 region',
  features: ['Unlimited projects', '1M requests / month', '50 GB storage', 'Email support'],
};

export const quotas: Quota[] = [
  { id: 'requests', label: 'Requests', used: 612_400, limit: 1_000_000, projected: 880_000, unit: 'requests' },
  { id: 'storage', label: 'Storage', used: 21.4, limit: 50, projected: 26, unit: 'GB' },
  { id: 'seats', label: 'Seats', used: 4, limit: 10, projected: 5, unit: 'seats' },
];

export const paymentMethod: PaymentMethod = { brand: 'Visa', last4: '4242', expMonth: 4, expYear: 2029, holder: 'Acme Inc.', isDefault: true, status: 'valid' };

export const invoices: Invoice[] = [
  { id: 'inv9', number: 'INV-2026-0009', date: '2026-09-01', amount: 49, status: 'paid' },
  { id: 'inv8', number: 'INV-2026-0008', date: '2026-08-01', amount: 49, status: 'paid' },
  { id: 'inv7', number: 'INV-2026-0007', date: '2026-07-01', amount: 49, status: 'paid' },
  { id: 'inv6', number: 'INV-2026-0006', date: '2026-06-01', amount: 0, status: 'void' },
];
