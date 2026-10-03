import { SettingsRow } from '@gntik-ai/blocks';
import { Section, SimpleSelect, ThemeSwitcher, Toggle, ToggleGroup, useTheme } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { THEME_LABELS, densities, languages as defaultLanguages, type Density, type LanguageOption } from './data';

export interface SettingsAppearanceProps extends SettingsFrameOptions {
  density: Density;
  onDensityChange: (density: Density) => void;
  language: string;
  languages: LanguageOption[];
  onLanguageChange: (language: string) => void;
}

/**
 * Appearance settings: ThemeSwitcher (reads and sets the mode through useTheme, so it needs the
 * app's ThemeProvider), density ToggleGroup and language Select, laid out as SettingsRows.
 */
export default function SettingsAppearancePage({
  density: initialDensity = 'comfortable',
  onDensityChange,
  language: initialLanguage = 'en',
  languages = defaultLanguages,
  onLanguageChange,
  ...frame
}: Partial<SettingsAppearanceProps>) {
  const { mode, resolved } = useTheme();
  const [density, setDensity] = useState<Density>(initialDensity);
  const [language, setLanguage] = useState(initialLanguage);

  return (
    <SettingsFrame page="appearance" description="How the interface looks on this device. Saved automatically." {...frame}>
      <Section title="Display" divided>
        <SettingsRow
          label="Theme"
          description={mode === 'system' ? `Follows your system setting (now ${THEME_LABELS[resolved]}).` : 'Dark is the default. High contrast strengthens borders and text.'}
          control={<ThemeSwitcher label="Theme" />}
        />
        <SettingsRow
          label="Density"
          description="Compact fits more rows in tables and lists."
          control={({ labelId, descriptionId }) => (
            <ToggleGroup
              size="sm"
              aria-labelledby={labelId}
              aria-describedby={descriptionId}
              value={[density]}
              onValueChange={(v) => {
                const next = v[0] as Density | undefined;
                if (!next) return;
                setDensity(next);
                onDensityChange?.(next);
              }}
            >
              {densities.map((d) => (
                <Toggle key={d.value} value={d.value}>
                  {d.label}
                </Toggle>
              ))}
            </ToggleGroup>
          )}
        />
        <SettingsRow
          label="Language"
          description="Used for menus, emails and dates."
          control={
            <SimpleSelect
              aria-label="Language"
              size="sm"
              items={languages}
              value={language}
              onValueChange={(v) => {
                if (v == null) return;
                setLanguage(v);
                onLanguageChange?.(v);
              }}
              className="w-44"
            />
          }
        />
      </Section>
    </SettingsFrame>
  );
}
