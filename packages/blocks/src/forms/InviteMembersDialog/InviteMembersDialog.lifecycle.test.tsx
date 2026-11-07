import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { InviteMembersDialog } from './InviteMembersDialog';

describe('InviteMembersDialog lifecycle', () => {
  it('ignores Escape and a second submit while invitations are being sent', async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const onInvite = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
    const onOpenChange = vi.fn();
    render(<InviteMembersDialog defaultOpen onInvite={onInvite} onOpenChange={onOpenChange} />);
    await user.type(await screen.findByLabelText(/Email addresses/), 'avery@example.com,');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(screen.getByRole('button', { name: 'Send invitation' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.keyboard('{Escape}');
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onInvite).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => release());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows a rejection in a titled alert at the top and clears it on the next submit', async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockRejectedValueOnce(new Error('Seat limit reached')).mockResolvedValue(undefined);
    render(<InviteMembersDialog defaultOpen onInvite={onInvite} />);
    await user.type(await screen.findByLabelText(/Email addresses/), 'avery@example.com,');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Seat limit reached');
    expect(alert.parentElement?.firstElementChild).toBe(alert);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('resets the fields after a parent-driven close', async () => {
    const user = userEvent.setup();
    const api: { setOpen: (open: boolean) => void } = { setOpen: () => undefined };
    function Parent() {
      const [open, setOpen] = useState(true);
      api.setOpen = setOpen;
      return <InviteMembersDialog open={open} onOpenChange={setOpen} trigger={null} />;
    }
    render(<Parent />);
    await user.type(await screen.findByLabelText(/Email addresses/), 'avery@example.com,');
    expect(screen.getByRole('list', { name: 'Invited addresses' })).toHaveTextContent('avery@example.com');
    act(() => api.setOpen(false));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    act(() => api.setOpen(true));
    await screen.findByLabelText(/Email addresses/);
    expect(screen.queryByText('avery@example.com')).not.toBeInTheDocument();
  });
});
