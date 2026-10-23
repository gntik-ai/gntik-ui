import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'ThemeProvider',
  group: 'Theme',
  status: 'stable',
  description:
    'Apply and persist the page theme: dark (default), light, high_contrast or system. Optional forcedMode overrides the rendered theme without changing the stored preference. setMode still persists while forced; removing forcedMode applies that preference. Use ThemeScope for themed subtrees and themeScript for the initial server paint.',
  tokens: ['background', 'foreground'],
};
