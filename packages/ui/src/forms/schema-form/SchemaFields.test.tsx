import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { FormDialog } from '../../components/FormDialog';
import { Form, SchemaFields, SchemaForm, useFormDialog, type JsonSchema } from '..';

const schema: JsonSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', title: 'Query' },
    limit: { type: 'integer', maximum: 50, default: 10 },
  },
};
it.each([false, true])('validates in a dialog with provider=%s and keeps it open on errors', async (provider) => {
  const save = vi.fn();
  function Example() {
    const form = useForm<{ query: string; limit: number }>();
    const fields = <SchemaFields schema={schema} control={provider ? undefined : form.control} />;
    const dialog = useFormDialog(form, save);
    return (
      <FormDialog title="Search" trigger={<Button />} {...dialog}>
        {provider ? <FormProvider {...form}>{fields}</FormProvider> : fields}
      </FormDialog>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await screen.findByRole('dialog', { name: 'Search' });
  expect(screen.getByRole('textbox', { name: 'Limit' })).toHaveValue('10');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Required')).toBeVisible();
  expect(screen.getByRole('dialog')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
  expect(save).not.toHaveBeenCalled();
  await user.type(screen.getByRole('textbox', { name: 'Query' }), 'gntik');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith({ query: 'gntik', limit: 10 }));
});
it('validates field array and nested issue paths without requiring a parent resolver', async () => {
  function Example() {
    const form = useForm<Record<string, unknown>>();
    return (
      <Form form={form} onSubmit={vi.fn()}>
        <SchemaFields
          schema={{
            type: 'object',
            properties: {
              headers: {
                type: 'array',
                minItems: 1,
                items: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
              },
            },
          }}
        />
        <Button type="submit">Save</Button>
      </Form>
    );
  }
  render(<Example />);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Add at least 1 item.')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('button', { name: /Add item/ })).toHaveFocus());
  await userEvent.click(screen.getByRole('button', { name: /Add item/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Required')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
});
it('applies nested object and object-array schema defaults with an explicit control', () => {
  function Example() {
    const form = useForm<Record<string, unknown>>();
    return (
      <SchemaFields
        control={form.control}
        schema={{
          type: 'object',
          properties: {
            auth: { type: 'object', default: { token: 'default-token' }, properties: { token: { type: 'string' } } },
            headers: {
              type: 'array',
              default: [{ name: 'Accept' }],
              items: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        }}
      />
    );
  }
  render(<Example />);
  expect(screen.getByRole('textbox', { name: 'Token' })).toHaveValue('default-token');
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Accept');
});
it.each([false, true])('shows array item errors on the composite control, fieldsOnly=%s', async (fieldsOnly) => {
  const arraySchema: JsonSchema = {
    type: 'object',
    properties: { tags: { type: 'array', items: { type: 'string', minLength: 5 } } },
  };
  const submit = vi.fn();
  function Example() {
    const form = useForm<Record<string, unknown>>();
    return fieldsOnly ? (
      <Form form={form} onSubmit={submit}>
        <SchemaFields schema={arraySchema} />
        <Button type="submit">Save</Button>
      </Form>
    ) : (
      <SchemaForm schema={arraySchema} onSubmit={submit} />
    );
  }
  render(<Example />);
  await userEvent.type(screen.getByRole('textbox', { name: 'Tags' }), 'bad{Enter}');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter at least 5 characters.')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveFocus());
  expect(submit).not.toHaveBeenCalled();
});
