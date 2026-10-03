import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LinkProvider } from '../Link';
import { MegaMenu, megaMenuNavItems } from './MegaMenu';
import MegaMenuBasic from './examples/MegaMenuBasic';
import MegaMenuStacked from './examples/MegaMenuStacked';
import { megaMenuItems } from './examples/items';

function setup() {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<MegaMenu items={megaMenuItems} currentHref="#deployments" onNavigate={onNavigate} />);
  const trigger = screen.getByRole('button', { name: 'Workspace' });
  return { user, onNavigate, trigger };
}

describe('MegaMenu', () => {
  it('renders a labelled nav with links and panel triggers', () => {
    const { trigger } = setup();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '#overview');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-current');
  });

  it('Enter opens the panel; Tab moves into its links', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    const link = await screen.findByRole('link', { name: /Deployments/ });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('list', { name: 'Build' })).toBeInTheDocument();
    await user.tab();
    await waitFor(() => expect(screen.getByRole('link', { name: /Projects/ })).toHaveFocus());
  });

  it('Space and ArrowDown open the panel too', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard(' ');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await user.keyboard(' ');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  });

  it('ArrowRight / ArrowLeft move between top-level items', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Billing' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(trigger).toHaveFocus();
  });

  it('Escape closes the panel and returns focus to the trigger', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('link', { name: /Deployments/ });
    await user.tab();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('activating a panel link calls onNavigate', async () => {
    const { user, trigger, onNavigate } = setup();
    await user.click(trigger);
    await user.click(await screen.findByRole('link', { name: /Members/ }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ href: '#members' }));
  });

  it('renders links through the LinkProvider router component', () => {
    render(
      <LinkProvider component={(props) => <a data-router="" {...props} />}>
        <MegaMenu items={megaMenuItems} />
      </LinkProvider>,
    );
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('data-router');
  });

  it('flattens items for MobileNav', () => {
    const nav = megaMenuNavItems(megaMenuItems);
    expect(nav[0]).toMatchObject({ label: 'Overview', href: '#overview' });
    expect(nav[1]?.items?.map((i) => i.label)).toEqual(['Projects', 'Deployments', 'Analytics', 'Members']);
  });

  it('examples have no axe violations (closed and open)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <MegaMenuBasic />
        <MegaMenuStacked />
      </>,
    );
    await expectNoAxeViolations();
    const nav = screen.getByRole('navigation', { name: 'Product' });
    await user.click(within(nav).getByRole('button', { name: 'Workspace' }));
    await screen.findAllByRole('link', { name: /Deployments/ });
    await expectNoAxeViolations();
  });
});
