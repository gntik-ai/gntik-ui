import { Input } from '../../components/Input';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n';
import { SchemaForm, toValueProps, type SchemaWidget, type JsonSchema } from '..';

const schema: JsonSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', title: 'Query' },
    limit: { type: 'integer', title: 'Limit', minimum: 1, maximum: 50, default: 10 },
    safe: { type: 'boolean', default: true },
    region: { enum: ['us', 'eu', 'apac'] },
    tags: { type: 'array', items: { type: 'string' } },
  },
};
it('renders the kit controls, validates and submits the exact typed payload', async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(<SchemaForm schema={schema} onSubmit={submit} />);
  const query = screen.getByRole('textbox', { name: /Query/ });
  expect(query.closest('[data-field]') ?? query.parentElement?.parentElement).toHaveTextContent('*');
  expect(screen.getByRole('textbox', { name: 'Limit' })).toHaveValue('10');
  expect(screen.getByRole('switch', { name: 'Safe' })).toBeChecked();
  expect(within(screen.getByRole('radiogroup', { name: 'Region' })).getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Required')).toBeVisible();
  await waitFor(() => expect(query).toHaveFocus());
  expect(submit).not.toHaveBeenCalled();
  await user.type(query, 'gntik');
  await user.click(screen.getByRole('radio', { name: 'eu' }));
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ query: 'gntik', limit: 10, safe: true, region: 'eu' }));
});
it('shows the maximum message for invalid defaults without native validation blocking submit', async () => {
  render(<SchemaForm schema={schema} defaultValues={{ query: 'x', limit: 60 }} onSubmit={vi.fn()} />);
  fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form')!);
  expect(await screen.findByText('Enter 50 or less.')).toBeVisible();
});
it('localizes required validation', async () => {
  render(
    <I18nProvider locale="es">
      <SchemaForm schema={schema} onSubmit={vi.fn()} />
    </I18nProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(await screen.findByText('Obligatorio')).toBeVisible();
});
it('renders long enums and titled const choices, submitting the original const values', async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          choice: { enum: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] },
          mode: {
            oneOf: [
              { const: 1, title: 'Fast' },
              { const: 2, title: 'Careful' },
            ],
          },
        },
      }}
      onSubmit={submit}
    />,
  );
  await user.click(screen.getByRole('combobox', { name: 'Choice' }));
  expect(await screen.findAllByRole('option')).toHaveLength(8);
  await user.click(screen.getByRole('option', { name: 'h' }));
  await user.click(screen.getByRole('radio', { name: 'Careful' }));
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ choice: 'h', mode: 2 }));
});
it('renders date, password, email, uri, multiline and enum array controls', async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          day: { type: 'string', format: 'date', default: '2026-10-01' },
          secret: { type: 'string', writeOnly: true },
          email: { type: 'string', format: 'email' },
          url: { type: 'string', format: 'uri' },
          note: { type: 'string', maxLength: 1000 },
          choices: { type: 'array', items: { type: 'string', enum: ['a', 'b'] } },
        },
      }}
      onSubmit={submit}
    />,
  );
  expect(screen.getByLabelText('Secret')).toHaveAttribute('type', 'password');
  expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  expect(screen.getByLabelText('Url')).toHaveAttribute('type', 'url');
  expect(screen.getByRole('textbox', { name: 'Note' }).tagName).toBe('TEXTAREA');
  const day = screen.getByRole('combobox', { name: 'Day' });
  expect(day).toHaveAttribute('readonly');
  await user.click(day);
  expect(await screen.findByRole('grid')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('combobox', { name: 'Choices' }));
  await user.click(await screen.findByRole('option', { name: 'b' }));
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ day: '2026-10-01', choices: ['b'] }));
});
it('renders referenced fieldsets with dotted names and constrained object arrays', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(
    <SchemaForm
      schema={{
        type: 'object',
        $defs: { header: { type: 'object', title: 'Authentication', properties: { token: { type: 'string' } } } },
        properties: {
          auth: { $ref: '#/$defs/header' },
          headers: {
            type: 'array',
            minItems: 1,
            maxItems: 1,
            items: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
          },
        },
      }}
      onSubmit={submit}
    />,
  );
  const auth = screen.getByRole('group', { name: 'Authentication' });
  expect(within(auth).getByRole('textbox', { name: 'Token' })).toHaveAttribute('name', 'auth.token');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Add at least 1 item.')).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: /Add item/ }));
  expect(screen.getByRole('button', { name: /Add item/ })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Required')).toBeVisible();
  const name = within(screen.getByRole('group', { name: 'Headers' })).getByRole('textbox', { name: 'Name' });
  await waitFor(() => expect(name).toHaveFocus());
  await user.type(name, 'Accept');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ auth: {}, headers: [{ name: 'Accept' }] }));
});
it('applies ui overrides, ordering, columns, custom widget state and onChange', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const widgetProps = vi.fn();
  const Model: SchemaWidget = (props) => {
    widgetProps(props);
    const p = toValueProps(props.controlProps);
    return <Input {...p} value={typeof p.value === 'string' ? p.value : ''} />;
  };
  const { container } = render(
    <SchemaForm
      schema={{
        type: 'object',
        required: ['model'],
        properties: {
          model: { type: 'string', minLength: 3 },
          limit: { type: 'integer', default: 10 },
          invisible: { type: 'string' },
        },
      }}
      ui={{
        model: { widget: 'model', label: 'Model name', description: 'Pick carefully' },
        limit: { order: 0, placeholder: 'Count' },
        invisible: { hidden: true },
      }}
      widgets={{ model: Model }}
      columns={2}
      onSubmit={vi.fn()}
      onChange={change}
    />,
  );
  expect(screen.queryByRole('textbox', { name: 'Invisible' })).not.toBeInTheDocument();
  expect(screen.getByPlaceholderText('Count')).toBeInTheDocument();
  expect(screen.getByText('Pick carefully')).toBeVisible();
  expect(container.querySelector('.sm\\:grid-cols-2')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')[0]).toHaveAccessibleName('Limit');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Required')).toBeVisible();
  expect(widgetProps.mock.lastCall?.[0]).toMatchObject({
    name: 'model',
    schema: { type: 'string' },
    controlProps: { name: 'model' },
    fieldState: { invalid: true },
  });
  await user.type(screen.getByRole('textbox', { name: 'Model name' }), 'abc');
  await waitFor(() => expect(change).toHaveBeenLastCalledWith({ model: 'abc', limit: 10 }));
});
it('renders schema text literally and rejects malformed JSON with one development warning', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const user = userEvent.setup();
  const submit = vi.fn();
  const { container } = render(
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          config: { type: 'object', if: {}, then: {}, description: '<img src=x onerror=alert(1)>' },
        },
      }}
      onSubmit={submit}
    />,
  );
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
  expect(container.querySelector('img')).toBeNull();
  const input = screen.getByRole('textbox', { name: 'Config' });
  expect(input.tagName).toBe('TEXTAREA');
  await user.type(input, '{{oops');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter valid JSON.')).toBeVisible();
  expect(input).toHaveFocus();
  expect(submit).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toContain('if');
  await user.clear(input);
  fireEvent.change(input, { target: { value: '{"ok":true}' } });
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ config: { ok: true } }));
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});
it('does not warn about JSON fallbacks in production', () => {
  vi.stubEnv('NODE_ENV', 'production');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(<SchemaForm schema={{ type: 'object', properties: { config: { if: {} } } }} onSubmit={vi.fn()} />);
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
  vi.unstubAllEnvs();
});
it('lets a supplied resolver completely replace validation and transformation', async () => {
  const submit = vi.fn();
  render(
    <SchemaForm
      schema={{ type: 'object', required: ['query'], properties: { query: { type: 'string' } } }}
      resolver={() => ({ values: { server: 'accepted' }, errors: {} })}
      onSubmit={submit}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ server: 'accepted' }));
});
it('keeps string defaults as JSON string values in unsupported schema fields', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const submit = vi.fn();
  render(
    <SchemaForm
      schema={{ type: 'object', properties: { config: { if: {}, default: 'literal' } } }}
      onSubmit={submit}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ config: 'literal' }));
  warning.mockRestore();
});
