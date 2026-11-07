import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../components/Button';
import { FormDialog } from '../components/FormDialog';
import { Input } from '../components/Input';
import { FormField, schemaResolver, useFormDialog } from '.';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  limit: z.string().min(1, 'Enter a limit.'),
});
type Input_ = z.input<typeof schema>;
type Output = z.output<typeof schema>;

function Harness({ save }: { save: (values: Output) => void | boolean | string | Promise<void | boolean | string> }) {
  const form = useForm<Input_, unknown, Output>({
    resolver: schemaResolver<Input_, Output>(schema),
    defaultValues: { name: '', limit: '' },
  });
  const dialog = useFormDialog(form, save);
  return (
    <FormDialog title="New quota" trigger={<Button />} keepMounted {...dialog}>
      <FormField<Input_, 'name'> control={form.control} name="name" label="Name" required>
        {(field) => <Input {...field} />}
      </FormField>
      <FormField<Input_, 'limit'> control={form.control} name="limit" label="Limit" required>
        {(field) => <Input {...field} />}
      </FormField>
    </FormDialog>
  );
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'New quota' }));
  await screen.findByRole('dialog', { name: 'New quota' });
}

describe('useFormDialog', () => {
  it('keeps the dialog open, skips save, focuses the first invalid field and shows its error', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<Harness save={save} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Enter a name.')).toBeVisible();
    expect(screen.getByText('Enter a limit.')).toBeVisible();
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Name/ })).toHaveFocus());
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls save with the parsed values and closes', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<Harness save={save} />);
    await open(user);
    await user.type(screen.getByRole('textbox', { name: /Name/ }), '  monthly ');
    await user.type(screen.getByRole('textbox', { name: /Limit/ }), '250');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ name: 'monthly', limit: '250' });
  });

  it('lets the save result and rejection drive the dialog', async () => {
    const user = userEvent.setup();
    const outcomes = [() => 'Quota name already exists', () => Promise.reject(new Error('Timeout')), () => false];
    render(<Harness save={() => outcomes.shift()!()} />);
    await open(user);
    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'a');
    await user.type(screen.getByRole('textbox', { name: /Limit/ }), '1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Quota name already exists');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Timeout'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
  });

  it('resets the form to its default values when the dialog closes', async () => {
    const user = userEvent.setup();
    render(<Harness save={() => undefined} />);
    await open(user);
    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'staging');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await act(async () => undefined);
    await open(user);
    expect(screen.getByRole('textbox', { name: /Name/ })).toHaveValue('');
  });
});
