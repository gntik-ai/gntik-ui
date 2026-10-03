import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import PopoverDetails from './examples/PopoverDetails';
import PopoverForm from './examples/PopoverForm';

describe('Popover', () => {
  it('toggles from the keyboard with Enter and Space and labels itself', async () => {
    const user = userEvent.setup();
    render(<PopoverForm />);
    const trigger = screen.getByRole('button', { name: 'Invite member' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const panel = await screen.findByRole('dialog', { name: 'Invite a member' });
    expect(panel).toHaveAccessibleDescription('They get an email with a link to join this workspace.');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.keyboard(' ');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('Tab moves through the content', async () => {
    const user = userEvent.setup();
    render(<PopoverForm />);
    await user.click(screen.getByRole('button', { name: 'Invite member' }));
    const email = await screen.findByRole('textbox', { name: 'Email' });
    await waitFor(() => expect(email).toHaveFocus());
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Send invite' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<PopoverDetails />);
    const trigger = screen.getByRole('button', { name: 'About usage limits' });
    await user.click(trigger);
    await screen.findByRole('dialog', { name: 'Usage limits' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes from the X button', async () => {
    const user = userEvent.setup();
    render(<PopoverDetails />);
    await user.click(screen.getByRole('button', { name: 'About usage limits' }));
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it.each([
    ['details', PopoverDetails, 'About usage limits'],
    ['form', PopoverForm, 'Invite member'],
  ])('open %s popover has no axe violations', async (_, Example, triggerName) => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: triggerName }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
