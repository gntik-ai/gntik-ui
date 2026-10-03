import { Contrast, Monitor, Moon, Sun } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../utils/cn';
import { IconButton, type IconButtonProps } from '../Button';
import { Toggle, ToggleGroup } from '../ToggleGroup';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/messages/en';
import { themeSwitcherVariants } from './theme-switcher.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: IconComponent;
}

/** The four theme modes, in display order. Labels are English defaults; pass `options` to localise. */
export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'high_contrast', label: 'High contrast', icon: Contrast },
  { value: 'system', label: 'System', icon: Monitor },
];

const THEME_KEYS: Record<ThemeMode, MessageKey> = { light: 'theme.light', dark: 'theme.dark', high_contrast: 'theme.highContrast', system: 'theme.system' };

/** `options`, or the four built-in modes with labels from the I18nProvider catalog. */
export function useThemeOptions(options?: ThemeOption[]): ThemeOption[] {
  const { t } = useI18n();
  return options ?? THEME_OPTIONS.map((o) => ({ ...o, label: t(THEME_KEYS[o.value]) }));
}

export interface ThemeSwitcherProps {
  className?: string;
  /** Modes offered (and their labels). Defaults to Light · Dark · High contrast · System. */
  options?: ThemeOption[];
  /** Show text labels next to the icons; when false each option is icon-only with an aria-label. */
  showLabels?: boolean;
  size?: 'sm' | 'md';
  /** Accessible name of the group. */
  label?: string;
}

/**
 * Segmented control (ToggleGroup) bound to `useTheme()`: arrow keys move between options,
 * Enter / Space selects. One option is always pressed.
 */
export function ThemeSwitcher({ className, options: optionsProp, showLabels = true, size = 'sm', label: labelProp }: ThemeSwitcherProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('theme.label');
  const options = useThemeOptions(optionsProp);
  const { mode, setMode } = useTheme();
  const s = themeSwitcherVariants({ labels: showLabels });
  return (
    <ToggleGroup
      aria-label={label}
      size={size}
      value={[mode]}
      onValueChange={(v) => {
        const next = v[0] as ThemeMode | undefined;
        if (next) setMode(next);
      }}
      className={cn(s.group(), className)}
    >
      {options.map(({ value, label: text, icon: IconCmp }) => (
        <Toggle key={value} value={value} iconOnly={!showLabels} aria-label={showLabels ? undefined : text} className={s.option()}>
          <IconCmp size={14} aria-hidden className={s.optionIcon()} />
          {showLabels && text}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

export interface ThemeCycleButtonProps extends Omit<IconButtonProps, 'icon' | 'label' | 'onClick'> {
  /** Modes to cycle through, in order. */
  options?: ThemeOption[];
  /** Builds the accessible name from the current and next option. */
  getLabel?: (current: ThemeOption, next: ThemeOption) => string;
}


/** Compact icon button for toolbars: shows the current mode's icon and cycles to the next on click. */
export function ThemeCycleButton({ options: optionsProp, getLabel, variant = 'secondary', ...props }: ThemeCycleButtonProps) {
  const { t } = useI18n();
  const options = useThemeOptions(optionsProp);
  const label = getLabel ?? ((current: ThemeOption, next: ThemeOption) => t('theme.cycle', { current: current.label, next: next.label }));
  const { mode, setMode } = useTheme();
  const index = Math.max(0, options.findIndex((o) => o.value === mode));
  const current = options[index] ?? THEME_OPTIONS[1]!;
  const next = options[(index + 1) % options.length] ?? current;
  return <IconButton icon={current.icon} label={label(current, next)} variant={variant} onClick={() => setMode(next.value)} {...props} />;
}
