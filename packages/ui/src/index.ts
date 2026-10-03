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
export * from './components/AlertDialog';
export * from './components/AspectRatio';
export * from './components/Avatar';
export * from './components/Badge';
export * from './components/Breadcrumbs';
export * from './components/Button';
export * from './components/Card';
export * from './components/Checkbox';
export * from './components/Collapsible';
export * from './components/Combobox';
export * from './components/Dialog';
export * from './components/Drawer';
export * from './components/EmptyState';
export * from './components/Field';
export * from './components/Grid';
export * from './components/Input';
export * from './components/Kbd';
export * from './components/Link';
export * from './components/Menu';
export * from './components/Meter';
export * from './components/Pagination';
export * from './components/Popover';
export * from './components/Progress';
export * from './components/RadioGroup';
export * from './components/Resizable';
export * from './components/ScrollArea';
export * from './components/Section';
export * from './components/Select';
export * from './components/Separator';
export * from './components/Skeleton';
export * from './components/Slider';
export * from './components/Spinner';
export * from './components/Stack';
export * from './components/StatusTag';
export * from './components/Switch';
export * from './components/Table';
export * from './components/Tabs';
export * from './components/Text';
export * from './components/Textarea';
export * from './components/Toast';
export * from './components/ToggleGroup';
export * from './components/Toolbar';
export * from './components/Tooltip';
export * from './components/VisuallyHidden';
