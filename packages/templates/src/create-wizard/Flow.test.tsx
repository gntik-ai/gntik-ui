import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { CreateWizardSubmitState } from './Flow';
import { Field, FieldError, FieldLabel, Input, LiveAnnouncer, SimpleSelect } from '@gntik-ai/ui';
import CreateWizardPage from './Page';
import type { CreateWizardFlowProps, CreateWizardFlowLabels } from './Flow';

export const labels: CreateWizardFlowLabels = {
  title: 'Caller flow',
  exit: 'Caller exit',
  back: 'Caller back',
  next: 'Caller next',
  finish: 'Caller finish',
  pending: 'Caller pending',
  cancel: 'Caller cancel',
  review: 'Caller review',
  reviewTitle: 'Caller review heading',
  edit: (label) => `Caller edit ${label}`,
  emptyValue: 'Caller empty',
  success: () => 'Caller success',
  errorFallback: 'Caller failure',
  openResource: 'Caller resource',
  exitTitle: 'Caller leave?',
  exitDescription: 'Caller discard?',
  exitConfirm: 'Caller leave',
  exitCancel: 'Caller stay',
  steps: 'Caller progress',
  stepsSummary: 'Caller progress summary',
  skipLink: 'Caller skip',
  stepStatusText: {
    complete: 'Caller complete',
    current: 'Caller current',
    upcoming: 'Caller upcoming',
    error: 'Caller error',
  },
  formatStepCount: (position, total) => `Caller position ${position}/${total}`,
  stepAnnouncement: ({ label, position, total }) => `Caller step ${label} ${position}/${total}`,
};

type Values = { name: string; context: string };
export function props(overrides: Partial<CreateWizardFlowProps<Values>> = {}): CreateWizardFlowProps<Values> {
  return {
    labels,
    initialValues: { name: '', context: 'Caller context value' },
    onFinish: vi.fn(),
    onExit: vi.fn(),
    flowSteps: [
      {
        id: 'context',
        label: 'Caller context',
        readOnly: true,
        render: ({ values }) => <p>{values.context}</p>,
        validate: () => ({ fieldErrors: { context: 'Ignored read-only error' } }),
      },
      {
        id: 'name',
        label: 'Caller name step',
        render: ({ values, setValue, errors }) => (
          <Field invalid={Boolean(errors.name)}>
            <FieldLabel>Caller name</FieldLabel>
            <Input value={values.name} onValueChange={(value) => setValue('name', value)} />
            <FieldError match={Boolean(errors.name)}>{errors.name}</FieldError>
          </Field>
        ),
        validate: (values) => ({ fieldErrors: values.name ? {} : { name: 'Caller required' } }),
      },
    ],
    summary: (values) => [
      { stepId: 'context', label: 'Caller context summary', value: values.context },
      { stepId: 'name', label: 'Caller name summary', value: values.name },
    ],
    ...overrides,
  };
}

it('renders caller steps, validates on Next and keeps errors live; review edit keeps values and focuses the heading', async () => {
  const user = userEvent.setup();
  render(<CreateWizardPage {...props()} />);
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByText('Caller context value')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.next }));
  expect(screen.queryByText('Caller required')).not.toBeInTheDocument();
  expect(within(screen.getByRole('navigation', { name: labels.steps })).queryByRole('button')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.next }));
  expect(screen.getByText('Caller required')).toBeInTheDocument();
  const name = screen.getByRole('textbox', { name: 'Caller name' });
  expect(name).toHaveFocus();
  expect(name).toHaveAttribute('aria-invalid', 'true');
  await user.type(name, 'A value');
  expect(screen.queryByText('Caller required')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.next }));
  expect(screen.getByRole('heading', { name: labels.reviewTitle })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Caller edit Caller name step' }));
  expect(screen.getByRole('heading', { name: 'Caller name step' })).toHaveFocus();
  expect(screen.getByRole('textbox')).toHaveValue('A value');
  await user.click(screen.getByRole('button', { name: labels.back }));
  await user.click(screen.getByRole('button', { name: labels.next }));
  expect(screen.getByRole('textbox')).toHaveValue('A value');
  await user.click(screen.getByRole('button', { name: labels.next }));
  expect(screen.getByText('A value')).toBeInTheDocument();
});

it('revalidates blocking on entry and caller rerender, announcing each new value once and rescuing disabled Next focus', async () => {
  const user = userEvent.setup();
  const base = props();
  const flowSteps = base.flowSteps.slice(1);
  const view = (blocking?: string) => (
    <CreateWizardPage
      {...base}
      flowSteps={flowSteps.map((step) => ({
        ...step,
        validate: (values: Values) => ({ ...step.validate?.(values), blocking }),
      }))}
    />
  );
  const { container, rerender } = render(view('Caller quota'));
  expect(screen.getByRole('button', { name: labels.next })).toBeDisabled();
  const region = container.querySelector('[data-live-announcer="polite"]')!;
  await waitFor(() => expect(region).toHaveTextContent('Caller quota'));
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(region, { subtree: true, characterData: true, childList: true });
  rerender(view('Caller quota'));
  await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  expect(changes).toBe(0);
  rerender(view());
  const next = screen.getByRole('button', { name: labels.next });
  expect(next).toBeEnabled();
  await user.click(next);
  expect(screen.getByText('Caller required')).toBeInTheDocument();
  act(() => next.focus());
  rerender(view('Caller quota changed'));
  expect(next).toBeDisabled();
  expect(screen.getByText('Caller required')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Caller name step' })).toHaveFocus();
  await waitFor(() => expect(region).toHaveTextContent('Caller quota changed'));
  expect(changes).toBe(1);
  expect(
    within(screen.getByRole('region', { name: 'Caller name step' })).getByText('Caller quota changed'),
  ).not.toHaveAttribute('aria-live');
  observer.disconnect();
});

it('commits immediate success, announces once before onComplete closes the flow, preserving the page region', async () => {
  const user = userEvent.setup();
  const onComplete = vi.fn(() => {
    expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Caller success');
    rerender(<LiveAnnouncer />);
  });
  const onFinish = vi.fn(async () => ({ id: 'created' }));
  const { rerender, container } = render(
    <LiveAnnouncer>
      <CreateWizardPage {...props({ flowSteps: [], onFinish, onComplete })} />
    </LiveAnnouncer>,
  );
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(container.querySelector('[data-live-announcer="polite"]')!, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  await user.click(screen.getByRole('button', { name: labels.finish }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledExactlyOnceWith({ id: 'created' }));
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onFinish).toHaveBeenCalledWith(
    { name: '', context: 'Caller context value' },
    { signal: expect.any(AbortSignal) },
  );
  expect(container.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Caller success');
  expect(changes).toBe(1);
  observer.disconnect();
});

it('keeps values after failures and announces identical failures on each attempt', async () => {
  const user = userEvent.setup();
  const onComplete = vi.fn();
  const onFinish = vi.fn().mockRejectedValue(new Error('transport'));
  const base = props();
  const { container } = render(
    <CreateWizardPage
      {...base}
      initialValues={{ name: 'Kept', context: 'Context' }}
      onFinish={onFinish}
      onComplete={onComplete}
      errorMessage={() => 'Caller retry'}
    />,
  );
  await user.click(screen.getByRole('button', { name: labels.next }));
  await user.click(screen.getByRole('button', { name: labels.next }));
  const region = container.querySelector('[data-live-announcer="assertive"]')!;
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(region, { subtree: true, childList: true, characterData: true });
  for (let attempt = 1; attempt <= 2; attempt++) {
    await user.click(screen.getByRole('button', { name: labels.finish }));
    await waitFor(() => expect(region).toHaveTextContent('Caller retry'));
    await waitFor(() => expect(changes).toBe(attempt));
    expect(screen.getByRole('button', { name: labels.finish })).toBeEnabled();
    expect(
      within(screen.getByRole('region', { name: labels.reviewTitle })).getByText('Caller retry'),
    ).not.toHaveAttribute('role', 'alert');
    expect(screen.getByText('Kept')).toBeInTheDocument();
  }
  expect(onComplete).not.toHaveBeenCalled();
  observer.disconnect();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it.each([false, true])(
  'locks pending and success navigation and hands Finish focus to a resource link (controlled=%s)',
  async (controlled) => {
    const user = userEvent.setup();
    const attempt = deferred<unknown>();
    const onFinish = vi.fn(() => attempt.promise);
    const onComplete = vi.fn();
    const base = props({
      initialValues: { name: 'Kept', context: 'Context' },
      onFinish,
      onComplete,
      resourceHref: () => '/created',
    });
    const { rerender } = render(
      <CreateWizardPage {...base} submitState={controlled ? { status: 'idle' } : undefined} />,
    );
    for (let index = 0; index < 2; index++) await user.click(screen.getByRole('button', { name: labels.next }));
    const finish = screen.getByRole('button', { name: labels.finish });
    await user.click(finish);
    if (controlled) rerender(<CreateWizardPage {...base} submitState={{ status: 'submitting' }} />);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveTextContent(labels.pending);
    expect(finish).toHaveAttribute('aria-disabled', 'true');
    expect(finish).toHaveFocus();
    const back = screen.getByRole('button', { name: labels.back });
    expect(back).toHaveAttribute('aria-disabled', 'true');
    expect(back).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Caller edit/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.exit })).toBeEnabled();
    await user.click(back);
    expect(screen.getByRole('heading', { name: labels.reviewTitle })).toBeInTheDocument();
    act(() => finish.focus());
    await act(async () => attempt.resolve({ id: 'created' }));
    if (controlled)
      rerender(<CreateWizardPage {...base} submitState={{ status: 'success', result: { id: 'created' } }} />);
    expect(await screen.findByRole('link', { name: labels.openResource })).toHaveFocus();
    expect(finish).toBeDisabled();
    expect(back).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: /^Caller edit/ })).not.toBeInTheDocument();
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(controlled ? 0 : 1));
  },
);

it.each([false, true])(
  'aborts confirmed exit, resets answers and drops the first attempt settling last (controlled=%s)',
  async (controlled) => {
    const user = userEvent.setup();
    const first = deferred<unknown>();
    const second = deferred<unknown>();
    const signals: AbortSignal[] = [];
    const onExit = vi.fn();
    const onComplete = vi.fn();
    function Host() {
      const [open, setOpen] = useState(true);
      const [state, setState] = useState<CreateWizardSubmitState>({ status: 'idle' });
      return (
        <LiveAnnouncer>
          <main>
            <h1>Caller list</h1>
            <button onClick={() => setOpen(true)}>Caller open</button>
          </main>
          <CreateWizardPage
            {...props()}
            mode="overlay"
            open={open}
            onOpenChange={setOpen}
            description="Caller description"
            submitState={controlled ? state : undefined}
            onComplete={onComplete}
            onExit={() => {
              onExit();
              setState({ status: 'idle' });
            }}
            onFinish={async (_values, { signal }) => {
              signals.push(signal);
              if (controlled) setState({ status: 'submitting' });
              const result = await (signals.length === 1 ? first.promise : second.promise);
              if (controlled && !signal.aborted) setState({ status: 'success', result });
              return result;
            }}
          />
        </LiveAnnouncer>
      );
    }
    render(<Host />);
    for (const name of ['First answer', 'Second answer']) {
      await user.click(await screen.findByRole('button', { name: labels.next }));
      expect(screen.getByRole('textbox', { name: 'Caller name' })).toHaveValue('');
      await user.type(screen.getByRole('textbox', { name: 'Caller name' }), name);
      await user.click(screen.getByRole('button', { name: labels.next }));
      await user.click(screen.getByRole('button', { name: labels.finish }));
      if (name === 'First answer') {
        await user.click(screen.getByRole('button', { name: labels.exit }));
        await user.click(
          within(await screen.findByRole('alertdialog', { name: labels.exitTitle })).getByRole('button', {
            name: labels.exitCancel,
          }),
        );
        await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
        expect(onExit).not.toHaveBeenCalled();
        expect(signals[0]?.aborted).toBe(false);
        await user.keyboard('{Escape}');
        await user.click(
          within(await screen.findByRole('alertdialog')).getByRole('button', { name: labels.exitConfirm }),
        );
        expect(onExit).toHaveBeenCalledTimes(1);
        expect(signals[0]?.aborted).toBe(true);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: 'Caller open' }));
      }
    }
    await act(async () => second.resolve('Second result'));
    await screen.findByRole('heading', { name: 'Caller success' });
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(controlled ? 0 : 1));
    const polite = document.querySelector('[data-live-announcer="polite"]')!;
    const text = polite.textContent;
    await act(async () => first.resolve('First result'));
    expect(polite.textContent).toBe(text);
    expect(screen.getByText('Second answer')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(controlled ? 0 : 1);
    if (!controlled) expect(onComplete).toHaveBeenCalledWith('Second result');
  },
);

it.each(['idle', 'submitting', 'success', 'error'] as const)(
  'renders controlled %s only and never completes on the kit promise',
  async (status) => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onFinish = vi.fn(async () => 'Ignored result');
    const state: CreateWizardSubmitState =
      status === 'error' ? { status, message: 'Caller controlled error' } : { status };
    render(
      <CreateWizardPage
        {...props({
          onFinish,
          onComplete,
          submitState: state,
          initialValues: { context: 'Caller context value', name: 'Caller value' },
        })}
      />,
    );
    if (status === 'idle') {
      for (let index = 0; index < 2; index++) await user.click(screen.getByRole('button', { name: labels.next }));
      for (let index = 0; index < 2; index++) await user.click(screen.getByRole('button', { name: labels.finish }));
      expect(onFinish).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('heading', { name: 'Caller success' })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('heading', { name: labels.reviewTitle })).toBeInTheDocument();
      if (status === 'submitting')
        expect(screen.getByRole('button', { name: labels.pending })).toHaveAttribute('aria-disabled', 'true');
      if (status === 'success') expect(screen.getByRole('heading', { name: 'Caller success' })).toBeInTheDocument();
      if (status === 'error')
        expect(
          within(screen.getByRole('region', { name: labels.reviewTitle })).getByText('Caller controlled error'),
        ).toBeInTheDocument();
    }
    expect(onComplete).not.toHaveBeenCalled();
  },
);

it.each([
  { result: undefined, href: '/unused' },
  { result: 'Created', href: undefined },
])('hands focus to the success heading without a usable resource ($result, $href)', async ({ result, href }) => {
  const user = userEvent.setup();
  const resourceHref = vi.fn(() => href);
  const onComplete = vi.fn();
  const { container } = render(
    <CreateWizardPage {...props({ flowSteps: [], onFinish: async () => result, resourceHref, onComplete })} />,
  );
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(container.querySelector('[data-live-announcer="polite"]')!, {
    subtree: true,
    characterData: true,
    childList: true,
  });
  await user.click(screen.getByRole('button', { name: labels.finish }));
  const heading = await screen.findByRole('heading', { name: 'Caller success' });
  expect(heading).toHaveAttribute('tabindex', '-1');
  expect(heading).toHaveFocus();
  expect(screen.queryByRole('link', { name: labels.openResource })).not.toBeInTheDocument();
  if (result === undefined) expect(resourceHref).not.toHaveBeenCalled();
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  expect(changes).toBe(1);
  observer.disconnect();
});

it('announces controlled transitions once, changed settled errors once and repeated failures after submitting', async () => {
  const base = props({ flowSteps: [], submitState: { status: 'idle' } });
  const { container, rerender } = render(<CreateWizardPage {...base} />);
  const region = container.querySelector('[data-live-announcer="assertive"]')!;
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(region, { subtree: true, childList: true, characterData: true });
  const show = async (submitState: CreateWizardSubmitState) => {
    rerender(<CreateWizardPage {...base} submitState={submitState} />);
    await act(() => Promise.resolve());
  };
  await show({ status: 'submitting' });
  await show({ status: 'error', message: 'Caller error one' });
  expect(changes).toBe(1);
  await show({ status: 'error', message: 'Caller error one' });
  expect(changes).toBe(1);
  await show({ status: 'error', message: 'Caller error two' });
  expect(changes).toBe(2);
  await show({ status: 'submitting' });
  await show({ status: 'error', message: 'Caller error two' });
  expect(changes).toBe(3);
  observer.disconnect();
});

it('aborts on unmount and drops a rejected settlement without announcing or completing', async () => {
  const user = userEvent.setup();
  const attempt = deferred<unknown>();
  let signal: AbortSignal | undefined;
  const onComplete = vi.fn();
  const base = props({
    flowSteps: [],
    onComplete,
    onFinish: (_values, context) => {
      signal = context.signal;
      return attempt.promise;
    },
  });
  const { container, rerender } = render(
    <LiveAnnouncer>
      <CreateWizardPage {...base} />
    </LiveAnnouncer>,
  );
  await user.click(screen.getByRole('button', { name: labels.finish }));
  expect(signal?.aborted).toBe(false);
  rerender(<LiveAnnouncer />);
  expect(signal?.aborted).toBe(true);
  await act(async () => attempt.reject(new Error('Late error')));
  expect(container.querySelector('[data-live-announcer="assertive"]')).toBeEmptyDOMElement();
  expect(container.querySelector('[data-live-announcer="polite"]')).toBeEmptyDOMElement();
  expect(onComplete).not.toHaveBeenCalled();
});

it('keeps page navigation focus unless Back becomes disabled, and moves removed Edit focus to the heading', async () => {
  const user = userEvent.setup();
  const base = props({
    initialValues: { name: 'Caller value', context: 'Caller context value' },
    submitState: { status: 'idle' },
  });
  const { rerender } = render(<CreateWizardPage {...base} />);
  const next = screen.getByRole('button', { name: labels.next });
  await user.click(next);
  expect(next).toHaveFocus();
  const back = screen.getByRole('button', { name: labels.back });
  await user.click(back);
  expect(back).toBeDisabled();
  expect(screen.getByRole('heading', { name: 'Caller context' })).toHaveFocus();
  for (let index = 0; index < 2; index++) await user.click(screen.getByRole('button', { name: labels.next }));
  act(() => screen.getByRole('button', { name: 'Caller edit Caller name step' }).focus());
  rerender(<CreateWizardPage {...base} submitState={{ status: 'submitting' }} />);
  expect(screen.getByRole('heading', { name: labels.reviewTitle })).toHaveFocus();
  act(() => back.focus());
  rerender(<CreateWizardPage {...base} submitState={{ status: 'success' }} />);
  expect(back).toHaveFocus();
});

it('uses only caller text and names, including cards, dialog, pending and fallback; portal Escape stays local', async () => {
  const user = userEvent.setup();
  const first = deferred<unknown>();
  const base = props({
    mode: 'overlay',
    open: true,
    description: 'Caller description',
    initialValues: { name: '', context: 'Caller context value' },
    flowSteps: [
      {
        id: 'context',
        label: 'Caller context',
        render: ({ values, setValue }) => (
          <SimpleSelect
            placeholder="Caller placeholder"
            label="Caller select"
            items={[
              { value: 'first', label: 'Caller first' },
              { value: 'second', label: 'Caller second' },
            ]}
            value={values.context}
            onValueChange={(value) => value && setValue('context', value)}
          />
        ),
      },
    ],
    onFinish: () => first.promise,
    summary: () => [{ stepId: 'context', label: 'Caller empty row', value: '' }],
  });
  const assertNamespace = () => {
    const nodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (nodes.nextNode()) {
      const text = nodes.currentNode.textContent?.trim().replace(/^[\d\s,/.]+/, '');
      if (text) expect(text).toMatch(/^Caller /);
    }
    for (const element of document.querySelectorAll('[aria-label]'))
      expect(element.getAttribute('aria-label')).toMatch(/^Caller /);
  };
  render(
    <LiveAnnouncer>
      <CreateWizardPage {...base} />
    </LiveAnnouncer>,
  );
  await screen.findByRole('dialog', { name: labels.title });
  expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
  await user.click(screen.getByRole('combobox', { name: 'Caller select' }));
  await screen.findByRole('listbox');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.next }));
  assertNamespace();
  expect(screen.getByText(labels.emptyValue)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.finish }));
  expect(screen.getByRole('button', { name: labels.pending })).toHaveAttribute('aria-disabled', 'true');
  assertNamespace();
  await act(async () => first.reject(new Error('Non-localized transport detail')));
  expect(
    within(screen.getByRole('region', { name: labels.reviewTitle })).getByText(labels.errorFallback),
  ).toBeInTheDocument();
  assertNamespace();
  await user.keyboard('{Escape}');
  const dialog = await screen.findByRole('alertdialog', { name: labels.exitTitle });
  expect(within(dialog).getByRole('button', { name: labels.exitConfirm })).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: labels.exitCancel })).toBeInTheDocument();
  assertNamespace();
});

it('keeps validation live after a successful first Next, including after editing from review', async () => {
  const user = userEvent.setup();
  render(<CreateWizardPage {...props({ initialValues: { name: 'Valid', context: 'Context' } })} />);
  for (let index = 0; index < 2; index++) await user.click(screen.getByRole('button', { name: labels.next }));
  await user.click(screen.getByRole('button', { name: 'Caller edit Caller name step' }));
  await user.clear(screen.getByRole('textbox', { name: 'Caller name' }));
  expect(screen.getByText('Caller required')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Caller name' })).toHaveAttribute('aria-invalid', 'true');
});

it('does not repeat step announcements when a success callback rerenders the overlay with equivalent labels', async () => {
  const user = userEvent.setup();
  function Host() {
    const [completed, setCompleted] = useState(false);
    return (
      <LiveAnnouncer>
        <CreateWizardPage
          {...props({ flowSteps: [] })}
          labels={{ ...labels }}
          mode="overlay"
          open
          description="Caller description"
          onFinish={async () => undefined}
          onComplete={() => setCompleted(true)}
        />
        {completed && <span>Caller completed</span>}
      </LiveAnnouncer>
    );
  }
  render(<Host />);
  const region = document.querySelector('[data-live-announcer="polite"]')!;
  await waitFor(() => expect(region).toHaveTextContent('Caller step'));
  let changes = 0;
  const observer = new MutationObserver(() => changes++);
  observer.observe(region, { subtree: true, childList: true, characterData: true });
  await user.click(screen.getByRole('button', { name: labels.finish }));
  await screen.findByText('Caller completed');
  await act(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(region).toHaveTextContent('Caller success');
  expect(changes).toBe(1);
  observer.disconnect();
});
