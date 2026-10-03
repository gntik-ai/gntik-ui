import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import AcceptInvitationPage from './Page';

describe('AcceptInvitationPage', () => {
  it('renders the inviter, workspace and role', async () => {
    const { container } = render(<AcceptInvitationPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Join Acme Industries' })).toBeInTheDocument();
    expect(screen.getByText('Priya Raman')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('joins the workspace', async () => {
    const onAccept = vi.fn();
    const onOpenWorkspace = vi.fn();
    const { container } = render(<AcceptInvitationPage onAccept={onAccept} onOpenWorkspace={onOpenWorkspace} />);
    await userEvent.click(screen.getByRole('button', { name: 'Join Acme Industries' }));
    expect(onAccept).toHaveBeenCalledOnce();
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome to Acme Industries' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('You joined Acme Industries.');
    await userEvent.click(screen.getByRole('button', { name: 'Open workspace' }));
    expect(onOpenWorkspace).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });

  it('declines, and keeps the card on failure', async () => {
    const onDecline = vi.fn().mockRejectedValueOnce(new Error('The invitation has expired.')).mockResolvedValueOnce(undefined);
    render(<AcceptInvitationPage onDecline={onDecline} />);
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(await screen.findByText('The invitation has expired.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'No problem' })).toBeInTheDocument();
  });
});
