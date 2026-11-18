import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'AppTopbar',
  group: 'Layout',
  status: 'beta',
  description:
    'Application topbar content. themeOptions optionally limits the modes and labels offered by both cycle and segmented controls. Omit it to keep the four localized modes. ConsoleShell forwards topbar.themeOptions.',
  keyboard: [
    ['Enter / Space', 'Cycle to the next offered theme, or select the focused segmented theme'],
    ['Arrow keys', 'Move between segmented theme options'],
  ],
  tokens: ['chrome', 'foreground', 'border', 'focus-ring'],
};
