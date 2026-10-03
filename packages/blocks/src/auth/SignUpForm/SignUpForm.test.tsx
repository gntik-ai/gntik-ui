import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SignUpForm } from './SignUpForm';

describe('SignUpForm', () => {
  it('renders the default form', async () => {
    const { container } = render(<SignUpForm />);
    expect(screen.getByRole('form', { name: 'Create account' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('requires the terms and submits the values', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<SignUpForm onSubmit={onSubmit} sso={null} />);
    await userEvent.type(screen.getByLabelText('Full name'), 'Avery Collins');
    await userEvent.type(screen.getByLabelText('Work email'), 'avery@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42');
    expect(screen.getByText(/Strength:/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const terms = screen.getByRole('checkbox', { name: /I agree/ });
    expect(terms).toHaveAccessibleDescription('Accept the terms to continue.');
    await expectNoAxeViolations(container);
    await userEvent.click(terms);
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Avery Collins', email: 'avery@example.com', password: 'correct-horse-42' });
  });
});
