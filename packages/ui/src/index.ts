// @gntik-ai/ui — public API. One export block per component folder (alphabetical).
export { cn } from './utils/cn';
export type { ComponentDoc } from './doc';

// Theme
export { ThemeProvider, useTheme, themeScript, type ThemeMode, type ResolvedTheme, type ThemeProviderProps } from './theme/ThemeProvider';
export { Logo, type LogoProps } from './theme/Logo';
export { presets, gntikPreset, musematicPreset, type BrandPreset } from './theme/presets';

// Components
export * from './components/Accordion';
export * from './components/Alert';
export * from './components/Avatar';
export * from './components/Badge';
export * from './components/Breadcrumbs';
export * from './components/Button';
export * from './components/Card';
export * from './components/Checkbox';
export * from './components/Collapsible';
export * from './components/Combobox';
export * from './components/Dialog';
export * from './components/EmptyState';
export * from './components/Field';
export * from './components/Input';
export * from './components/Kbd';
export * from './components/Link';
export * from './components/Meter';
export * from './components/Pagination';
export * from './components/Progress';
export * from './components/RadioGroup';
export * from './components/Select';
export * from './components/Separator';
export * from './components/Skeleton';
export * from './components/Slider';
export * from './components/Spinner';
export * from './components/StatusTag';
export * from './components/Switch';
export * from './components/Table';
export * from './components/Tabs';
export * from './components/Textarea';
export * from './components/ToggleGroup';
export * from './components/Toolbar';
