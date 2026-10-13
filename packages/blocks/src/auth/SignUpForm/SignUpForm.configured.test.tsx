import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SignUpForm } from './SignUpForm';

const fields = [
  {
    id: 'username',
    label: 'Username',
    placeholder: 'Account name',
    help: 'Choose an account name.',
    required: true,
    type: 'text' as const,
    autoComplete: 'username',
  },
  {
    id: 'displayName',
    label: 'Display name',
    placeholder: 'Your name',
    help: 'Name shown to others.',
    required: true,
    type: 'text' as const,
    autoComplete: 'name',
  },
  {
    id: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    help: 'For account notifications.',
    required: true,
    type: 'email' as const,
    autoComplete: 'email',
  },
  {
    id: 'tenant',
    label: 'Tenant identifier',
    placeholder: 'Tenant',
    help: 'Your organization.',
    required: true,
    type: 'text' as const,
    autoComplete: 'off',
  },
  {
    id: 'workspace',
    label: 'Workspace identifier',
    placeholder: 'Workspace',
    help: 'Optional workspace.',
    required: false,
    type: 'text' as const,
    autoComplete: 'off',
  },
];

describe('SignUpForm configured fields', () => {
  it('blocks whitespace-only required fields independently of password and consent, and refocuses the summary on retry', async () => {
    const onSubmit = vi.fn();
    render(
      <SignUpForm
        fields={[
          {
            id: 'username',
            label: 'Username',
            required: true,
            help: 'Choose an account name.',
            messages: { required: 'An account name is required.' },
          },
          { id: 'workspace', label: 'Workspace identifier' },
        ]}
        terms={false}
        sso={null}
        onSubmit={onSubmit}
      />,
    );
    await userEvent.type(screen.getByLabelText('Username'), '   ');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = screen.getByRole('region', { name: 'There is 1 problem with this form' });
    expect(summary).toHaveFocus();
    await userEvent.tab();
    expect(within(summary).getByRole('link', { name: 'Username: An account name is required.' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByLabelText('Username')).toHaveFocus();
    expect(screen.getByLabelText('Username')).toHaveAccessibleDescription(
      'Choose an account name. An account name is required.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(summary).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders ordered fields, links all errors to inputs, and submits trimmed values with an empty optional field', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<SignUpForm fields={fields} onSubmit={onSubmit} sso={null} />);
    expect(
      Array.from(container.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]')).map(
        (input) => input.getAttribute('placeholder'),
      ),
    ).toEqual(['Account name', 'Your name', 'you@example.com', 'Tenant', 'Workspace', null]);
    for (const field of fields) {
      const input = screen.getByLabelText(field.label);
      expect(input).toHaveAttribute('type', field.type);
      expect(input).toHaveAttribute('autocomplete', field.autoComplete);
      expect(input).toHaveAccessibleDescription(field.help);
      expect(input).toHaveProperty('required', field.required);
    }
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = screen.getByRole('region');
    expect(summary).toHaveFocus();
    expect(within(summary).getAllByRole('link')).toHaveLength(6);
    await userEvent.click(within(summary).getByRole('link', { name: 'Username: Enter Username.' }));
    expect(screen.getByLabelText('Username')).toHaveFocus();
    expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Username')).toHaveAccessibleDescription('Choose an account name. Enter Username.');
    await expectNoAxeViolations(container);
    await userEvent.type(screen.getByLabelText('Username'), ' avery ');
    await userEvent.type(screen.getByLabelText('Display name'), ' Avery Collins ');
    await userEvent.type(screen.getByLabelText('Email'), ' avery@example.com ');
    await userEvent.type(screen.getByLabelText('Tenant identifier'), ' team ');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: '',
      email: 'avery@example.com',
      password: 'correct-horse-42',
      fields: {
        username: 'avery',
        displayName: 'Avery Collins',
        email: 'avery@example.com',
        tenant: 'team',
        workspace: '',
      },
    });
  });
});

it('omits consent only when terms is explicitly false, in default and configured modes', async () => {
  const onSubmit = vi.fn();
  const { rerender } = render(<SignUpForm terms={false} sso={null} onSubmit={onSubmit} />);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Full name'), ' Avery ');
  await userEvent.type(screen.getByLabelText('Work email'), 'avery@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Avery', email: 'avery@example.com', password: 'correct-horse-42' });
  onSubmit.mockClear();
  rerender(<SignUpForm fields={[]} terms={false} sso={null} onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(onSubmit).toHaveBeenCalledWith({ name: '', email: '', password: 'correct-horse-42', fields: {} });
});

it.each([undefined, 8, 12])(
  'uses the password minimum %s for inline validation, optional help and the meter',
  async (minimum) => {
    const onSubmit = vi.fn();
    const min = minimum ?? 8;
    const { container } = render(
      <SignUpForm
        fields={[]}
        terms={false}
        minPasswordLength={minimum}
        passwordHelp={`Use at least ${min} characters to secure your account.`}
        onSubmit={onSubmit}
        sso={null}
      />,
    );
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAccessibleDescription(
      expect.stringContaining(`Use at least ${min} characters to secure your account.`),
    );
    await userEvent.type(password, min === 8 ? 'Abc1!xy' : 'Abc1!xyzabc');
    expect(password).toHaveValue(min === 8 ? 'Abc1!xy' : 'Abc1!xyzabc');
    expect(screen.getByText('Too weak')).toBeInTheDocument();
    expect(screen.getByText(`Use at least ${min} characters.`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(password).toHaveAttribute('aria-invalid', 'true');
    await expectNoAxeViolations(container);
    await userEvent.type(password, 'z');
    expect(password).toHaveValue(min === 8 ? 'Abc1!xyz' : 'Abc1!xyzabcz');
    await waitFor(() => expect(screen.queryByText(`Use at least ${min} characters.`)).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  },
);

it('replaces the form with an unavailable callout and consumer action', async () => {
  const onAction = vi.fn();
  const { container } = render(
    <SignUpForm
      unavailable={{
        title: 'Registration unavailable',
        message: 'Contact your administrator.',
        action: <button onClick={onAction}>Request access</button>,
      }}
    />,
  );
  expect(screen.getByText('Registration unavailable')).toBeInTheDocument();
  expect(screen.getByText('Contact your administrator.')).toBeInTheDocument();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  expect(container.querySelector('input')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Request access' }));
  expect(onAction).toHaveBeenCalledTimes(1);
  await expectNoAxeViolations(container);
});

it('shows skeletons and cannot submit while policy is loading, then restores the form', async () => {
  const onSubmit = vi.fn();
  const { container, rerender } = render(<SignUpForm policyLoading onSubmit={onSubmit} />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading sign-up policy');
  expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  expect(container.querySelector('input')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
  await expectNoAxeViolations(container);
  rerender(<SignUpForm policyLoading={false} onSubmit={onSubmit} />);
  expect(screen.getByRole('form')).toBeInTheDocument();
});

it('validates non-empty optional email and uses consumer-supplied messages', async () => {
  const onSubmit = vi.fn();
  render(
    <SignUpForm
      fields={[
        {
          id: 'contact',
          label: 'Contact',
          type: 'email',
          help: 'Optional contact address.',
          messages: { invalid: 'Check the contact address.' },
        },
      ]}
      terms={false}
      messages={{ passwordTooShort: (minimum) => `Password needs ${minimum} characters.` }}
      onSubmit={onSubmit}
      sso={null}
    />,
  );
  await userEvent.type(screen.getByLabelText('Contact'), 'invalid');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  const summary = screen.getByRole('region');
  expect(within(summary).getByRole('link', { name: 'Contact: Check the contact address.' })).toBeInTheDocument();
  await userEvent.click(within(summary).getByRole('link', { name: 'Password: Password needs 8 characters.' }));
  expect(screen.getByLabelText('Password')).toHaveFocus();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('keeps password help, strength and error descriptions linked and focuses consent from the summary', async () => {
  render(<SignUpForm fields={[]} passwordHelp="Choose at least 8 characters to secure your account." sso={null} />);
  const password = screen.getByLabelText('Password');
  await userEvent.type(password, 'Abc1!xy');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(password).toHaveAccessibleDescription(
    'Strength: Too weak Choose at least 8 characters to secure your account. Use at least 8 characters.',
  );
  const summary = screen.getByRole('region');
  await userEvent.click(within(summary).getByRole('link', { name: 'Password: Use at least 8 characters.' }));
  expect(password).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveAttribute('aria-invalid', 'true');
  expect(password).toHaveAccessibleDescription(
    'Strength: Too weak Choose at least 8 characters to secure your account. Use at least 8 characters.',
  );
  await userEvent.click(within(summary).getByRole('link', { name: 'Terms: Accept the terms to continue.' }));
  expect(screen.getByRole('checkbox')).toHaveFocus();
  expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Accept the terms to continue.');
  await userEvent.keyboard(' ');
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(within(summary).queryByRole('link', { name: 'Terms: Accept the terms to continue.' })).not.toBeInTheDocument();
});

it('treats field ids as consumer keys, including names inherited by ordinary objects', async () => {
  const onSubmit = vi.fn();
  render(
    <SignUpForm
      fields={[{ id: 'constructor', label: 'Account identifier', required: true }]}
      terms={false}
      sso={null}
      onSubmit={onSubmit}
    />,
  );
  expect(screen.getByLabelText('Account identifier')).toHaveValue('');
  await userEvent.type(screen.getByLabelText('Account identifier'), ' account ');
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(onSubmit).toHaveBeenCalledWith({
    name: '',
    email: '',
    password: 'correct-horse-42',
    fields: { constructor: 'account' },
  });
});

it('preserves default submit-time validation and omits a validation summary in default mode', async () => {
  render(<SignUpForm sso={null} />);
  await userEvent.type(screen.getByLabelText('Password'), 'Abc1!xy');
  expect(screen.getByText('Too weak')).toBeInTheDocument();
  expect(screen.queryByText('Use at least 8 characters.')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
