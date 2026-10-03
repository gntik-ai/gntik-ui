import { Building2, Globe, KeyRound, type LucideIcon } from '@gntik-ai/icons';

export interface SsoProvider {
  id: string;
  /** Full button text, e.g. "Continue with SSO". */
  label: string;
  /** A neutral lucide icon (no brand logos or colours). */
  icon?: LucideIcon;
}

export const ssoProviders: SsoProvider[] = [
  { id: 'sso', label: 'Continue with SSO', icon: Building2 },
  { id: 'google', label: 'Continue with Google', icon: Globe },
  { id: 'passkey', label: 'Continue with a passkey', icon: KeyRound },
];
