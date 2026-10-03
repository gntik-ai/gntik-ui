import { Contrast, Monitor, Moon, Sun } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../utils/cn';
import { IconButton, type IconButtonProps } from '../Button';
import { Toggle, ToggleGroup } from '../ToggleGroup';
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
export function ThemeSwitcher({ className, options = THEME_OPTIONS, showLabels = true, size = 'sm', label = 'Theme' }: ThemeSwitcherProps) {
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

const defaultCycleLabel = (current: ThemeOption, next: ThemeOption) => `Theme: ${current.label}. Switch to ${next.label}`;

/** Compact icon button for toolbars: shows the current mode's icon and cycles to the next on click. */
export function ThemeCycleButton({ options = THEME_OPTIONS, getLabel = defaultCycleLabel, variant = 'secondary', ...props }: ThemeCycleButtonProps) {
  const { mode, setMode } = useTheme();
  const index = Math.max(0, options.findIndex((o) => o.value === mode));
  const current = options[index] ?? THEME_OPTIONS[1]!;
  const next = options[(index + 1) % options.length] ?? current;
  return <IconButton icon={current.icon} label={getLabel(current, next)} variant={variant} onClick={() => setMode(next.value)} {...props} />;
}
