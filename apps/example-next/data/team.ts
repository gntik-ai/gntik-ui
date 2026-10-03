import type { Invitation, Member, Profile } from '@gntik-ai/blocks';
import { Building2, Mail, MapPin } from '@gntik-ai/icons';
import type { SettingsProfilePage } from '@gntik-ai/templates';
import type { ComponentProps } from 'react';

/** Dates relative to `now` (request time, passed by the Server Component) so SSR and hydration agree. */
const ago = (now: number, minutes: number) => new Date(now - minutes * 60_000).toISOString();
const inDays = (now: number, d: number) => new Date(now + d * 86_400_000).toISOString();

export const currentUserId = 'm1';

export const membersAt = (now: number): Member[] => [
  { id: 'm1', name: 'Alex Morgan', email: 'alex@example.com', role: 'owner', lastActive: ago(now, 1) },
  { id: 'm2', name: 'Jamie Fox', email: 'jamie@example.com', role: 'admin', lastActive: ago(now, 70) },
  { id: 'm3', name: 'Kim Ito', email: 'kim@example.com', role: 'member', lastActive: ago(now, 60 * 30) },
  { id: 'm4', name: 'Sasha Novak', email: 'sasha@example.com', role: 'viewer', lastActive: null },
];

export const invitationsAt = (now: number): Invitation[] => [
  { id: 'i1', email: 'robin@example.com', role: 'Member', invitedBy: 'Alex Morgan', invitedAt: inDays(now, -1), expiresAt: inDays(now, 6) },
];

export const profile: Profile = {
  name: 'Alex Morgan',
  role: 'Owner',
  headline: 'Engineering lead',
  meta: [
    { icon: Mail, label: 'alex@example.com' },
    { icon: Building2, label: 'Northwind' },
    { icon: MapPin, label: 'Remote' },
  ],
};

export const profileValues: NonNullable<ComponentProps<typeof SettingsProfilePage>['values']> = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  locale: 'en-US',
  timeZone: 'UTC',
};
