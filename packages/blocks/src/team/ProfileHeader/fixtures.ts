import { Building2, CalendarDays, Mail, MapPin, type LucideIcon } from '@gntik-ai/icons';

export interface ProfileMetaItem {
  icon?: LucideIcon;
  label: string;
}

export interface Profile {
  name: string;
  /** Role or title shown as a badge. */
  role?: string;
  /** One-line headline under the name. */
  headline?: string;
  avatarUrl?: string;
  meta?: ProfileMetaItem[];
}

export const profile: Profile = {
  name: 'Avery Collins',
  role: 'Owner',
  headline: 'Platform lead · keeps deployments boring',
  meta: [
    { icon: Mail, label: 'avery@example.com' },
    { icon: Building2, label: 'Platform team' },
    { icon: MapPin, label: 'Lisbon, Portugal' },
    { icon: CalendarDays, label: 'Joined March 2024' },
  ],
};
