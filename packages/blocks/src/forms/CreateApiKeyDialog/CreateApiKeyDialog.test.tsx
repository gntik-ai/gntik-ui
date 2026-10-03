import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';

describe('CreateApiKeyDialog', () => {
  it('renders the trigger and an accessible form', async () => {
    const { container } = render(<CreateApiKeyDialog />);
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Create API key' }));
    await expectNoAxeViolations(await screen.findByRole('dialog', { name: 'Create API key' }));
  });

  it('creates a key, shows the secret once and discards it on close', async () => {
    const onCreate = vi.fn().mockResolvedValue('sk_test_123');
    render(<CreateApiKeyDialog onCreate={onCreate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Create API key' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Create key' }));
    expect(screen.getByText('Give the key a name.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/Name/), 'ci');
    await userEvent.click(screen.getByRole('checkbox', { name: 'projects:read' }));
    await userEvent.click(screen.getByRole('button', { name: 'Create key' }));
    expect(onCreate).toHaveBeenCalledWith({ name: 'ci', scopes: ['projects:read'], expiry: '90d' });
    const dialog = await screen.findByRole('dialog', { name: 'API key created' });
    expect(screen.getByRole('region', { name: 'New API key' })).toHaveTextContent('sk_test_123');
    await expectNoAxeViolations(dialog);

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Create API key' }));
    expect(await screen.findByRole('dialog', { name: 'Create API key' })).toBeInTheDocument();
    expect(screen.queryByText('sk_test_123')).not.toBeInTheDocument();
  });
});
