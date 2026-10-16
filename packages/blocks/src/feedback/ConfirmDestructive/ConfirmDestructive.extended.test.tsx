import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDestructive, type ConfirmDestructiveFailure } from './ConfirmDestructive';

function propContract() {
  // @ts-expect-error validity must be a boolean
  <ConfirmDestructive canConfirm="true" />;
  // @ts-expect-error return focus requires an element ref
  <ConfirmDestructive returnFocusRef={{ current: 'trigger' }} />;
  // @ts-expect-error failures require a title
  const missingTitle: ConfirmDestructiveFailure = { kind: 'server' };
  // @ts-expect-error status is numeric
  const stringStatus: ConfirmDestructiveFailure = { kind: 'server', title: 'Failed', status: '500' };
  // @ts-expect-error network failures do not carry server metadata
  const networkStatus: ConfirmDestructiveFailure = { kind: 'network', title: 'Offline', status: 500 };
  void [missingTitle, stringStatus, networkStatus];
}
void propContract;

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('ConfirmDestructive extensions', () => {
  it('inserts a fresh alert for each identical synchronous failure', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDestructive
        defaultOpen
        triggerLabel={null}
        resourceName="db"
        onConfirm={() => {
          throw new Error('Failed');
        }}
      />,
    );
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    const first = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(await screen.findByRole('alert')).not.toBe(first);
  });
  it.each(['resolve', 'reject'] as const)(
    'ignores a stale %s after controlled close and reopen',
    async (settlement) => {
      const user = userEvent.setup();
      const old = deferred();
      const current = deferred();
      const onConfirm = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
      const onOpenChange = vi.fn();
      const props = { triggerLabel: null, resourceName: 'db', onConfirm, onOpenChange };
      const { rerender } = render(<ConfirmDestructive {...props} open />);
      await user.type(await screen.findByRole('textbox'), 'db{Enter}');
      rerender(<ConfirmDestructive {...props} open={false} />);
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      rerender(<ConfirmDestructive {...props} open />);
      expect(await screen.findByRole('textbox')).toHaveValue('');
      await user.type(screen.getByRole('textbox'), 'db{Enter}');
      expect(onConfirm).toHaveBeenCalledTimes(2);
      await act(async () => (settlement === 'resolve' ? old.resolve() : old.reject(new Error('Old failure'))));
      expect(screen.getByRole('alertdialog')).toBeVisible();
      expect(screen.getByRole('textbox')).toHaveValue('db');
      expect(screen.getByRole('button', { name: 'Delete project' })).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
      await act(async () => current.reject(new Error('Current failure')));
      expect(await screen.findByRole('alert')).toHaveTextContent('Current failure');
    },
  );
  it('keeps Retry mounted and focused while pending, guards every attempt, and announces identical failures once each', async () => {
    const user = userEvent.setup();
    const attempt = deferred();
    const failure = { kind: 'server', title: 'Failed' };
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockReturnValueOnce(attempt.promise)
      .mockRejectedValue(failure);
    const { rerender } = render(
      <ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={onConfirm} />,
    );
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    const retry = await screen.findByRole('button', { name: 'Try again' });
    let inserted = 0;
    const observer = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement && node.matches('[role="alert"]')) inserted++;
        }
    });
    observer.observe(screen.getByRole('alertdialog'), { childList: true, subtree: true });
    await user.click(retry);
    expect(retry).toBeInTheDocument();
    expect(retry).toHaveFocus();
    expect(retry).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(retry);
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(onConfirm).toHaveBeenCalledTimes(2);
    await act(async () => attempt.reject(failure));
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed');
    expect(retry).toHaveFocus();
    await user.click(retry);
    await waitFor(() => expect(inserted).toBe(2));
    await user.clear(screen.getByRole('textbox'));
    await user.click(retry);
    expect(onConfirm).toHaveBeenCalledTimes(3);
    await user.type(screen.getByRole('textbox'), 'db');
    rerender(
      <ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" canConfirm={false} onConfirm={onConfirm} />,
    );
    await user.click(retry);
    expect(onConfirm).toHaveBeenCalledTimes(3);
    observer.disconnect();
  });

  it.each([
    { kind: 'server', title: 'Failed', message: { error: 'x' }, status: '500', requestId: 7 },
    { kind: 'server', title: 'Failed', status: Infinity },
    { kind: 'network', title: 'Failed' },
  ])('drops malformed or absent optional fields: %j', async (failure) => {
    render(
      <ConfirmDestructive
        defaultOpen
        triggerLabel={null}
        resourceName="db"
        onConfirm={() => Promise.reject(failure)}
      />,
    );
    await userEvent.setup().type(await screen.findByRole('textbox'), 'db{Enter}');
    const panel = await screen.findByRole('region', { name: 'Failed' });
    expect(panel).not.toHaveTextContent(/500|Infinity|Request ID|service didn’t respond/);
    expect(screen.getByRole('alert')).toHaveTextContent(/^Failed$/);
  });

  it.each([7, '', '   '])('uses generic fallback for invalid title %j', async (title) => {
    render(
      <ConfirmDestructive
        defaultOpen
        triggerLabel={null}
        resourceName="db"
        onConfirm={() => Promise.reject({ kind: 'server', title })}
      />,
    );
    await userEvent.setup().type(await screen.findByRole('textbox'), 'db{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Try again.');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
  it.each(['no-access', 'not-found'] as const)('replaces interactive content with %s and only Close', async (kind) => {
    const user = userEvent.setup();
    render(
      <ConfirmDestructive
        defaultOpen
        triggerLabel={null}
        resourceName="db"
        onConfirm={() => Promise.reject({ kind, title: 'Unavailable', description: 'Return to the list.' })}
      >
        <label>
          Justification
          <textarea />
        </label>
      </ConfirmDestructive>,
    );
    await user.type(await screen.findByRole('textbox', { name: 'Type db to confirm' }), 'db{Enter}');
    expect(await screen.findByRole('heading', { name: 'Unavailable' })).toBeVisible();
    expect(screen.getByText('Return to the list.')).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Unavailable Return to the list.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it.each(['server', 'network'] as const)(
    'preserves fields and renders %s failures without sample copy',
    async (kind) => {
      const user = userEvent.setup();
      render(
        <ConfirmDestructive
          defaultOpen
          triggerLabel={null}
          resourceName="db"
          onConfirm={() =>
            Promise.reject({
              kind,
              title: 'Action failed',
              message: 'Try later.',
              status: 500,
              requestId: 'req_actual',
            })
          }
        >
          <label>
            Justification
            <textarea />
          </label>
        </ConfirmDestructive>,
      );
      await user.type(await screen.findByRole('textbox', { name: 'Justification' }), 'Keep this');
      await user.type(screen.getByRole('textbox', { name: 'Type db to confirm' }), 'db{Enter}');
      expect(await screen.findByRole('region', { name: 'Action failed' })).toHaveTextContent('Try later.');
      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByRole('alert')).toHaveTextContent('Action failed Try later.');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Justification' })).toHaveValue('Keep this');
      expect(screen.getByRole('textbox', { name: 'Type db to confirm' })).toHaveValue('db');
      expect(screen.queryByText('Contact support')).not.toBeInTheDocument();
      expect(screen.queryByText('Technical details')).not.toBeInTheDocument();
      expect(screen.queryByText('req_8f2c41d07a9b')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
      if (kind === 'server') {
        expect(screen.getByText('500')).toBeVisible();
        expect(screen.getByText('req_actual')).toBeVisible();
      } else {
        expect(screen.queryByText('500')).not.toBeInTheDocument();
        expect(screen.queryByText('req_actual')).not.toBeInTheDocument();
      }
    },
  );
  it('places extra fields before the typed field, outside the description, and gates confirmation', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" canConfirm={false} onConfirm={onConfirm}>
        <label>
          Justification
          <textarea />
        </label>
      </ConfirmDestructive>,
    );
    const extra = await screen.findByRole('textbox', { name: 'Justification' });
    const typed = screen.getByRole('textbox', { name: 'Type db to confirm' });
    const dialog = screen.getByRole('alertdialog');
    expect(extra.closest('form')).toBe(typed.closest('form'));
    expect(extra.compareDocumentPosition(typed) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)?.contains(extra)).toBe(false);
    await user.type(typed, 'db{Enter}');
    expect(screen.getByRole('button', { name: 'Delete project' })).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
    rerender(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
