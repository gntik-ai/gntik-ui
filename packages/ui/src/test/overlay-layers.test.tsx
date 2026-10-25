import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../components/Dialog';
import { ToastProvider, Toaster, useToast } from '../components/Toast';
import { Drawer, DrawerContent, DrawerTitle } from '../components/Drawer';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../components/Menu';
import { SimpleSelect } from '../components/Select';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../components/Combobox';
import { SimpleTooltip } from '../components/Tooltip';
import LayeredOverlays from '../components/Dialog/examples/LayeredOverlays';
import { expectNoAxeViolations } from './a11y';
import { StackedLayout } from '../layouts/StackedLayout';
import { Table, TableHeader, TableHead, TableRow } from '../components/Table';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '../components/Popover';

it('keeps sticky table heads below the docked shell header and popover surfaces', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <StackedLayout brand="Console">
      <Table stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <Popover>
        <PopoverTrigger>Details</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Details</PopoverTitle>
        </PopoverContent>
      </Popover>
    </StackedLayout>,
  );
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('z-sticky');
  expect(container.querySelector('header')).toHaveClass('z-docked');
  await user.click(screen.getByRole('button', { name: 'Details' }));
  const popover = await screen.findByRole('dialog', { name: 'Details' });
  expect(popover.closest('.z-popover')).not.toBeNull();
});

function Notify() {
  const toast = useToast();
  return <button onClick={() => toast.add({ title: 'Saved', timeout: 0 })}>Notify</button>;
}

it('keeps the startup toaster above a later modal and dismisses its notification', async () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <Toaster />
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Notify />
        </DialogContent>
      </Dialog>
    </ToastProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await user.click(screen.getByRole('button', { name: 'Notify' }));
  const toast = await screen.findByRole('dialog', { name: 'Saved' });
  const region = toast.closest('[role="region"]');
  expect(region).toHaveClass('z-toast');
  const dialog = screen.getByRole('dialog', { name: 'Settings' });
  expect(dialog.parentElement).toHaveClass('z-modal');
  expect(dialog.parentElement?.previousElementSibling).toHaveClass('z-overlay');
  // Base UI reveals the close button to assistive technology on hover.
  await user.hover(toast);
  await user.click(within(toast).getByRole('button', { name: 'Dismiss notification' }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Saved' })).not.toBeInTheDocument());
  expect(dialog).toBeInTheDocument();
});

it('opens a dialog from a menu item, then a nested dialog above its parent', async () => {
  const user = userEvent.setup();
  render(<LayeredOverlays />);
  await user.click(screen.getByRole('button', { name: 'More actions' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Open dialog' }));
  const parent = await screen.findByRole('dialog', { name: 'Layered dialog' });
  expect(parent.parentElement).toHaveClass('z-modal');
  await user.click(screen.getByRole('button', { name: 'Open nested dialog' }));
  const nested = await screen.findByRole('dialog', { name: 'Nested dialog' });
  expect(nested.parentElement).toHaveClass('z-modal');
  // Equal modal layers retain Base UI's portal order for nested dialogs.
  expect(parent.compareDocumentPosition(nested) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  await user.click(within(nested).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Nested dialog' })).not.toBeInTheDocument());
  expect(await screen.findByRole('dialog', { name: 'Layered dialog' })).toBeInTheDocument();
});

it.each(['dark', 'light', 'high_contrast'])('layered dialog and drawer are axe clean in %s', async (theme) => {
  document.documentElement.className = theme;
  const user = userEvent.setup();
  render(<LayeredOverlays />);
  for (const kind of ['dialog', 'drawer']) {
    await user.click(screen.getByRole('button', { name: `Open ${kind}` }));
    await screen.findByRole('dialog', { name: `Layered ${kind}` });
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  }
});

it.each(['Dialog', 'Drawer'] as const)('opens popups on the popover layer inside a %s', async (kind) => {
  const user = userEvent.setup();
  const Root = kind === 'Dialog' ? Dialog : Drawer;
  const Content = kind === 'Dialog' ? DialogContent : DrawerContent;
  const Title = kind === 'Dialog' ? DialogTitle : DrawerTitle;
  render(
    <Root defaultOpen>
      <Content>
        <Title>Settings</Title>
        <SimpleSelect label="Region" items={[{ value: 'west', label: 'West' }]} />
        <Menu>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuItem>Archive</MenuItem>
          </MenuContent>
        </Menu>
        <Combobox items={['Node', 'Python']}>
          <ComboboxInput label="Runtime" />
          <ComboboxContent>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxContent>
        </Combobox>
        <SimpleTooltip content="Help" delay={0}>
          <button>Hint</button>
        </SimpleTooltip>
      </Content>
    </Root>,
  );
  const dialog = await screen.findByRole('dialog', { name: 'Settings' });
  expect(dialog.parentElement).toHaveClass('z-modal');
  await user.click(screen.getByRole('combobox', { name: 'Region' }));
  let popup = await screen.findByRole('listbox');
  expect(popup.closest('.z-popover')).not.toBeNull();
  await user.click(screen.getByRole('option', { name: 'West' }));
  await user.click(screen.getByRole('button', { name: 'Actions' }));
  popup = await screen.findByRole('menu');
  expect(popup.closest('.z-popover')).not.toBeNull();
  await user.click(screen.getByRole('menuitem', { name: 'Archive' }));
  await user.click(screen.getByRole('combobox', { name: 'Runtime' }));
  popup = await screen.findByRole('listbox');
  expect(popup.closest('.z-popover')).not.toBeNull();
  await user.click(screen.getByRole('option', { name: 'Node' }));
  await user.hover(screen.getByRole('button', { name: 'Hint' }));
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip.parentElement).toHaveClass('z-tooltip');
});
