import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecretRevocation from './examples/SecretRevocation';
import { ServerFailure } from './examples/FailureStates';

it('documents optional justification and force revocation without changing typed-name safety', async () => {
  const user = userEvent.setup();
  render(<SecretRevocation />);
  await user.click(screen.getByRole('button', { name: 'Revoke version' }));
  expect(await screen.findByRole('textbox', { name: 'Justification' })).toHaveValue('');
  expect(screen.getByRole('checkbox', { name: 'Force revocation' })).not.toBeChecked();
  expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(/last valid version/);
  expect(screen.getByRole('button', { name: 'Revoke version' })).toBeDisabled();
  await user.type(screen.getByRole('textbox', { name: 'Type version-7 to confirm' }), 'version-7');
  expect(screen.getByRole('button', { name: 'Revoke version' })).toBeEnabled();
});

it('demonstrates a server failure with no duplicate live announcements', async () => {
  const user = userEvent.setup();
  render(<ServerFailure />);
  await user.click(screen.getByRole('button', { name: 'Revoke version' }));
  await user.type(await screen.findByRole('textbox', { name: 'Type version-7 to confirm' }), 'version-7{Enter}');
  expect(await screen.findByRole('region', { name: 'Could not revoke version' })).toBeVisible();
  expect(screen.getAllByRole('alert')).toHaveLength(1);
});
