import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Button } from '../Button';
import { ToastProvider, Toaster, useToast, type ToastOptions, type ToastPromiseOptions } from './Toast';
import ToastActions from './examples/ToastActions';
import ToastPromise from './examples/ToastPromise';

function Trigger({ options }: { options: ToastOptions }) {
  const toast = useToast();
  return <Button onClick={() => toast.add(options)}>Show</Button>;
}

function PromiseTrigger<V>({ task, options }: { task: () => Promise<V>; options: ToastPromiseOptions<V> }) {
  const toast = useToast();
  return <Button onClick={() => void toast.promise(task(), options).catch(() => {})}>Run</Button>;
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Toast actions', () => {
  it('primary and dismiss actions are reachable with F6 → Tab and run their handlers', async () => {
    const user = userEvent.setup();
    render(<ToastActions />);
    await user.click(screen.getByRole('button', { name: 'Show invitation' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await within(region).findByRole('dialog', { name: 'You were invited to “Platform”' });
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
    const reached: string[] = [];
    for (let i = 0; i < 3; i++) {
      await user.tab();
      reached.push(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '');
    }
    expect(reached).toEqual(expect.arrayContaining(['Accept', 'Not now']));
    screen.getByRole('button', { name: 'Not now' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Postponed')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not auto-dismiss while an action has focus, and resumes after', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger options={{ title: 'Saved draft', timeout: 150, action: { label: 'Open', onClick: () => {} } }} />
        <Toaster />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
    await user.tab();
    await act(() => sleep(400));
    expect(screen.getByRole('dialog', { name: 'Saved draft' })).toBeInTheDocument();
    await user.click(document.body);
    fireEvent.blur(document.activeElement ?? document.body);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Saved draft' })).not.toBeInTheDocument(), { timeout: 2000 });
  });

  it('pauses auto-dismiss while hovered', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger options={{ title: 'Hover me', timeout: 150 }} />
        <Toaster />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    const toast = await screen.findByRole('dialog', { name: 'Hover me' });
    await user.hover(toast);
    await act(() => sleep(400));
    expect(screen.getByRole('dialog', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('ToastActions has no axe violations', async () => {
    const user = userEvent.setup();
    render(<ToastActions />);
    await user.click(screen.getByRole('button', { name: 'Show invitation' }));
    await screen.findByRole('button', { name: 'Accept' });
    await expectNoAxeViolations();
  });
});

describe('toast.promise', () => {
  it('updates one toast in place: loading → success', async () => {
    const d = deferred<{ n: number }>();
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <PromiseTrigger task={() => d.promise} options={{ loading: 'Saving…', success: (r) => `Saved ${r.n} rows`, error: 'Failed' }} />
        <Toaster />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Run' }));
    const loading = await screen.findByRole('dialog', { name: 'Saving…' });
    expect(loading).toHaveAttribute('data-type', 'loading');
    await act(async () => d.resolve({ n: 3 }));
    const done = await screen.findByRole('dialog', { name: 'Saved 3 rows' });
    expect(done).toHaveAttribute('data-type', 'success');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('loading → error: destructive tone, assertive priority, rejection preserved', async () => {
    const d = deferred<string>();
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <PromiseTrigger
          task={() => d.promise}
          options={{ loading: { title: 'Deploying…' }, success: 'Done', error: (e) => ({ title: 'Deploy failed', description: String((e as Error).message) }) }}
        />
        <Toaster />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Run' }));
    await screen.findByRole('dialog', { name: 'Deploying…' });
    await act(async () => d.reject(new Error('quota exceeded')));
    // High priority: Base UI announces it through a role="alert" mirror and exposes the toast
    // itself as an alertdialog (aria-hidden until the stack is focused, to avoid a double read).
    expect(await screen.findByRole('alert')).toHaveTextContent('Deploy failedquota exceeded');
    const failed = document.querySelector('[role="alertdialog"]');
    expect(failed).toHaveAttribute('data-type', 'destructive');
    expect(failed).toHaveTextContent('Deploy failed');
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });

  it('ToastPromise has no axe violations while loading', async () => {
    const user = userEvent.setup();
    render(<ToastPromise />);
    await user.click(screen.getByRole('button', { name: 'Deploy' }));
    await screen.findByRole('dialog', { name: 'Deploying…' });
    await expectNoAxeViolations();
  });
});
