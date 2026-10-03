export type Density = 'comfortable' | 'compact';

export interface LanguageOption {
  value: string;
  label: string;
}

export const densities: Array<{ value: Density; label: string }> = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

export const languages: LanguageOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

export const THEME_LABELS = { dark: 'Dark', light: 'Light', high_contrast: 'High contrast' } as const;
