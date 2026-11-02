import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { KitProvider } from './KitProvider';
import { Dialog, DialogContent, DialogTitle } from '../components/Dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../components/AlertDialog';
import { Drawer, DrawerContent, DrawerTitle } from '../components/Drawer';
import { Popover, PopoverContent, PopoverTrigger } from '../components/Popover';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../components/Menu';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../components/Select';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../components/Combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/Tooltip';

const overlays: [string, () => ReactNode, string][] = [
  [
    'Dialog',
    () => (
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    ),
    'dialog',
  ],
  [
    'AlertDialog',
    () => (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Alert</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    ),
    'alertdialog',
  ],
  [
    'Drawer',
    () => (
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    ),
    'dialog',
  ],
  [
    'Popover',
    () => (
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover</PopoverContent>
      </Popover>
    ),
    'dialog',
  ],
  [
    'Menu',
    () => (
      <Menu open>
        <MenuTrigger>Menu</MenuTrigger>
        <MenuContent>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    ),
    'menu',
  ],
  [
    'Select',
    () => (
      <Select defaultOpen items={[{ value: 'a', label: 'Apple' }]}>
        <SelectTrigger aria-label="Fruit" />
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>
    ),
    'listbox',
  ],
  [
    'Combobox',
    () => (
      <Combobox defaultOpen items={['Apple']}>
        <ComboboxInput aria-label="Fruit" />
        <ComboboxContent>{(fruit: string) => <ComboboxItem value={fruit}>{fruit}</ComboboxItem>}</ComboboxContent>
      </Combobox>
    ),
    'listbox',
  ],
  [
    'Tooltip',
    () => (
      <Tooltip open>
        <TooltipTrigger>Hint</TooltipTrigger>
        <TooltipContent>Help</TooltipContent>
      </Tooltip>
    ),
    'tooltip',
  ],
];

it.each(overlays)('%s and Toaster use the KitProvider portal destination', async (_name, overlay, role) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const { unmount } = render(<KitProvider portalContainer={host}>{overlay()}</KitProvider>);
  try {
    expect(host).toContainElement(await screen.findByRole(role));
    // Modal overlays hide the stack from accessibility queries, so inspect its landmark directly.
    expect(host.querySelector('[role="region"][aria-label="Notifications"]')).not.toBeNull();
  } finally {
    unmount();
    host.remove();
  }
});

it('an explicit overlay container wins over the KitProvider destination', async () => {
  const host = document.createElement('div');
  const other = document.createElement('div');
  document.body.append(host, other);
  const { unmount } = render(
    <KitProvider portalContainer={host}>
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent container={other}>Explicit</PopoverContent>
      </Popover>
    </KitProvider>,
  );
  try {
    expect(other).toContainElement(await screen.findByRole('dialog'));
    expect(host).not.toContainElement(screen.getByRole('dialog'));
  } finally {
    unmount();
    host.remove();
    other.remove();
  }
});
