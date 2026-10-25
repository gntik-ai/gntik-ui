import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'ThemeProvider',
  group: 'Theme',
  status: 'stable',
  description:
    'Apply and persist the page theme: dark (default), light, high_contrast or system. Optional forcedMode overrides the rendered theme without changing the stored preference. setMode still persists while forced; removing forcedMode applies that preference. defaultMotion (system or reduce) and motionStorageKey (gntik-motion, null disables storage) control data-motion on target(). useTheme exposes motion and setMotion; system removes the override and keeps the OS preference. themeScript(storageKey, defaultMode, { motionStorageKey, defaultMotion }) restores motion before hydration. Use ThemeScope for themed subtrees and themeScript for the initial server paint.',
  tokens: ['background', 'foreground'],
};
