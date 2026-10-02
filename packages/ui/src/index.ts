// @gntik-ai/ui — public API. One export block per component folder (alphabetical).
export { cn } from './utils/cn';
export type { ComponentDoc } from './doc';

// Theme
export { ThemeProvider, useTheme, themeScript, type ThemeMode, type ResolvedTheme, type ThemeProviderProps } from './theme/ThemeProvider';
export { Logo, type LogoProps } from './theme/Logo';
export { presets, gntikPreset, musematicPreset, type BrandPreset } from './theme/presets';

// Components
export * from './components/Button';
export * from './components/Checkbox';
export * from './components/Dialog';
export * from './components/Field';
export * from './components/Input';
export * from './components/RadioGroup';
export * from './components/Spinner';
export * from './components/Switch';
export * from './components/Textarea';
