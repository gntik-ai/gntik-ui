import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SignUpPage from './Page';

describe('SignUpPage', () => {
  it('renders the form, SSO options and brand panel', async () => {
    const { container } = render(<SignUpPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Single sign-on' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('requires the terms, then creates the account', async () => {
    const onSubmit = vi.fn();
    render(<SignUpPage onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Full name'), 'Avery Collins');
    await userEvent.type(screen.getByLabelText('Work email'), 'avery@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Accept the terms to continue.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Avery Collins', email: 'avery@example.com', password: 'long-enough-pass' });
  });
});
