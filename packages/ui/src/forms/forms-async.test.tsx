import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useForm, type ResolverResult } from 'react-hook-form';
import { Form, FormField } from './FormField';
import { Input } from '../components/Input';

type Values = { slug: string };
type Validator = (
  value: string,
  context: { signal: AbortSignal; values: Values },
) => Promise<string | null | undefined>;
function Example({
  validate,
  submit = () => {},
  show = true,
}: {
  validate: Validator;
  submit?: (values: Values) => void;
  show?: boolean;
}) {
  const form = useForm<Values>({ defaultValues: { slug: '' } });
  return (
    <Form form={form} onSubmit={submit} aria-label="Create">
      {show && (
        <FormField<Values> name="slug" label="Slug" asyncValidate={validate} success="Slug is available.">
          {(p) => <Input {...p} />}
        </FormField>
      )}
      <button>Save</button>
    </Form>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
const advance = async (ms = 300) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

it('debounces the final value once in StrictMode and ignores an aborted result', async () => {
  let finish!: (message: string) => void;
  const validate = vi
    .fn<Validator>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue(null);
  render(
    <StrictMode>
      <Example validate={validate} />
    </StrictMode>,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'acme' } });
  await advance(299);
  expect(validate).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: 'acme-prod' } });
  await advance();
  expect(validate).toHaveBeenCalledTimes(1);
  expect(validate.mock.calls[0]?.[0]).toBe('acme-prod');
  expect(screen.getByRole('status')).toHaveTextContent('Checking…');
  const signal = validate.mock.calls[0]![1].signal;
  fireEvent.change(input, { target: { value: 'available' } });
  expect(signal.aborted).toBe(true);
  await advance();
  expect(validate).toHaveBeenCalledTimes(2);
  await act(async () => finish('Stale error.'));
  expect(screen.queryByText('Stale error.')).not.toBeInTheDocument();
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(screen.getByText('Slug is available.')).toBeInTheDocument();
});

it('gates concurrent submissions, focuses the async error, and clears it after a passing edit', async () => {
  let finish!: (message: string | null) => void;
  const validate = vi
    .fn<Validator>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue(null);
  const submit = vi.fn();
  render(<Example validate={validate} submit={submit} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'taken' } });
  const form = screen.getByRole('form');
  await act(async () => {
    fireEvent.submit(form);
    fireEvent.submit(form);
  });
  expect(validate).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  await act(async () => finish('That slug is taken.'));
  expect(submit).not.toHaveBeenCalled();
  expect(input).toHaveAccessibleDescription('That slug is taken.');
  await advance(0);
  expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: 'free' } });
  await advance();
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(screen.queryByText('That slug is taken.')).not.toBeInTheDocument();
  await act(async () => {
    fireEvent.submit(form);
  });
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit.mock.calls[0]?.[0]).toEqual({ slug: 'free' });
});

it('aborts on unmount even when the callback ignores cancellation', async () => {
  let finish!: (message: string) => void;
  const validate = vi.fn<Validator>(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const view = render(<Example validate={validate} />);
    await advance();
    const signal = validate.mock.calls[0]![1].signal;
    view.rerender(<Example validate={validate} show={false} />);
    expect(signal.aborted).toBe(true);
    await act(async () => finish('Too late.'));
    expect(error).not.toHaveBeenCalled();
    expect(screen.queryByText('Too late.')).not.toBeInTheDocument();
  } finally {
    error.mockRestore();
  }
});

it('uses the resolver before the submit gate and supplies the raw values to the validator', async () => {
  const validate = vi.fn<Validator>().mockResolvedValue('That slug is taken.');
  const submit = vi.fn();
  function Resolved() {
    const form = useForm<Values>({
      defaultValues: { slug: '' },
      resolver: async (values): Promise<ResolverResult<Values>> =>
        values.slug
          ? { values, errors: {} }
          : { values: {}, errors: { slug: { type: 'schema', message: 'Enter a slug.' } } },
    });
    return (
      <Form form={form} onSubmit={submit} aria-label="Create">
        <FormField<Values> name="slug" label="Slug" asyncValidate={validate}>
          {(p) => <Input {...p} />}
        </FormField>
      </Form>
    );
  }
  render(<Resolved />);
  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  expect(validate).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Enter a slug.');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'taken' } });
  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  expect(validate).toHaveBeenCalledTimes(1);
  expect(validate.mock.calls[0]?.[1].values).toEqual({ slug: 'taken' });
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('That slug is taken.');
});

it('does not erase or overwrite a non-async error when a pending check settles', async () => {
  let finish!: (message: string | null) => void;
  const validate: Validator = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  function ManualError() {
    const form = useForm<Values>({ defaultValues: { slug: 'slug' } });
    return (
      <Form form={form} onSubmit={() => {}}>
        <FormField<Values> name="slug" label="Slug" asyncValidate={validate}>
          {(p) => <Input {...p} />}
        </FormField>
        <button type="button" onClick={() => form.setError('slug', { type: 'server', message: 'Server rejection.' })}>
          Reject
        </button>
      </Form>
    );
  }
  render(<ManualError />);
  await advance();
  fireEvent.click(screen.getByRole('button'));
  await act(async () => finish(null));
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Server rejection.');
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
});

it('shares a pending edit check with submission and cancels the submission on a superseding edit', async () => {
  const validate = vi.fn<Validator>(() => new Promise(() => {}));
  const submit = vi.fn();
  render(<Example validate={validate} submit={submit} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'checking' } });
  await advance();
  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  expect(validate).toHaveBeenCalledTimes(1);
  const signal = validate.mock.calls[0]![1].signal;
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'changed' } });
  await act(async () => {});
  expect(signal.aborted).toBe(true);
  expect(submit).not.toHaveBeenCalled();
});

it('focuses the first failing field in document order after every mounted check resolves', async () => {
  const submit = vi.fn();
  const first = vi.fn().mockResolvedValue('First error.');
  const second = vi.fn().mockResolvedValue('Second error.');
  function Multiple() {
    const form = useForm({ defaultValues: { first: '', second: '' } });
    return (
      <Form form={form} onSubmit={submit} aria-label="Create">
        <FormField name="first" label="First" asyncValidate={first}>
          {(p) => <Input {...p} />}
        </FormField>
        <FormField name="second" label="Second" asyncValidate={second}>
          {(p) => <Input {...p} />}
        </FormField>
      </Form>
    );
  }
  render(<Multiple />);
  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  await advance(0);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('textbox', { name: 'First' })).toHaveFocus();
  expect(submit).not.toHaveBeenCalled();
});

it('does not submit a schema snapshot after an edit during the async gate', async () => {
  let finish!: (message: null) => void;
  const validate = vi.fn<Validator>(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const submit = vi.fn();
  function RelatedValues() {
    const form = useForm({ defaultValues: { slug: 'slug', region: 'old' } });
    return (
      <Form form={form} onSubmit={submit} aria-label="Create">
        <FormField name="slug" label="Slug" asyncValidate={validate}>
          {(p) => <Input {...p} />}
        </FormField>
        <FormField name="region" label="Region">
          {(p) => <Input {...p} />}
        </FormField>
      </Form>
    );
  }
  render(<RelatedValues />);
  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Region' }), { target: { value: 'new' } });
  await act(async () => finish(null));
  expect(submit).not.toHaveBeenCalled();
});
