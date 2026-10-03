import { sampleProfile, type Profile } from '@gntik-ai/blocks';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  locale: string;
  timeZone: string;
}

export const profile: Profile = sampleProfile;

export const profileValues: ProfileFormValues = {
  name: 'Avery Collins',
  email: 'avery@example.com',
  locale: 'en-GB',
  timeZone: 'Europe/Lisbon',
};

export const locales: SelectOption[] = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'fr-FR', label: 'French (France)' },
];

export const timeZones: SelectOption[] = [
  { value: 'America/Los_Angeles', label: '(UTC−08:00) Pacific Time' },
  { value: 'America/New_York', label: '(UTC−05:00) Eastern Time' },
  { value: 'UTC', label: '(UTC±00:00) Coordinated Universal Time' },
  { value: 'Europe/Lisbon', label: '(UTC±00:00) Lisbon' },
  { value: 'Europe/Madrid', label: '(UTC+01:00) Madrid' },
  { value: 'Europe/Berlin', label: '(UTC+01:00) Berlin' },
  { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore' },
];
