import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { expectNoAxeViolations } from '../test/a11y';
import { I18nProvider } from '../i18n';
import { Button } from '../components/Button';
import { Field, FieldError, FieldLabel } from '../components/Field';
import { DatePicker } from '../components/DatePicker';
import { TimePicker } from '../components/TimePicker';
import { RadioGroup, Radio } from '../components/RadioGroup';
import { NumberInput } from '../components/NumberInput';
import { Textarea } from '../components/Textarea';
import { Switch } from '../components/Switch';
import { SimpleSelect } from '../components/Select';
import { toValueProps, toCheckedProps } from './bindings';
import { Input } from '../components/Input';
import {
  Form,
  FormField,
  FormSubmit,
  FormReset,
  useFormActions,
  issuesToErrors,
  schemaResolver,
  useFieldProps,
} from '.';
import FormInviteMember from './examples/FormInviteMember';

describe('@gntik-ai/ui/forms', () => {
  it('submit with errors shows every message and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<FormInviteMember />);
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('Enter a name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Choose a role.')).toBeInTheDocument();
    const role = screen.getByRole('combobox', { name: /Role/ });
    expect(role).toHaveAttribute('aria-invalid', 'true');
    expect(role).toHaveAttribute('data-invalid');
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
    expect(screen.getByRole('combobox', { name: /Role/ })).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('combobox', { name: /Role/ })).not.toHaveAttribute('data-invalid');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('Invitation sent to mara@example.com.')).toBeInTheDocument();
    expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Full name/ })).not.toHaveAttribute('aria-invalid');
  });

  it('useFieldProps wires field rules into a hand-built Field', async () => {
    function Manual() {
      const form = useForm<{ code: string }>({ defaultValues: { code: '' } });
      const { fieldProps, controlProps, error } = useFieldProps('code', {
        control: form.control,
        rules: { required: 'Enter the code.' },
      });
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
          <FormField
            name="project"
            label="Project"
            rules={{ minLength: { value: 3, message: 'At least 3 characters.' } }}
          >
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
    const schema = z.object({
      owner: z.object({ email: z.email('Bad email.') }),
      tags: z.array(z.string().min(2, 'Too short.')),
    });
    const resolver = schemaResolver(schema);
    const result = await resolver({ owner: { email: 'x' }, tags: ['ok', 'x'] }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    });
    expect(result.errors).toEqual({
      owner: { email: { type: 'invalid_format', message: 'Bad email.' } },
      tags: { 1: { type: 'too_small', message: 'Too short.' } },
    });
    const ok = await resolver({ owner: { email: 'a@b.co' }, tags: ['ok'] }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    });
    expect(ok).toEqual({ values: { owner: { email: 'a@b.co' }, tags: ['ok'] }, errors: {} });
    expect(issuesToErrors([{ path: [], message: 'Form-level.' }])).toEqual({
      root: { type: 'validate', message: 'Form-level.' },
    });
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

describe('FormField bindings', () => {
  it('spreads value and checked props, touches committed values and preserves the input path', async () => {
    const submit = vi.fn();
    function Bindings() {
      const form = useForm<{ role?: string; alerts?: boolean; title: string }>({
        defaultValues: { title: '' },
        mode: 'onTouched',
      });
      return (
        <Form form={form} onSubmit={submit}>
          <FormField name="role" bind="value" label="Role" rules={{ required: 'Choose a role.' }}>
            {(props, state) => {
              expect(props).toEqual({
                ...toValueProps(state.controlProps),
                onValueChange: expect.any(Function),
                ref: expect.any(Function),
              });
              expect(props).not.toHaveProperty('onChange');
              return (
                <>
                  <SimpleSelect {...props} items={[{ value: 'editor', label: 'Editor' }]} />
                  <output aria-label="Role touched">{String(state.fieldState.isTouched)}</output>
                </>
              );
            }}
          </FormField>
          <FormField name="alerts" bind="checked" label="Alerts">
            {(props, state) => {
              expect(props).toEqual({
                ...toCheckedProps(state.controlProps),
                onCheckedChange: expect.any(Function),
                ref: expect.any(Function),
              });
              return <Switch {...props} />;
            }}
          </FormField>
          <FormField name="title" label="Title">
            {(props, state) => {
              expect(props).toBe(state.controlProps);
              return <Input {...props} />;
            }}
          </FormField>
          <Button type="submit">Save</Button>
        </Form>
      );
    }
    const errors = vi.spyOn(console, 'error');
    const user = userEvent.setup();
    render(<Bindings />);
    expect(screen.getByRole('switch')).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Choose a role.');
    await user.click(screen.getByRole('combobox', { name: 'Role' }));
    await user.click(await screen.findByRole('option', { name: 'Editor' }));
    await waitFor(() => expect(screen.queryByText('Choose a role.')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Role touched')).toHaveTextContent('true');
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({ role: 'editor', alerts: true, title: '' }, expect.anything()),
    );
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/uncontrolled|controlled/i);
    errors.mockRestore();
  });
});

it.each(['select', 'date', 'time', 'empty radio', 'checked radio'])(
  'failed submit focuses the bound %s',
  async (kind) => {
    function Invalid() {
      const form = useForm<{ choice: string | Date | null }>({
        defaultValues: { choice: kind === 'checked radio' ? 'editor' : null },
      });
      return (
        <Form form={form} onSubmit={() => {}}>
          <FormField name="choice" bind="value" label="Choice" rules={{ validate: () => 'Required' }}>
            {(props) =>
              kind === 'select' ? (
                <SimpleSelect
                  {...props}
                  value={props.value as string | null}
                  items={[{ value: 'editor', label: 'Editor' }]}
                />
              ) : kind === 'date' ? (
                <DatePicker {...props} value={props.value as Date | null} />
              ) : kind === 'time' ? (
                <TimePicker {...props} value={props.value as string | null} />
              ) : (
                <RadioGroup {...props} aria-label="Choice">
                  <Radio value="viewer" label="Viewer" />
                  <Radio value="editor" label="Editor" />
                </RadioGroup>
              )
            }
          </FormField>
          <Button type="submit">Save</Button>
        </Form>
      );
    }
    const user = userEvent.setup();
    render(<Invalid />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Required');
    const target =
      kind === 'time'
        ? screen.getByRole('spinbutton', { name: 'Hours' })
        : kind.endsWith('radio')
          ? screen.getAllByRole('radio')[kind === 'checked radio' ? 1 : 0]
          : screen.getByRole('combobox', { name: 'Choice' });
    await waitFor(() => expect(target).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
);

it.each(['readOnly', 'disabled', 'unchanged'] as const)('enhances fields with %s props', (mode) => {
  function Enhanced() {
    const form = useForm({ defaultValues: { title: 'Before', note: 'Note', count: 1, role: 'editor', alerts: false } });
    return (
      <Form
        form={form}
        onSubmit={() => {}}
        enhanceFieldProps={() => (mode === 'unchanged' ? undefined : { [mode]: true })}
      >
        <FormField name="title" label="Title">
          {(p) => <Input {...p} />}
        </FormField>
        <FormField name="note" label="Note">
          {(p) => <Textarea {...p} />}
        </FormField>
        <FormField name="count" label="Count" bind="value">
          {(p) => <NumberInput {...p} />}
        </FormField>
        <FormField name="role" label="Role" bind="value">
          {(p) => <SimpleSelect {...p} items={[{ value: 'editor', label: 'Editor' }]} />}
        </FormField>
        <FormField name="alerts" label="Alerts" bind="checked">
          {(p) => <Switch {...p} />}
        </FormField>
      </Form>
    );
  }
  render(<Enhanced />);
  const inputs = [
    screen.getByRole('textbox', { name: 'Title' }),
    screen.getByRole('textbox', { name: 'Note' }),
    screen.getByRole('textbox', { name: 'Count' }),
  ];
  for (const input of inputs) {
    if (mode === 'readOnly') expect(input).toHaveAttribute('readonly');
    else if (mode === 'disabled') expect(input).toBeDisabled();
    else {
      expect(input).not.toHaveAttribute('readonly');
      expect(input).toBeEnabled();
    }
  }
  const select = screen.getByRole('combobox', { name: 'Role' });
  if (mode === 'disabled') {
    expect(select).toHaveAttribute('data-disabled');
    expect(screen.getByRole('switch')).toHaveAttribute('data-disabled');
    for (const label of ['Title', 'Note', 'Count', 'Role', 'Alerts'])
      expect(screen.getByText(label, { selector: 'label' }).parentElement).toHaveAttribute('data-disabled');
  } else if (mode === 'readOnly') expect(select).toHaveAttribute('aria-readonly', 'true');
  else expect(select).not.toHaveAttribute('aria-readonly', 'true');
});

it.each([
  ['xs', 'max-w-[6.5rem]'],
  ['sm', 'max-w-[13.5rem]'],
  ['md', 'max-w-[20.5rem]'],
  ['lg', 'max-w-[27.5rem]'],
  ['xl', 'max-w-[34.5rem]'],
  [undefined, undefined],
] as const)('caps the Field width for %s', (width, expected) => {
  function Width() {
    const form = useForm({ defaultValues: { name: '' } });
    return (
      <Form form={form} onSubmit={() => {}}>
        <FormField name="name" label="Name" width={width} className="custom-field">
          {(p) => <Input {...p} />}
        </FormField>
      </Form>
    );
  }
  render(<Width />);
  const field = screen.getByText('Name').parentElement;
  expect(field).toHaveClass('custom-field');
  if (expected) expect(field).toHaveClass(expected);
  else expect(field?.className).not.toContain('max-w-');
});

it.each(['date', 'time'] as const)('normalizes an undefined %s default without controlled warnings', async (kind) => {
  const errors = vi.spyOn(console, 'error');
  function UndefinedPicker() {
    const form = useForm<{ date?: Date; time?: string }>();
    return (
      <Form form={form} onSubmit={() => {}}>
        {kind === 'date' ? (
          <FormField<{ date?: Date }, 'date'> name="date" bind="value" label="Date">
            {(p) => {
              expect(p.value).toBeNull();
              return <DatePicker {...p} />;
            }}
          </FormField>
        ) : (
          <FormField<{ time?: string }, 'time'> name="time" bind="value" label="Time">
            {(p) => {
              expect(p.value).toBeNull();
              return <TimePicker {...p} />;
            }}
          </FormField>
        )}
      </Form>
    );
  }
  render(<UndefinedPicker />);
  if (kind === 'time') expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('data-placeholder');
  else expect(screen.getByRole('combobox', { name: 'Date' })).toHaveValue('');
  expect(errors.mock.calls.flat().join(' ')).not.toMatch(/uncontrolled|controlled/i);
  errors.mockRestore();
});

it('guards simultaneous native submissions and Enter until the request settles', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const submit = vi.fn(() => pending);
  function Pending() {
    const form = useForm({ defaultValues: { name: 'Billing API' } });
    return (
      <Form form={form} onSubmit={submit} aria-label="Settings">
        <FormField name="name" label="Name">
          {(p) => <Input {...p} />}
        </FormField>
        <Button type="submit">Save</Button>
      </Form>
    );
  }
  const user = userEvent.setup();
  render(<Pending />);
  const element = screen.getByRole('form', { name: 'Settings' }) as HTMLFormElement;
  act(() => {
    element.requestSubmit();
    element.requestSubmit();
  });
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  await user.dblClick(screen.getByRole('button', { name: 'Save' }));
  await user.click(screen.getByRole('textbox', { name: 'Name' }));
  await user.keyboard('{Enter}');
  expect(submit).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
});

it('announces pending submission, shows a spinner and keeps the submit button focused', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Pending() {
    const form = useForm({ defaultValues: { name: 'Billing API' } });
    return (
      <Form form={form} onSubmit={() => pending}>
        <FormSubmit>Send invitation</FormSubmit>
      </Form>
    );
  }
  const user = userEvent.setup();
  render(<Pending />);
  const button = screen.getByRole('button', { name: 'Send invitation' });
  await user.click(button);
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button.querySelector('svg')).toBeInTheDocument();
  expect(button).toHaveFocus();
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByRole('status')).toHaveClass('sr-only');
  expect(screen.getByRole('status')).toHaveTextContent('Submitting…');
  await act(async () => finish());
  await waitFor(() => expect(button).not.toHaveAttribute('aria-busy'));
  expect(button).toBeEnabled();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

it('guards every submit route during async validation and permits retry after invalid input', async () => {
  let finishValidation!: () => void;
  const validation = new Promise<void>((resolve) => {
    finishValidation = resolve;
  });
  const submit = vi.fn();
  const invalid = vi.fn();
  const schema = z.object({
    name: z.string().refine(async (name) => {
      await validation;
      return name.length > 0;
    }, 'Enter a name.'),
  });
  function AsyncValidation() {
    const form = useForm({ defaultValues: { name: '' }, resolver: schemaResolver(schema) });
    return (
      <Form form={form} onSubmit={submit} onInvalid={invalid}>
        <FormField name="name" label="Name">
          {(props) => <Input {...props} />}
        </FormField>
        <FormSubmit />
        <ActionControls />
      </Form>
    );
  }
  const user = userEvent.setup();
  render(<AsyncValidation />);
  const save = screen.getByRole('button', { name: 'Save' });
  const input = screen.getByRole('textbox', { name: 'Name' });
  await user.dblClick(save);
  expect(save).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Submitting…');
  await user.click(input);
  await user.keyboard('{Enter}');
  await user.dblClick(screen.getByRole('button', { name: 'Save via actions' }));
  expect(submit).not.toHaveBeenCalled();
  expect(invalid).not.toHaveBeenCalled();

  await act(async () => finishValidation());
  expect(await screen.findByText('Enter a name.')).toBeVisible();
  await waitFor(() => expect(input).toHaveFocus());
  expect(invalid).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  expect(save).toBeEnabled();
  expect(save).not.toHaveAttribute('aria-busy');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();

  await user.type(input, 'Billing API');
  await user.click(save);
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({ name: 'Billing API' }, expect.anything());
});

it('disables an opt-in edit submit only while its input matches the defaults', async () => {
  function Edit() {
    const form = useForm({ defaultValues: { name: 'Billing API' } });
    return (
      <Form form={form} onSubmit={() => {}}>
        <FormField name="name" label="Name">
          {(p) => <Input {...p} />}
        </FormField>
        <FormSubmit disableWhenClean />
        <FormSubmit>Always save</FormSubmit>
      </Form>
    );
  }
  const user = userEvent.setup();
  render(<Edit />);
  const save = screen.getByRole('button', { name: 'Save' });
  expect(save).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Always save' })).toBeEnabled();
  const input = screen.getByRole('textbox', { name: 'Name' });
  await user.type(input, ' v2');
  expect(save).toBeEnabled();
  await user.keyboard('{Backspace}{Backspace}{Backspace}');
  expect(input).toHaveValue('Billing API');
  expect(save).toBeDisabled();
});

function ActionControls() {
  const { submit, reset, isDirty, isSubmitting } = useFormActions();
  const { formState } = useFormContext<{ name: string }>();
  return (
    <>
      <Button onClick={submit}>Save via actions</Button>
      <Button onClick={reset}>Discard via actions</Button>
      <span aria-label="Dirty">{String(isDirty)}</span>
      <span aria-label="Submitting">{String(isSubmitting)}</span>
      <span aria-label="Default name">{formState.defaultValues?.name}</span>
    </>
  );
}

it('submits through a native event and exposes live state and reset through useFormActions', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const submit = vi.fn(() => pending);
  const nativeSubmit = vi.fn();
  function Edit() {
    const form = useForm({ defaultValues: { name: 'Billing API' } });
    return (
      <Form form={form} onSubmit={submit} onSubmitCapture={nativeSubmit}>
        <FormField name="name" label="Name">
          {(p) => <Input {...p} />}
        </FormField>
        <FormSubmit />
        <ActionControls />
      </Form>
    );
  }
  const user = userEvent.setup();
  render(<Edit />);
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('false');
  await user.type(screen.getByRole('textbox', { name: 'Name' }), ' v2');
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('true');
  await user.dblClick(screen.getByRole('button', { name: 'Save via actions' }));
  expect(nativeSubmit).toHaveBeenCalledTimes(2);
  expect(submit).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Submitting')).toHaveTextContent('true');
  await act(async () => finish());
  await waitFor(() => expect(screen.getByLabelText('Submitting')).toHaveTextContent('false'));
  // The default afterSubmit='keep' preserves edits and the original defaults.
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('true');
  await user.click(screen.getByRole('button', { name: 'Discard via actions' }));
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Billing API');
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('false');
});

function SavePolicyForm({
  onSubmit,
  afterSubmit,
}: {
  onSubmit: (values: { name: number }) => void | Promise<void>;
  afterSubmit?: 'keep' | 'rebase' | 'reset';
}) {
  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter a name.')
      .transform((name) => name.length),
  });
  const form = useForm<{ name: string }, unknown, { name: number }>({
    defaultValues: { name: 'Billing API' },
    resolver: schemaResolver(schema),
  });
  return (
    <Form form={form} onSubmit={onSubmit} afterSubmit={afterSubmit}>
      <FormField name="name" label="Name">
        {(p) => <Input {...p} />}
      </FormField>
      <FormSubmit />
      <FormReset />
      <ActionControls />
    </Form>
  );
}

it('rebases to raw inputs only after a transformed submission resolves', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const submit = vi.fn(() => pending);
  const user = userEvent.setup();
  render(<SavePolicyForm onSubmit={submit} afterSubmit="rebase" />);
  const input = screen.getByRole('textbox', { name: 'Name' });
  await user.clear(input);
  await user.type(input, '  Billing API v2  ');
  await user.click(screen.getByRole('button', { name: 'Save via actions' }));
  expect(submit).toHaveBeenCalledWith({ name: 14 }, expect.anything());
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('true');
  expect(screen.getByLabelText('Default name')).toHaveTextContent('Billing API');
  await act(async () => finish());
  await waitFor(() => expect(screen.getByLabelText('Dirty')).toHaveTextContent('false'));
  expect(input).toHaveValue('  Billing API v2  ');
  expect(screen.getByLabelText('Default name').textContent).toBe('  Billing API v2  ');
  await user.type(input, ' edit');
  await user.click(screen.getByRole('button', { name: 'Discard via actions' }));
  expect(input).toHaveValue('  Billing API v2  ');
});

it('restores original defaults after a successful reset-policy submission', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<SavePolicyForm onSubmit={submit} afterSubmit="reset" />);
  const input = screen.getByRole('textbox', { name: 'Name' });
  await user.type(input, ' v2');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.getByLabelText('Submitting')).toHaveTextContent('false'));
  expect(submit).toHaveBeenCalledWith({ name: 14 }, expect.anything());
  expect(input).toHaveValue('Billing API');
  expect(screen.getByLabelText('Dirty')).toHaveTextContent('false');
});

it('discards edits and validation messages and stays disabled while clean or submitting', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const submit = vi.fn(() => pending);
  const user = userEvent.setup();
  render(<SavePolicyForm onSubmit={submit} />);
  const input = screen.getByRole('textbox', { name: 'Name' });
  const discard = screen.getByRole('button', { name: 'Discard' });
  expect(discard).toHaveAttribute('type', 'button');
  expect(discard).toBeDisabled();
  expect(discard).toHaveClass('text-muted-foreground');
  await user.clear(input);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter a name.')).toBeInTheDocument();
  await waitFor(() => expect(input).toHaveFocus());
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Submitting')).toHaveTextContent('false');
  expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy');
  await user.click(discard);
  expect(input).toHaveValue('Billing API');
  expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument();
  expect(discard).toBeDisabled();
  await user.type(input, ' v2');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(discard).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(discard).toBeEnabled());
});

it('falls back to a plain submit button outside Form and warns once only in development', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    vi.stubEnv('NODE_ENV', 'development');
    const view = render(
      <StrictMode>
        <FormSubmit disableWhenClean />
      </StrictMode>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    view.rerender(
      <StrictMode>
        <FormSubmit disableWhenClean>Send</FormSubmit>
      </StrictMode>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('FormSubmit'));
    view.unmount();
    warn.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    const production = render(<FormSubmit />);
    expect(warn).not.toHaveBeenCalled();
    production.unmount();
    vi.stubEnv('NODE_ENV', 'test');
    render(<FormSubmit />);
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
    vi.unstubAllEnvs();
  }
});

it.each(['rebase', 'reset'] as const)(
  'propagates a rejected %s save, preserves edits, and permits retry',
  async (afterSubmit) => {
    const failure = new Error('Save rejected');
    const submit = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined);
    const observed: unknown[] = [];
    let receive!: (reason: unknown) => void;
    const propagated = new Promise<unknown>((resolve) => {
      receive = resolve;
    });
    // React DOM does not consume async event-handler promises. Observe the host's rejection
    // boundary to verify the existing propagation contract without leaking it to other tests.
    const onRejection = (reason: unknown) => {
      observed.push(reason);
      receive(reason);
    };
    process.on('unhandledRejection', onRejection);
    try {
      const user = userEvent.setup();
      render(<SavePolicyForm onSubmit={submit} afterSubmit={afterSubmit} />);
      const input = screen.getByRole('textbox', { name: 'Name' });
      await user.type(input, ' v2');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(await propagated).toBe(failure);
      await waitFor(() => expect(screen.getByLabelText('Submitting')).toHaveTextContent('false'));
      expect(input).toHaveValue('Billing API v2');
      expect(screen.getByLabelText('Dirty')).toHaveTextContent('true');
      expect(screen.getByLabelText('Default name').textContent).toBe('Billing API');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
      expect(observed).toEqual([failure]);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  },
);

it('requires Form for useFormActions', () => {
  expect(() => render(<ActionControls />)).toThrow('useFormActions must be used inside a Form.');
});

it('localizes the default actions and pending announcement in Spanish', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <SavePolicyForm onSubmit={() => pending} />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  const save = screen.getByRole('button', { name: 'Guardar' });
  await user.click(save);
  expect(screen.getByRole('status')).toHaveTextContent('Enviando…');
  await act(async () => finish());
  await waitFor(() => expect(save).not.toHaveAttribute('aria-busy'));
});
