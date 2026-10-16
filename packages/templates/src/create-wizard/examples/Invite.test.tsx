import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Invite from './Invite';

it('invites one recipient with quota revalidation, three roles and a 500-character optional message', async () => {
  const user = userEvent.setup();
  const onFinish = vi.fn(async () => undefined);
  const { rerender } = render(<Invite members={{ count: 3, limit: 3 }} onFinish={onFinish} />);
  expect(screen.getByText('Example team')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  await waitFor(() =>
    expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent(
      'Your member limit has been reached.',
    ),
  );
  rerender(<Invite members={{ count: 2, limit: 3 }} onFinish={onFinish} />);
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  const email = screen.getByRole('textbox', { name: 'Email address' });
  await user.type(email, 'bad@');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(email).toHaveFocus();
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  await user.clear(email);
  await user.type(email, 'person@example.com');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('combobox', { name: 'Role' }));
  expect(within(await screen.findByRole('listbox')).getAllByRole('option')).toHaveLength(3);
  for (const role of ['Owner', 'Admin', 'Member'])
    expect(screen.getByRole('option', { name: role })).toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Admin' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  const message = screen.getByRole('textbox', { name: 'Message (optional)' });
  expect(message).toHaveAttribute('maxlength', '500');
  await user.click(message);
  await user.paste('Welcome to the team.');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('person@example.com')).toBeInTheDocument();
  expect(screen.getByText('Admin')).toBeInTheDocument();
  expect(screen.getByText('Welcome to the team.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Send invitation' }));
  expect(onFinish).toHaveBeenCalledExactlyOnceWith(
    { workspaceId: 'example-team', email: 'person@example.com', role: 'admin', message: 'Welcome to the team.' },
    { signal: expect.any(AbortSignal) },
  );
});
