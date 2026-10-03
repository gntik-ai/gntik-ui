import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'StackedLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Top-navigation shell: a chrome navbar (brand · primary links or a custom `nav` slot such as a MegaMenu · actions), an optional tab sub-nav row, an optional page-header band and centered content (narrow 640 · default 1120 · wide 1440 · full) with an optional footer. Below lg the links collapse into a MobileNav drawer. Fills its container; fullScreen switches to h-dvh.',
  primitive: '@base-ui/react/drawer',
  pattern: 'landmarks (banner, navigation, main, contentinfo) + skip link',
  keyboard: [
    ['Tab (first stop)', 'Reveals the skip link; Enter moves focus to <main>'],
    ['Tab', 'Moves through the navbar links (the current one has aria-current="page") and actions'],
    ['Enter (nav slot)', 'In the `nav` slot: follows the slot component\'s own contract (e.g. MegaMenu opens a panel)'],
    ['Enter / Space', 'On the menu button (small screens): opens the navigation drawer'],
    ['Escape', 'Closes the navigation drawer and returns focus to the menu button'],
  ],
  tokens: ['chrome', 'background', 'card', 'accent', 'accent-foreground', 'border', 'muted-foreground', 'focus-ring'],
};
