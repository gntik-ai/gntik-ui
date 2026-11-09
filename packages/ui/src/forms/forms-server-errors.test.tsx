import { StrictMode, type ReactNode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, type Resolver, type ResolverResult, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Form, FormField, FormReset, FormRootError, FormSubmit, type FormServerErrors } from '.';

interface Values {
  name: string;
  email: string;
}

interface Deferred {
  promise: Promise<void>;
  release: () => void;
  /** How many validations of Name have started (and are held until release). */
  started: number;
}

function deferred(): Deferred {
  let release = () => undefined as void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release, started: 0 };
}

type Validator = 'rules.validate' | 'resolver';

const clientMessage = 'Client: use at least 3 characters.';

interface HarnessProps {
  errors?: FormServerErrors;
  mode?: UseFormProps<Values>['mode'];
  /** Holds every validation of Name until released; Name then fails with the client message unless `pass`. */
  gate?: Deferred;
  /** Where the held validation lives: a field rule (default) or the form resolver. */
  validator?: Validator;
  /** The held validation accepts every value. */
  pass?: boolean;
  /** Holds every validation of Name and revalidates it whenever Email changes. */
  gateWithDeps?: Deferred;
  watch?: boolean;
  onSubmit?: () => void | Promise<void>;
  onForm?: (form: UseFormReturn<Values>) => void;
  afterSubmit?: 'keep' | 'rebase' | 'reset';
  children?: ReactNode;
}

function Harness({
  errors,
  mode,
  gate,
  validator = 'rules.validate',
  pass,
  gateWithDeps,
  watch,
  onSubmit,
  onForm,
  afterSubmit,
  children,
}: HarnessProps) {
  const resolver: Resolver<Values> | undefined =
    gate && validator === 'resolver'
      ? async (values): Promise<ResolverResult<Values>> => {
          gate.started += 1;
          await gate.promise;
          if (pass || values.name.length >= 3) return { values, errors: {} };
          return { values: {}, errors: { name: { type: 'validate', message: clientMessage } } };
        }
      : undefined;
  const form = useForm<Values>({ mode, resolver, defaultValues: { name: '', email: '' } });
  if (watch) form.watch();
  onForm?.(form);
  const held = gateWithDeps ?? (validator === 'rules.validate' ? gate : undefined);
  return (
    <>
      <a href="#outside">Outside link</a>
      <Form
        form={form}
        errors={errors}
        afterSubmit={afterSubmit}
        onSubmit={onSubmit ?? (() => undefined)}
        aria-label="Server form"
      >
        <FormField<Values, 'name'>
          name="name"
          label="Name"
          rules={
            held
              ? {
                  validate: async (value) => {
                    held.started += 1;
                    await held.promise;
                    return pass || value.length >= 3 || clientMessage;
                  },
                }
              : undefined
          }
        >
          {(field) => <Input {...field} />}
        </FormField>
        <FormField<Values, 'email'> name="email" label="Email" rules={gateWithDeps ? { deps: ['name'] } : undefined}>
          {(field) => <Input {...field} />}
        </FormField>
        <FormRootError />
        <FormSubmit>Save</FormSubmit>
        <FormReset>Discard</FormReset>
        <Button type="button" onClick={() => form.reset()}>
          Reset form
        </Button>
        <Button type="button" onClick={() => form.reset(undefined, { keepIsSubmitted: true })}>
          Reset keeping submitted
        </Button>
        {children}
      </Form>
    </>
  );
}

const name = () => screen.getByRole('textbox', { name: 'Name' });
const email = () => screen.getByRole('textbox', { name: 'Email' });

describe('Form errors prop', () => {
  it('shows a server message under its field, marks it invalid and focuses it', async () => {
    render(<Harness errors={{ name: 'That name is taken.' }} />);
    expect(await screen.findByText('That name is taken.')).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(name()).toHaveAccessibleDescription('That name is taken.');
    await waitFor(() => expect(name()).toHaveFocus());
    expect(email()).not.toHaveAttribute('aria-invalid');
  });

  it('applies errors that are present on the first render, also in StrictMode', async () => {
    render(
      <StrictMode>
        <Harness errors={{ name: 'That name is taken.' }} />
      </StrictMode>,
    );
    expect(await screen.findByText('That name is taken.')).toBeInTheDocument();
    await waitFor(() => expect(name()).toHaveFocus());
  });

  it('focuses the first errored field in document order when focus is inside the form', async () => {
    const user = userEvent.setup();
    const view = render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    view.rerender(<Harness errors={{ email: 'Invalid domain.', name: 'Taken.' }} />);
    await waitFor(() => expect(name()).toHaveFocus());
    expect(email()).toHaveAttribute('aria-invalid', 'true');
  });

  it('focuses the first errored field when focus is on the body', async () => {
    const view = render(<Harness />);
    expect(document.body).toHaveFocus();
    view.rerender(<Harness errors={{ email: 'Invalid domain.', name: 'Taken.' }} />);
    await waitFor(() => expect(name()).toHaveFocus());
  });

  it('does not move focus when it is outside the form', async () => {
    const user = userEvent.setup();
    const view = render(<Harness />);
    await user.click(screen.getByRole('link', { name: 'Outside link' }));
    view.rerender(<Harness errors={{ name: 'Taken.' }} />);
    expect(await screen.findByText('Taken.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Outside link' })).toHaveFocus();
  });

  it('clears a field message on its first edit and keeps the others until they are edited', async () => {
    const user = userEvent.setup();
    render(<Harness errors={{ email: 'Invalid domain.', name: 'Taken.' }} />);
    await screen.findByText('Taken.');
    await user.type(name(), 'a');
    expect(screen.queryByText('Taken.')).not.toBeInTheDocument();
    expect(name()).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('Invalid domain.')).toBeInTheDocument();
    expect(email()).toHaveAttribute('aria-invalid', 'true');
    await user.type(email(), 'b');
    expect(screen.queryByText('Invalid domain.')).not.toBeInTheDocument();
  });

  it('does not bring a cleared message back when the value returns to the snapshot', async () => {
    const user = userEvent.setup();
    render(<Harness errors={{ name: 'Taken.' }} />);
    await screen.findByText('Taken.');
    await user.type(name(), 'a');
    await user.type(name(), '{Backspace}');
    expect(name()).toHaveValue('');
    expect(screen.queryByText('Taken.')).not.toBeInTheDocument();
    expect(name()).not.toHaveAttribute('aria-invalid');
  });

  it('shows a message on a nested path', async () => {
    function Members() {
      const form = useForm({ defaultValues: { members: [{ email: 'a@x.test' }, { email: 'b@x.test' }] } });
      return (
        <Form form={form} errors={{ 'members.1.email': 'Already a member.' }} onSubmit={() => undefined}>
          <FormField name="members.0.email" label="First email">
            {(field) => <Input {...field} />}
          </FormField>
          <FormField name="members.1.email" label="Second email">
            {(field) => <Input {...field} />}
          </FormField>
          <FormRootError />
        </Form>
      );
    }
    render(<Members />);
    const second = await screen.findByRole('textbox', { name: 'Second email' });
    expect(second).toHaveAccessibleDescription('Already a member.');
    expect(screen.getByRole('textbox', { name: 'First email' })).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the first entry of an array, and nothing for null, undefined or empty strings', async () => {
    render(<Harness errors={{ name: ['Choose a name.', 'Name not allowed.'], email: null }} />);
    expect(await screen.findByText('Choose a name.')).toBeInTheDocument();
    expect(screen.queryByText('Name not allowed.')).not.toBeInTheDocument();
    expect(email()).not.toHaveAttribute('aria-invalid');
  });

  it.each([[{ name: undefined }], [{ name: '' }], [{ name: null }], [{ name: [] }]])(
    'applies nothing for %j',
    async (errors) => {
      render(<Harness errors={errors} />);
      await act(async () => undefined);
      expect(name()).not.toHaveAttribute('aria-invalid');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(document.body).toHaveFocus();
    },
  );

  it('keeps an array whose first entry is empty as given', async () => {
    render(<Harness errors={{ name: ['', 'Second.'] }} />);
    await waitFor(() => expect(name()).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.queryByText('Second.')).not.toBeInTheDocument();
  });

  it('shows the root error for an empty key or an unmatched path, until the next submit', async () => {
    const user = userEvent.setup();
    const view = render(<Harness errors={{ '': 'Quota exceeded for this workspace.' }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Quota exceeded for this workspace.');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    view.rerender(<Harness errors={{ 'no.such.field': 'Unknown key.' }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unknown key.');
    expect(name()).not.toHaveFocus();
    expect(email()).not.toHaveFocus();
  });

  it('renders no root error when there is none', () => {
    render(<Harness />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ignores a re-passed errors object but applies a new equal one', async () => {
    const user = userEvent.setup();
    const errors = { name: 'Taken.' };
    const view = render(<Harness errors={errors} />);
    await screen.findByText('Taken.');
    await user.type(name(), 'a');
    await user.click(screen.getByRole('link', { name: 'Outside link' }));
    view.rerender(<Harness errors={errors} />);
    await act(async () => undefined);
    expect(screen.queryByText('Taken.')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Outside link' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    view.rerender(<Harness errors={{ ...errors }} />);
    expect(await screen.findByText('Taken.')).toBeInTheDocument();
    await waitFor(() => expect(name()).toHaveFocus());
  });
});

describe.each<Validator>(['rules.validate', 'resolver'])('server errors and a held %s', (validator) => {
  const taken = 'Taken.';
  const held = (gate: Deferred, count = 1) => waitFor(() => expect(gate.started).toBeGreaterThanOrEqual(count));

  it('a new errors object wins over a validation that resolves afterwards', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    const view = render(<Harness errors={{ name: 'Old.' }} gate={gate} validator={validator} mode="onBlur" />);
    await screen.findByText('Old.');
    await user.click(name());
    await user.tab();
    await held(gate);
    view.rerender(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="onBlur" />);
    await screen.findByText(taken);
    await act(async () => gate.release());
    expect(screen.getByText(taken)).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });

  it('a submit clears server errors and a validation that resolves afterwards does not restore them', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: taken }} gate={gate} validator={validator} />);
    await screen.findByText(taken);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await held(gate);
    await waitFor(() => expect(screen.queryByText(taken)).not.toBeInTheDocument());
    await act(async () => gate.release());
    expect(screen.queryByText(taken)).not.toBeInTheDocument();
    expect(await screen.findByText(clientMessage)).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the server message over a client error and keeps both after validation resolves', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    let form: UseFormReturn<Values> | undefined;
    render(
      <Harness
        errors={{ name: taken }}
        gate={gate}
        validator={validator}
        mode="onBlur"
        onForm={(value) => (form = value)}
      />,
    );
    await screen.findByText(taken);
    await user.click(name());
    await user.tab();
    await held(gate);
    await act(async () => gate.release());
    expect(screen.getByText(taken)).toBeInTheDocument();
    expect(screen.queryByText(clientMessage)).not.toBeInTheDocument();
    await waitFor(() => expect(form?.getFieldState('name').error?.message).toBe(clientMessage));
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });

  it.each([
    ['form.reset()', 'Reset form'],
    ['form.reset(undefined, { keepIsSubmitted: true })', 'Reset keeping submitted'],
  ])('%s clears server errors and a pending validation does not restore them', async (_label, button) => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="onBlur" />);
    await screen.findByText(taken);
    await user.click(name());
    await user.tab();
    await held(gate);
    await user.click(screen.getByRole('button', { name: button }));
    await waitFor(() => expect(screen.queryByText(taken)).not.toBeInTheDocument());
    await act(async () => gate.release());
    expect(screen.queryByText(taken)).not.toBeInTheDocument();
    expect(name()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('FormReset clears server errors and a pending validation does not restore them', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="onBlur" />);
    await screen.findByText(taken);
    await user.click(name());
    await user.tab();
    await held(gate);
    await user.type(email(), 'x');
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByText(taken)).not.toBeInTheDocument());
    await act(async () => gate.release());
    expect(screen.queryByText(taken)).not.toBeInTheDocument();
    expect(name()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps the server error when another field is edited under mode all with an active watch', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="all" watch />);
    await screen.findByText(taken);
    await user.type(email(), 'x');
    await held(gate);
    await act(async () => gate.release());
    expect(screen.getByText(taken)).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps a message cleared by an edit cleared when the value returns to the snapshot', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="onChange" pass />);
    await screen.findByText(taken);
    await user.type(name(), 'a');
    await held(gate);
    await user.type(name(), '{Backspace}');
    await held(gate, 2);
    await act(async () => gate.release());
    expect(name()).toHaveValue('');
    expect(screen.queryByText(taken)).not.toBeInTheDocument();
    expect(name()).not.toHaveAttribute('aria-invalid');
  });

  it('shows a new errors object that arrives while a change validation is pending', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    const view = render(<Harness errors={{ name: 'Old.' }} gate={gate} validator={validator} mode="onChange" />);
    await screen.findByText('Old.');
    await user.type(name(), 'a');
    await held(gate);
    expect(screen.queryByText('Old.')).not.toBeInTheDocument();
    view.rerender(<Harness errors={{ name: taken }} gate={gate} validator={validator} mode="onChange" />);
    await screen.findByText(taken);
    await act(async () => gate.release());
    expect(screen.getByText(taken)).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('server errors and rules.deps', () => {
  it('keeps the server error when another field is edited and its rules.deps revalidate Name', async () => {
    const user = userEvent.setup();
    const gate = deferred();
    render(<Harness errors={{ name: 'Taken.' }} gateWithDeps={gate} mode="onChange" />);
    await screen.findByText('Taken.');
    await user.type(email(), 'x');
    await waitFor(() => expect(gate.started).toBeGreaterThan(0));
    await act(async () => gate.release());
    expect(screen.getByText('Taken.')).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('server errors and replaced values', () => {
  it('clears a message when a different File replaces the one it was reported for', async () => {
    const user = userEvent.setup();
    function Attachments() {
      const form = useForm<{ attachment: File | null }>({ defaultValues: { attachment: new File(['a'], 'a.txt') } });
      return (
        <Form form={form} errors={{ attachment: 'File rejected.' }} onSubmit={() => undefined}>
          <FormField<{ attachment: File | null }, 'attachment'> name="attachment" label="Attachment">
            {(field) => (
              <>
                <Input {...field} value="" onChange={() => undefined} />
                <Button type="button" onClick={() => field.onChange(new File(['a'], 'a.txt'))}>
                  Replace file
                </Button>
              </>
            )}
          </FormField>
        </Form>
      );
    }
    render(<Attachments />);
    await screen.findByText('File rejected.');
    await user.click(screen.getByRole('button', { name: 'Replace file' }));
    expect(screen.queryByText('File rejected.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Attachment' })).not.toHaveAttribute('aria-invalid');
  });

  it('keeps a message while the same File instance is still the value', async () => {
    const file = new File(['a'], 'a.txt');
    function Attachments() {
      const form = useForm<{ attachment: File | null }>({ defaultValues: { attachment: file } });
      return (
        <Form form={form} errors={{ attachment: 'File rejected.' }} onSubmit={() => undefined}>
          <FormField<{ attachment: File | null }, 'attachment'> name="attachment" label="Attachment">
            {(field) => <Input {...field} value="" onChange={() => undefined} />}
          </FormField>
        </Form>
      );
    }
    render(<Attachments />);
    expect(await screen.findByText('File rejected.')).toBeInTheDocument();
    await act(async () => undefined);
    expect(screen.getByText('File rejected.')).toBeInTheDocument();
  });
});

describe('reset interception', () => {
  it('restores the original reset on unmount and passes values and options through unchanged', async () => {
    let form: UseFormReturn<Values> | undefined;
    let before: UseFormReturn<Values>['reset'] | undefined;
    function Capture({ onForm }: { onForm: (instance: UseFormReturn<Values>) => void }) {
      const instance = useForm<Values>({ defaultValues: { name: '', email: '' } });
      onForm(instance);
      return (
        <Form form={instance} onSubmit={() => undefined}>
          <FormField<Values, 'name'> name="name" label="Name">
            {(field) => <Input {...field} />}
          </FormField>
        </Form>
      );
    }
    const view = render(
      <Capture
        onForm={(instance) => {
          form = instance;
          before ??= instance.reset;
        }}
      />,
    );
    await act(async () => undefined);
    expect(form?.reset).not.toBe(before);
    act(() => form?.reset({ name: 'Rebased', email: '' }));
    expect(name()).toHaveValue('Rebased');
    expect(form?.formState.defaultValues?.name).toBe('Rebased');
    act(() => form?.reset({ name: 'Kept values', email: '' }, { keepDefaultValues: true }));
    expect(name()).toHaveValue('Kept values');
    expect(form?.formState.defaultValues?.name).toBe('Rebased');
    view.unmount();
    expect(form?.reset).toBe(before);
  });

  it('afterSubmit reset clears server errors that arrived during the save', async () => {
    const user = userEvent.setup();
    const view = render(<Harness afterSubmit="reset" onSubmit={async () => undefined} />);
    await user.type(name(), 'abc');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(name()).toHaveValue(''));
    view.rerender(<Harness afterSubmit="reset" errors={{ name: 'Taken.' }} onSubmit={async () => undefined} />);
    await screen.findByText('Taken.');
    await user.type(email(), 'x');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByText('Taken.')).not.toBeInTheDocument());
  });
});
