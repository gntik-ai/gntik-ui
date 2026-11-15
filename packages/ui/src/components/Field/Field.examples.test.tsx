import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n';
import FieldAsyncStatus from './examples/FieldAsyncStatus';
import FormAsyncValidation from '../../forms/examples/FormAsyncValidation';

it.each(['dark', 'light', 'high_contrast'])('status examples have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const view = render(
    <>
      <FieldAsyncStatus />
      <FormAsyncValidation />
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Warning' }));
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Validating' }));
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Success' }));
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
});

it.each(['dark', 'light', 'high_contrast'])('async form feedback has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const view = render(<FormAsyncValidation />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'taken' } });
  await act(async () => {
    fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form')!);
  });
  expect(screen.getByText('Checking…', { selector: '[role="status"]' })).toBeInTheDocument();
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
  await waitFor(() => expect(input).toHaveAccessibleDescription(/That slug is taken\./), { timeout: 2000 });
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
  fireEvent.change(input, { target: { value: 'available' } });
  await waitFor(() => expect(input).toHaveAccessibleDescription(/Slug is available\./), { timeout: 2000 });
  await act(async () => {
    await expectNoAxeViolations(view.container);
  });
});

it('localizes all status example labels into Spanish', () => {
  render(
    <I18nProvider locale="es">
      <FieldAsyncStatus />
      <FormAsyncValidation />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Validando' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  expect(screen.getAllByRole('textbox', { name: 'Identificador del espacio' })).toHaveLength(3);
});
