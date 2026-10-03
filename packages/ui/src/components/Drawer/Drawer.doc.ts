import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Drawer',
  group: 'Overlays',
  status: 'stable',
  description: 'Panel that slides in from the right, left or bottom edge for details, edit forms and navigation. Fixed header and footer, scrollable body, swipe to dismiss. Under RTL (I18nProvider) `right` and `left` mirror to the inline end and start. Parts: Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose.',
  primitive: '@base-ui/react/drawer',
  pattern: 'dialog (modal)',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the drawer and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles focus within the drawer (focus is trapped)'],
    ['Escape', 'Closes the drawer and returns focus to the trigger'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'background', 'muted-foreground', 'secondary', 'focus-ring'],
};
