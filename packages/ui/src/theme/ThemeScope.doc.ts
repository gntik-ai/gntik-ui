import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'ThemeScope',
  group: 'Theme',
  status: 'stable',
  description:
    'Apply light, dark or high_contrast to a subtree and its overlays. theme is required; className and Base UI render customize the wrapper. Nested useTheme().resolved follows the scope; mode and setMode still control the page. Explicit overlay containers take precedence. Each scope owns a themed body portal, removed on unmount. CSS classes, including .light, reapply the frozen tokens. Charts, flow and editor runtime colors still follow html.',
  primitive: '@base-ui/react/use-render',
  tokens: ['background', 'foreground', 'primary-text', 'popover', 'popover-foreground'],
};
