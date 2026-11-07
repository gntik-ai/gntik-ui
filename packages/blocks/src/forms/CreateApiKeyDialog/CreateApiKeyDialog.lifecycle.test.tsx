import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/Name/), 'ci');
  await user.click(screen.getByRole('checkbox', { name: 'projects:read' }));
  await user.click(screen.getByRole('button', { name: 'Create key' }));
}

describe('CreateApiKeyDialog lifecycle', () => {
  it('never creates a second key from the secret step', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue('sk_test_123');
    render(<CreateApiKeyDialog onCreate={onCreate} />);
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await fillAndSubmit(user);
    const dialog = await screen.findByRole('dialog', { name: 'API key created' });
    fireEvent.submit(dialog.querySelector('form')!);
    await user.keyboard('{Enter}');
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape and a second submit while the key is being created', async () => {
    const user = userEvent.setup();
    let release!: (secret: string) => void;
    const onCreate = vi.fn(() => new Promise<string>((resolve) => (release = resolve)));
    const onOpenChange = vi.fn();
    render(<CreateApiKeyDialog onCreate={onCreate} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await fillAndSubmit(user);
    onOpenChange.mockClear();
    expect(screen.getByRole('button', { name: 'Create key' })).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    expect(screen.getByRole('dialog', { name: 'Create API key' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalledTimes(1);
    await act(async () => release('sk_test_123'));
    expect(await screen.findByRole('dialog', { name: 'API key created' })).toBeInTheDocument();
  });

  it('shows the titled error at the top of the body and clears it on the next submit', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockRejectedValueOnce(new Error('Quota exceeded')).mockResolvedValue('sk_test_123');
    render(<CreateApiKeyDialog onCreate={onCreate} />);
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await fillAndSubmit(user);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Key not created');
    expect(alert).toHaveTextContent('Quota exceeded');
    expect(alert.parentElement?.firstElementChild).toBe(alert);
    await user.click(screen.getByRole('button', { name: 'Create key' }));
    expect(await screen.findByRole('dialog', { name: 'API key created' })).toBeInTheDocument();
    expect(screen.queryByText('Quota exceeded')).not.toBeInTheDocument();
  });

  it('resets the fields after a parent-driven close', async () => {
    const user = userEvent.setup();
    const api: { setOpen: (open: boolean) => void } = { setOpen: () => undefined };
    function Parent() {
      const [open, setOpen] = useState(true);
      api.setOpen = setOpen;
      return <CreateApiKeyDialog open={open} onOpenChange={setOpen} trigger={null} />;
    }
    render(<Parent />);
    await user.type(await screen.findByLabelText(/Name/), 'ci');
    act(() => api.setOpen(false));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    act(() => api.setOpen(true));
    expect(await screen.findByLabelText(/Name/)).toHaveValue('');
  });

  it('keeps the trigger labelled with the form title while the secret step is shown', async () => {
    const user = userEvent.setup();
    render(<CreateApiKeyDialog onCreate={() => 'sk_test_123'} />);
    await user.click(screen.getByRole('button', { name: 'Create API key' }));
    await fillAndSubmit(user);
    await screen.findByRole('dialog', { name: 'API key created' });
    expect(screen.getByRole('button', { name: 'Create API key', hidden: true })).toBeInTheDocument();
  });
});
