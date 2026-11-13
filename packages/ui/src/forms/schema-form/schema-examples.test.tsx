import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n';
import { expectNoAxeViolations } from '../../test/a11y';
import SchemaFormToolParameters from './examples/SchemaFormToolParameters';
import SchemaFormProviderSettings from './examples/SchemaFormProviderSettings';
import SchemaFormNestedHeaders from './examples/SchemaFormNestedHeaders';
import SchemaFormCustomWidget from './examples/SchemaFormCustomWidget';
import SchemaFormDialog from './examples/SchemaFormDialog';
import SchemaFormJsonFallback from './examples/SchemaFormJsonFallback';

const examples = [
  SchemaFormToolParameters,
  SchemaFormProviderSettings,
  SchemaFormNestedHeaders,
  SchemaFormCustomWidget,
  SchemaFormJsonFallback,
];
describe.each(['dark', 'light', 'high_contrast'])('%s schema examples', (theme) => {
  beforeEach(() => {
    document.documentElement.className = theme;
  });
  afterEach(() => {
    document.documentElement.className = '';
  });
  it.each(examples)('%s is axe clean before and after validation', async (Example) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Example />);
    await expectNoAxeViolations();
    const submit = screen.getByRole('button', { name: /Save|Run search/ });
    await userEvent.click(submit);
    await expectNoAxeViolations();
    warning.mockRestore();
  });
  it('the dialog example is axe clean, including its errors', async () => {
    render(<SchemaFormDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit search parameters' }));
    const dialog = await screen.findByRole('dialog');
    await expectNoAxeViolations(dialog);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Required')).toBeVisible();
    await expectNoAxeViolations(dialog);
  });
});
it('supports Tab and Shift+Tab, keyboard submit, radio arrows and token commits', async () => {
  const user = userEvent.setup();
  render(<SchemaFormToolParameters />);
  await user.tab(); // Disable fields.
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Limit' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('textbox', { name: 'Limit' })).toHaveFocus();
  const run = screen.getByRole('button', { name: 'Run search' });
  run.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Required')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
  await user.type(screen.getByRole('textbox', { name: 'Query' }), 'gntik');
  await user.click(screen.getByRole('radio', { name: 'United States' }));
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('radio', { name: 'Europe' })).toBeChecked();
  await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'docs{Enter}');
  expect(screen.getByRole('button', { name: 'Remove docs' })).toBeInTheDocument();
  await user.click(run);
  expect(await screen.findByText('Settings saved.')).toBeVisible();
});
it('opens the calendar by keyboard and returns focus on Escape', async () => {
  const user = userEvent.setup();
  render(<SchemaFormProviderSettings />);
  const input = screen.getByRole('combobox', { name: 'Start date' });
  input.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('grid')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(input).toHaveFocus());
});
it('localizes example and schema text in Spanish', () => {
  render(
    <I18nProvider locale="es">
      <SchemaFormToolParameters />
    </I18nProvider>,
  );
  expect(screen.getByRole('textbox', { name: 'Consulta' })).toHaveAttribute('placeholder', 'Términos de búsqueda');
  expect(screen.getByRole('radio', { name: 'Europa' })).toBeInTheDocument();
});
