import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import CreateWorkspacePage from './Page';

describe('CreateWorkspacePage', () => {
  it('renders the first step with the address preview', { timeout: 15000 }, async () => {
    const { container } = render(<CreateWorkspacePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Name your workspace' })).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /Workspace name/ }), 'Acme Labs');
    expect(screen.getByText('app.example.com/acme-labs')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('picks region and plan, invites members and finishes', { timeout: 15000 }, async () => {
    const onFinish = vi.fn();
    const { container } = render(<CreateWorkspacePage onFinish={onFinish} />);
    await userEvent.type(screen.getByRole('textbox', { name: /Workspace name/ }), 'Acme Labs');
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    await userEvent.click(screen.getByRole('radio', { name: 'United States' }));
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('radio', { name: 'Starter' }));
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    await userEvent.type(screen.getByRole('textbox', { name: /Email addresses/ }), 'sam@example.com{Enter}');
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: /Create and invite/ }));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Acme Labs', slug: 'acme-labs', region: 'us', plan: 'starter', invites: ['sam@example.com'], role: 'member' }),
    );
  });
});
