import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import FormBindingsHelpers from './examples/FormBindingsHelpers';
import FormBindings from './examples/FormBindings';
import FormInviteMember from './examples/FormInviteMember';

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
