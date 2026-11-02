import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { Dropzone } from '../components/Dropzone';
import { BottomSheet, BottomSheetContent } from '../components/BottomSheet';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/HoverCard';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../components/ContextMenu';
import { MultiSelect } from '../components/MultiSelect';
import { DatePicker, DateRangePicker } from '../components/DatePicker';
import { DateTimeRangePicker } from '../components/DateTimeRangePicker';
import { PeriodPicker } from '../components/PeriodPicker';

const overlays: [string, () => ReactNode, string][] = [
  [
    'BottomSheet',
    () => (
      <BottomSheet open>
        <BottomSheetContent title="Sheet">Details</BottomSheetContent>
      </BottomSheet>
    ),
    'dialog',
  ],
  [
    'ContextMenu',
    () => (
      <ContextMenu open>
        <ContextMenuTrigger>Actions</ContextMenuTrigger>
        <ContextMenuContent>
          <MenuItem>Item</MenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
    'menu',
  ],
  ['DatePicker', () => <DatePicker open aria-label="Date" />, 'dialog'],
  ['DateRangePicker', () => <DateRangePicker open aria-label="Dates" />, 'dialog'],
  ['DateTimeRangePicker', () => <DateTimeRangePicker open aria-label="Time range" />, 'dialog'],
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

it('HoverCard uses the KitProvider portal destination', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const { unmount } = render(
    <KitProvider portalContainer={host}>
      <HoverCard open>
        <HoverCardTrigger href="/preview">Preview</HoverCardTrigger>
        <HoverCardContent>Preview details</HoverCardContent>
      </HoverCard>
    </KitProvider>,
  );
  try {
    expect(host).toContainElement(await screen.findByText('Preview details'));
  } finally {
    unmount();
    host.remove();
  }
});

it.each([
  ['MultiSelect', () => <MultiSelect label="Teams" options={[{ value: 'a', label: 'Alpha' }]} />, 'listbox'],
  ['PeriodPicker', () => <PeriodPicker aria-label="Period" />, 'dialog'],
] as const)('%s uses the KitProvider portal destination when opened', async (_name, overlay, role) => {
  const user = userEvent.setup();
  const host = document.createElement('div');
  document.body.appendChild(host);
  const { unmount } = render(<KitProvider portalContainer={host}>{overlay()}</KitProvider>);
  try {
    await user.click(screen.getByRole('combobox'));
    expect(host).toContainElement(await screen.findByRole(role));
  } finally {
    unmount();
    host.remove();
  }
});

it('uses document.body for popups when no portalContainer is supplied', async () => {
  const { container } = render(
    <KitProvider>
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Default destination</PopoverContent>
      </Popover>
    </KitProvider>,
  );
  const popup = await screen.findByRole('dialog');
  expect(document.body).toContainElement(popup);
  expect(container).not.toContainElement(popup);
});

it('full-screen Dropzone uses the KitProvider portal destination during a file drag', () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const { unmount } = render(
    <KitProvider portalContainer={host}>
      <Dropzone fullScreen />
    </KitProvider>,
  );
  try {
    fireEvent.dragEnter(window, {
      dataTransfer: { types: ['Files'], items: [{ kind: 'file', type: 'text/csv' }], files: [] },
    });
    expect(host).toContainElement(screen.getByRole('button', { name: 'Drop files here' }));
  } finally {
    unmount();
    host.remove();
  }
});

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
