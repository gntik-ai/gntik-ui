import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import MenuAccount from './examples/MenuAccount';
import MenuRowActions from './examples/MenuRowActions';
import MenuSelection from './examples/MenuSelection';

describe('Menu', () => {
  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('opens from the trigger with %s and highlights the first item', async (key) => {
    const user = userEvent.setup();
    render(<MenuRowActions />);
    const trigger = screen.getByRole('button', { name: 'Deployment actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard(key);
    const menu = await screen.findByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'View logs' })).toHaveFocus());
  });

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
