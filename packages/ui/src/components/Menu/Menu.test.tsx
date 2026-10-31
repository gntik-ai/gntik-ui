import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import MenuAccount from './examples/MenuAccount';
import MenuRowActions from './examples/MenuRowActions';
import MenuSelection from './examples/MenuSelection';
import { Eye } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { LinkProvider } from '../Link';
import { I18nProvider } from '../../i18n/I18nProvider';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../ContextMenu';
import MenuLinks from './examples/MenuLinks';
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from './index';

describe('MenuLinkItem', () => {
  it('works inside ContextMenu', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Run</ContextMenuTrigger>
        <ContextMenuContent>
          <MenuLinkItem href="/runs/42">Open run</MenuLinkItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    await user.tab();
    await user.keyboard('{Shift>}{F10}{/Shift}');
    const link = await screen.findByRole('menuitem', { name: 'Open run' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/runs/42');
  });

  it('allows a caller to keep the menu open after a plain click', async () => {
    const user = userEvent.setup();
    render(
      <Menu defaultOpen>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent>
          <MenuLinkItem href="#details" closeOnClick={false}>
            Details
          </MenuLinkItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Details' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it.each(['dark', 'light', 'high_contrast'])('open examples have no axe violations in %s', async (theme) => {
    document.documentElement.className = theme;
    const user = userEvent.setup();
    const examples = [
      [MenuLinks, 'Run navigation'],
      [MenuRowActions, 'Deployment actions'],
      [MenuAccount, 'Account'],
    ] as const;
    for (const [Example, trigger] of examples) {
      const view = render(<Example />);
      await user.click(screen.getByRole('button', { name: trigger }));
      await screen.findByRole('menu');
      await expectNoAxeViolations();
      view.unmount();
    }
  });
  it.each([
    ['en', /^Docs\s*\(opens in a new tab\)$/],
    ['es', /^Docs\s*\(se abre en una pestaña nueva\)$/],
  ])('external links bypass the router and announce the new tab in %s', async (locale, name) => {
    const adapter = vi.fn((props: ComponentPropsWithRef<'a'>) => <a {...props} />);
    render(
      <I18nProvider locale={locale}>
        <LinkProvider component={adapter}>
          <Menu defaultOpen>
            <MenuTrigger>Actions</MenuTrigger>
            <MenuContent>
              <MenuLinkItem href="https://docs.example.test" external>
                Docs
              </MenuLinkItem>
              <MenuLinkItem href="https://docs.example.test/custom" external render={<a data-custom />}>
                Custom
              </MenuLinkItem>
            </MenuContent>
          </Menu>
        </LinkProvider>
      </I18nProvider>,
    );
    const link = await screen.findByRole('menuitem', { name });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(link.querySelector('.sr-only')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /^Custom/ })).toHaveAttribute('data-custom');
    expect(adapter).not.toHaveBeenCalled();
  });
  it('ArrowDown highlights a link and Enter dispatches its native click and closes the menu', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent>
          <MenuItem>Restart</MenuItem>
          <MenuLinkItem href="#run-42" onClick={click}>
            Open run
          </MenuLinkItem>
        </MenuContent>
      </Menu>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Restart' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    const link = screen.getByRole('menuitem', { name: 'Open run' });
    await waitFor(() => expect(link).toHaveFocus());
    expect(link).toHaveAttribute('data-highlighted');
    await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0]?.[0].defaultPrevented).toBe(false);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }])(
    'leaves browser navigation unprevented for %j',
    async (init) => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuLinkItem href="#run-42">Open run</MenuLinkItem>
          </MenuContent>
        </Menu>,
      );
      const link = await screen.findByRole('menuitem', { name: 'Open run' });
      const event = new MouseEvent('button' in init ? 'auxclick' : 'click', {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      fireEvent(link, event);
      expect(event.defaultPrevented).toBe(false);
    },
  );
  it('passes href and anchor props to the router adapter, while caller render wins', async () => {
    const adapter = vi.fn((props: ComponentPropsWithRef<'a'>) => <a {...props} data-router />);
    render(
      <LinkProvider component={adapter}>
        <Menu defaultOpen>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuLinkItem href="/runs/42">Open run</MenuLinkItem>
            <MenuLinkItem href="/runs/43" render={<a data-custom />}>
              Another run
            </MenuLinkItem>
          </MenuContent>
        </Menu>
      </LinkProvider>,
    );
    expect(await screen.findByRole('menuitem', { name: 'Open run' })).toHaveAttribute('data-router');
    expect(adapter.mock.calls.some(([props]) => props.href === '/runs/42' && props.role === 'menuitem')).toBe(true);
    const custom = screen.getByRole('menuitem', { name: 'Another run' });
    expect(custom).toHaveAttribute('data-custom');
    expect(custom).not.toHaveAttribute('data-router');
  });
  it('renders a navigation anchor with the same icon, label and shortcut slots as an action', async () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent>
          <MenuItem icon={Eye} shortcut="⌘O">
            Action
          </MenuItem>
          <MenuLinkItem href="/runs/42" icon={Eye} shortcut="⌘O">
            Open run
          </MenuLinkItem>
        </MenuContent>
      </Menu>,
    );
    const link = await screen.findByRole('menuitem', { name: 'Open run' });
    const action = screen.getByRole('menuitem', { name: 'Action' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/runs/42');
    expect(link.className).toBe(`${action.className} no-underline`);
    expect(link.querySelector('svg')?.outerHTML).toBe(action.querySelector('svg')?.outerHTML);
    expect(link.children[1]?.className).toBe(action.children[1]?.className);
    expect(link.children[2]?.outerHTML).toBe(action.children[2]?.outerHTML);
  });
});

describe('Menu', () => {
  it.each([['{Enter}'], [' '], ['{ArrowDown}']])(
    'opens from the trigger with %s and highlights the first item',
    async (key) => {
      const user = userEvent.setup();
      render(<MenuRowActions />);
      const trigger = screen.getByRole('button', { name: 'Deployment actions' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      await user.tab();
      expect(trigger).toHaveFocus();
      await user.keyboard(key);
      const menu = await screen.findByRole('menu');
      expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveClass('cursor-interactive');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveFocus());
    },
  );

  it('arrow keys move between items and wrap', async () => {
    const user = userEvent.setup();
    render(<MenuRowActions />);
    await user.tab();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Restart' })).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Delete deployment' })).toHaveFocus());
  });

  it('Enter activates the highlighted item and closes the menu', async () => {
    const user = userEvent.setup();
    render(<MenuRowActions />);
    const trigger = screen.getByRole('button', { name: 'Deployment actions' });
    await user.tab();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByText('Restarted')).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('ArrowRight opens a submenu and ArrowLeft closes it', async () => {
    const user = userEvent.setup();
    render(<MenuAccount />);
    await user.tab();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    const sub = within(menu).getByRole('menuitem', { name: 'Switch workspace' });
    expect(sub).toHaveAttribute('aria-haspopup', 'menu');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Profile' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(sub).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Personal' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    expect(sub).toHaveFocus();
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<MenuAccount />);
    const trigger = screen.getByRole('button', { name: 'Account' });
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('checkbox items toggle and keep the menu open; radio items select', async () => {
    const user = userEvent.setup();
    render(<MenuSelection />);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const uptime = await screen.findByRole('menuitemcheckbox', { name: 'Uptime' });
    expect(uptime).toHaveAttribute('aria-checked', 'false');
    await user.click(uptime);
    expect(uptime).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'eu-west-1' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'us-east-1' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'us-east-1' })).toBeInTheDocument();
  });

  it('destructive items keep their accessible name', async () => {
    const user = userEvent.setup();
    render(<MenuRowActions />);
    await user.click(screen.getByRole('button', { name: 'Deployment actions' }));
    expect(await screen.findByRole('menuitem', { name: 'Delete deployment' })).toHaveClass('text-destructive-text');
  });

  it('open row-actions menu has no axe violations', async () => {
    const user = userEvent.setup();
    render(<MenuRowActions />);
    await user.click(screen.getByRole('button', { name: 'Deployment actions' }));
    await screen.findByRole('menu');
    await expectNoAxeViolations();
  });

  it('open account menu with submenu has no axe violations', async () => {
    const user = userEvent.setup();
    render(<MenuAccount />);
    await user.tab();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    const sub = within(menu).getByRole('menuitem', { name: 'Switch workspace' });
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Profile' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(sub).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await expectNoAxeViolations();
  });

  it('open selection menus have no axe violations', async () => {
    const user = userEvent.setup();
    render(<MenuSelection />);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await screen.findByRole('menu');
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'eu-west-1' }));
    await screen.findByRole('menu');
    await expectNoAxeViolations();
  });
});
