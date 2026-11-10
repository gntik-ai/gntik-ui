import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import FormBindingsHelpers from './examples/FormBindingsHelpers';
import FormBindings from './examples/FormBindings';
import FormDialogForm from './examples/FormDialogForm';
import FormEditSettings from './examples/FormEditSettings';
import FormInviteMember from './examples/FormInviteMember';
import FormServerErrors from './examples/FormServerErrors';

it.each(['dark', 'light', 'high_contrast'])('form examples have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const view = render(
    <>
      <FormInviteMember />
      <FormBindings />
    </>,
  );
  await expectNoAxeViolations();
  await userEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
  await screen.findByText('Choose a role.');
  await expectNoAxeViolations();
  view.unmount();
  document.documentElement.className = '';
});

it('reloads dependent options after the parent changes', async () => {
  const user = userEvent.setup();
  render(<FormBindings />);
  await user.click(screen.getByRole('combobox', { name: 'Team' }));
  expect(await screen.findByRole('option', { name: 'Platform' })).toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Platform' }));
  await user.click(screen.getByRole('combobox', { name: 'Department' }));
  await user.click(await screen.findByRole('option', { name: 'Design' }));
  await user.click(screen.getByRole('combobox', { name: 'Team' }));
  expect(await screen.findByRole('option', { name: 'Research' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Platform' })).not.toBeInTheDocument();
});

it('disables all bound controls and their Fields from the form-wide enhancer', async () => {
  render(<FormBindings />);
  await userEvent.click(screen.getByRole('switch', { name: 'Disable fields' }));
  for (const input of [
    screen.getByRole('textbox', { name: 'Name' }),
    screen.getByRole('textbox', { name: 'Note' }),
    screen.getByRole('textbox', { name: 'Seats' }),
    ...screen.getAllByRole('combobox'),
  ]) {
    // The width selector belongs to the example toolbar, outside the enhanced form.
    if (input.getAttribute('aria-labelledby') && input.closest('form')) expect(input).toBeDisabled();
  }
  expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveAttribute('data-disabled');
  expect(screen.getByRole('checkbox', { name: 'Weekly digest' })).toHaveAttribute('data-disabled');
  for (const radio of screen.getAllByRole('radio')) expect(radio).toHaveAttribute('aria-disabled', 'true');
  for (const segment of screen.getAllByRole('spinbutton')) expect(segment).toHaveAttribute('aria-disabled', 'true');
});

it('localizes the example labels and width options', () => {
  render(
    <I18nProvider locale="es">
      <FormBindings />
    </I18nProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Ancho del campo' })).toHaveTextContent('Pequeño');
});

it('localizes the invite form accessible name', () => {
  render(
    <I18nProvider locale="es">
      <FormInviteMember />
    </I18nProvider>,
  );
  expect(screen.getByRole('form', { name: 'Invitar a un miembro' })).toBeInTheDocument();
});

it('submits fields mapped by the public helpers without FormField', async () => {
  const user = userEvent.setup();
  render(<FormBindingsHelpers />);
  await user.click(screen.getByRole('textbox', { name: 'Seats' }));
  await user.keyboard('{ArrowUp}');
  await user.click(screen.getByRole('switch', { name: 'Notifications' }));
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Saved 2 seats. Notifications: Yes.')).toBeInTheDocument();
  await expectNoAxeViolations();
});

it.each(['dark', 'light', 'high_contrast'])('the form dialog example has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const user = userEvent.setup();
  const view = render(<FormDialogForm />);
  await expectNoAxeViolations();
  await user.click(screen.getByRole('button', { name: 'New quota (form)' }));
  const dialog = await screen.findByRole('dialog', { name: 'New quota (form)' });
  await expectNoAxeViolations(dialog);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter a quota name.')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Quota name/ })).toHaveFocus());
  await expectNoAxeViolations(dialog);
  view.unmount();
  document.documentElement.className = '';
});

it('saves and discards settings through the toolbar actions', async () => {
  const user = userEvent.setup();
  render(<FormEditSettings />);
  const input = screen.getByRole('textbox', { name: 'Name' });
  const save = screen.getByRole('button', { name: 'Save from toolbar' });
  const discard = screen.getByRole('button', { name: 'Discard from toolbar' });
  expect(save).toBeDisabled();
  expect(discard).toBeDisabled();
  await user.type(input, ' v2');
  await user.click(discard);
  expect(input).toHaveValue('Billing API');
  expect(save).toBeDisabled();
  await user.type(input, ' v2');
  await user.dblClick(save);
  expect(save).toHaveAttribute('aria-busy', 'true');
  expect(discard).toBeDisabled();
  await screen.findByText('Settings saved.');
  await waitFor(() => expect(save).toBeDisabled());
  await user.type(input, ' edit');
  await user.click(discard);
  expect(input).toHaveValue('Billing API v2');
  expect(discard).toBeDisabled();
});

it.each(['dark', 'light', 'high_contrast'])('the edit settings actions have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const user = userEvent.setup();
  render(<FormEditSettings />);
  await expectNoAxeViolations();
  const save = screen.getByRole('button', { name: 'Save' });
  expect(save).toBeDisabled();
  await user.type(screen.getByRole('textbox', { name: 'Name' }), ' v2');
  await user.click(save);
  expect(save).toHaveAttribute('aria-busy', 'true');
  await expectNoAxeViolations();
  await screen.findByText('Settings saved.');
  await waitFor(() => expect(save).toBeDisabled());
  expect(save).not.toHaveAttribute('aria-busy');
  await expectNoAxeViolations();
});

it.each(['dark', 'light', 'high_contrast'])('the server errors example has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const user = userEvent.setup();
  const view = render(<FormServerErrors />);
  await expectNoAxeViolations();
  await user.type(screen.getByRole('textbox', { name: 'Workspace name' }), 'billing');
  await user.type(screen.getByRole('textbox', { name: 'Owner email' }), 'ana@example.invalid');
  await user.click(screen.getByRole('button', { name: 'Create workspace' }));
  expect(await screen.findByText('That name is taken.')).toBeVisible();
  expect(screen.getByText('This email domain is not allowed.')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Workspace name' })).toHaveFocus());
  await expectNoAxeViolations();
  view.unmount();
  document.documentElement.className = '';
});

it('the server errors example falls back to a form-level alert for the quota error', async () => {
  const user = userEvent.setup();
  render(<FormServerErrors />);
  const name = screen.getByRole('textbox', { name: 'Workspace name' });
  const email = screen.getByRole('textbox', { name: 'Owner email' });
  await user.type(email, 'ana@example.test');
  for (const workspace of ['alpha', 'beta']) {
    await user.clear(name);
    await user.type(name, workspace);
    await user.click(screen.getByRole('button', { name: 'Create workspace' }));
    await screen.findByText('Workspace created.');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create workspace' })).not.toHaveAttribute('aria-busy'),
    );
  }
  await user.click(screen.getByRole('button', { name: 'Create workspace' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Quota exceeded for this workspace.');
  await expectNoAxeViolations();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Create workspace' })).not.toHaveAttribute('aria-busy'),
  );
  await user.click(screen.getByRole('button', { name: 'Create workspace' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Quota exceeded for this workspace.'));
});

it('localizes the server errors example', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <FormServerErrors />
    </I18nProvider>,
  );
  await user.type(screen.getByRole('textbox', { name: 'Nombre del espacio' }), 'billing');
  await user.type(screen.getByRole('textbox', { name: 'Correo del propietario' }), 'ana@example.test');
  await user.click(screen.getByRole('button', { name: 'Crear espacio' }));
  expect(await screen.findByText('Ese nombre ya está en uso.')).toBeVisible();
});
