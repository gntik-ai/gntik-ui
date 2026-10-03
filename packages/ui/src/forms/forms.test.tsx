import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { expectNoAxeViolations } from '../test/a11y';
import { Button } from '../components/Button';
import { Field, FieldError, FieldLabel } from '../components/Field';
import { Input } from '../components/Input';
import { Form, FormField, issuesToErrors, schemaResolver, useFieldProps } from '.';
import FormInviteMember from './examples/FormInviteMember';

describe('@gntik-ai/ui/forms', () => {
  it('submit with errors shows every message and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<FormInviteMember />);
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('Enter a name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Choose a role.')).toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: /Full name/ });
    await waitFor(() => expect(name).toHaveFocus());
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Enter a name.');
    const email = screen.getByRole('textbox', { name: /Email/ });
    expect(email).toHaveAccessibleDescription(expect.stringContaining('Enter a valid email address.'));
    expect(email).toHaveAccessibleDescription(expect.stringContaining('We send the invitation here.'));
  });

  it('focuses the first invalid field in order (skipping valid ones)', async () => {
    const user = userEvent.setup();
    render(<FormInviteMember />);
    await user.type(screen.getByRole('textbox', { name: /Full name/ }), 'Mara Vidal');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Email/ })).toHaveFocus());
    expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument();
  });

  it('clears messages once fixed and submits the parsed values', async () => {
    const user = userEvent.setup();
    render(<FormInviteMember />);
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    await screen.findByText('Enter a name.');
    await user.type(screen.getByRole('textbox', { name: /Full name/ }), '  Mara Vidal ');
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'mara@example.com');
    await user.click(screen.getByRole('combobox', { name: /Role/ }));
    await user.click(await screen.findByRole('option', { name: 'Editor' }));
    await waitFor(() => expect(screen.queryByText('Choose a role.')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('Invitation sent to mara@example.com.')).toBeInTheDocument();
    expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Full name/ })).not.toHaveAttribute('aria-invalid');
  });

  it('useFieldProps wires field rules into a hand-built Field', async () => {
    function Manual() {
      const form = useForm<{ code: string }>({ defaultValues: { code: '' } });
      const { fieldProps, controlProps, error } = useFieldProps('code', { control: form.control, rules: { required: 'Enter the code.' } });
      return (
        <form noValidate onSubmit={form.handleSubmit(() => {})}>
          <Field {...fieldProps}>
            <FieldLabel>Code</FieldLabel>
            <Input {...controlProps} />
            <FieldError match={!!error}>{error}</FieldError>
          </Field>
          <Button type="submit">Verify</Button>
        </form>
      );
    }
    const user = userEvent.setup();
    render(<Manual />);
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    const input = screen.getByRole('textbox', { name: 'Code' });
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter the code.');
  });

  it('Form + FormField work with field-level rules and no schema', async () => {
    function Rules() {
      const form = useForm<{ project: string }>({ defaultValues: { project: '' } });
      return (
        <Form form={form} onSubmit={() => {}}>
          <FormField name="project" label="Project" rules={{ minLength: { value: 3, message: 'At least 3 characters.' } }}>
            {(field) => <Input {...field} />}
          </FormField>
          <Button type="submit">Create</Button>
        </Form>
      );
    }
    const user = userEvent.setup();
    render(<Rules />);
    await user.type(screen.getByRole('textbox', { name: 'Project' }), 'ab');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('At least 3 characters.')).toBeInTheDocument();
  });

  it('schemaResolver maps nested zod issues to react-hook-form errors', async () => {
    const schema = z.object({ owner: z.object({ email: z.email('Bad email.') }), tags: z.array(z.string().min(2, 'Too short.')) });
    const resolver = schemaResolver(schema);
    const result = await resolver({ owner: { email: 'x' }, tags: ['ok', 'x'] }, undefined, { fields: {}, shouldUseNativeValidation: false });
    expect(result.errors).toEqual({
      owner: { email: { type: 'invalid_format', message: 'Bad email.' } },
      tags: { 1: { type: 'too_small', message: 'Too short.' } },
    });
    const ok = await resolver({ owner: { email: 'a@b.co' }, tags: ['ok'] }, undefined, { fields: {}, shouldUseNativeValidation: false });
    expect(ok).toEqual({ values: { owner: { email: 'a@b.co' }, tags: ['ok'] }, errors: {} });
    expect(issuesToErrors([{ path: [], message: 'Form-level.' }])).toEqual({ root: { type: 'validate', message: 'Form-level.' } });
  });

  it('FormInviteMember has no axe violations, before and after a failed submit', async () => {
    const user = userEvent.setup();
    render(<FormInviteMember />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    await screen.findByText('Enter a name.');
    await expectNoAxeViolations();
  });
});
