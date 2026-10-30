import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Drawer',
  group: 'Overlays',
  status: 'stable',
  anatomy: `<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Details</DrawerTitle>
      <DrawerDescription>Review the details.</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>Content</DrawerBody>
    <DrawerFooter><DrawerClose>Close</DrawerClose></DrawerFooter>
  </DrawerContent>
</Drawer>`,
  description:
    'Panel that slides in from the right, left or bottom edge for details, edit forms and navigation. Fixed header and footer, scrollable body, swipe to dismiss. Under RTL (I18nProvider) `right` and `left` mirror to the inline end and start. Parts: Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose.',
  primitive: '@base-ui/react/drawer',
  pattern: 'dialog (modal)',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the drawer and moves focus inside'],
    ['Tab / Shift+Tab', 'Cycles focus within the drawer (focus is trapped)'],
    ['Escape', 'Closes the drawer and returns focus to the trigger'],
  ],
  dataAttributes: [
    ['data-swiping', 'backdrop', 'The part is being swiped.'],
    ['data-starting-style', 'backdrop', 'The part is entering.'],
    ['data-ending-style', 'backdrop', 'The part is leaving.'],
    ['data-swiping', 'popup', 'The part is being swiped.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'background', 'muted-foreground', 'secondary', 'focus-ring'],
};
