import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { I18nProvider } from '@gntik-ai/ui';
import { ConfirmDestructive } from './ConfirmDestructive';

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('ConfirmDestructive focus', () => {
  it('initially focuses the typed input even with a focusable slot and preserves focus during Enter submission', async () => {
    const attempt = deferred();
    render(
      <ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={() => attempt.promise}>
        <label>
          Justification
          <textarea />
        </label>
      </ConfirmDestructive>,
    );
    const typed = await screen.findByRole('textbox', { name: 'Type db to confirm' });
    await waitFor(() => expect(typed).toHaveFocus());
    await userEvent.setup().type(typed, 'db{Enter}');
    expect(typed).toHaveFocus();
    await act(async () => attempt.reject(new Error('Failed')));
    expect(typed).toHaveFocus();
  });

  it.each(['no-access', 'not-found'] as const)('moves focus to Close after %s removes the input', async (kind) => {
    render(
      <ConfirmDestructive
        defaultOpen
        triggerLabel={null}
        resourceName="db"
        onConfirm={() => Promise.reject({ kind, title: 'Unavailable' })}
      />,
    );
    await userEvent.setup().type(await screen.findByRole('textbox'), 'db{Enter}');
    expect(await screen.findByRole('button', { name: 'Close' })).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent(/^Unavailable$/);
  });

  it('moves from a removed Retry to the input on generic failure', async () => {
    const user = userEvent.setup();
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce({ kind: 'server', title: 'Failed' })
      .mockRejectedValue(new Error('Generic'));
    render(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={onConfirm} />);
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Generic');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('moves from a removed request-id copy button to Retry', async () => {
    const user = userEvent.setup();
    const attempt = deferred();
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce({ kind: 'server', title: 'Failed', requestId: 'req_1' })
      .mockReturnValue(attempt.promise);
    render(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={onConfirm} />);
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    act(() => screen.getByRole('button', { name: 'Copy request ID' }).focus());
    await act(async () => attempt.reject({ kind: 'server', title: 'Still failed' }));
    expect(await screen.findByRole('button', { name: 'Try again' })).toHaveFocus();
  });

  it('moves a newly disabled Confirm to the input without moving unrelated focus', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" />);
    await user.type(await screen.findByRole('textbox'), 'db');
    act(() => screen.getByRole('button', { name: 'Delete project' }).focus());
    rerender(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" canConfirm={false} />);
    expect(screen.getByRole('textbox')).toHaveFocus();
    act(() => screen.getByRole('button', { name: 'Cancel' }).focus());
    rerender(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" canConfirm />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('skips a busy Retry when a slot control becomes disabled', async () => {
    const user = userEvent.setup();
    const attempt = deferred();
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce({ kind: 'network', title: 'Offline' })
      .mockReturnValue(attempt.promise);
    const props = { defaultOpen: true, triggerLabel: null, resourceName: 'db', onConfirm };
    const { rerender } = render(
      <ConfirmDestructive {...props}>
        <button>Extra control</button>
      </ConfirmDestructive>,
    );
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    act(() => screen.getByRole('button', { name: 'Extra control' }).focus());
    rerender(
      <ConfirmDestructive {...props}>
        <button disabled>Extra control</button>
      </ConfirmDestructive>,
    );
    expect(screen.getByRole('textbox')).toHaveFocus();
    await act(async () => attempt.reject(new Error('Failed')));
  });
});

function FocusReturn({
  target,
  outcome,
}: {
  target: 'internal' | 'ref' | 'opener';
  outcome: 'Cancel' | 'Close' | 'Escape' | 'success';
}) {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={returnFocusRef}>Return here</button>
      <button onClick={() => setOpen(true)}>Open confirmation</button>
      <ConfirmDestructive
        open={open}
        onOpenChange={setOpen}
        triggerLabel={target === 'internal' ? 'Internal trigger' : null}
        returnFocusRef={target === 'ref' ? returnFocusRef : undefined}
        resourceName="db"
        onConfirm={() =>
          outcome === 'Close' ? Promise.reject({ kind: 'not-found', title: 'Gone' }) : Promise.resolve()
        }
      />
    </>
  );
}

for (const target of ['internal', 'ref', 'opener'] as const) {
  it.each(['Cancel', 'Close', 'Escape', 'success'] as const)(`returns focus to ${target} after %s`, async (outcome) => {
    const user = userEvent.setup();
    render(<FocusReturn target={target} outcome={outcome} />);
    const opener = screen.getByRole('button', {
      name: target === 'internal' ? 'Internal trigger' : 'Open confirmation',
    });
    const destination = target === 'ref' ? screen.getByRole('button', { name: 'Return here' }) : opener;
    await user.click(opener);
    const typed = await screen.findByRole('textbox');
    if (outcome === 'success' || outcome === 'Close') {
      await user.type(typed, 'db{Enter}');
      if (outcome === 'Close') await user.click(await screen.findByRole('button', { name: 'Close' }));
    } else if (outcome === 'Escape') await user.keyboard('{Escape}');
    else await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await waitFor(() => expect(destination).toHaveFocus());
  });
}

it('uses the existing Spanish Cancel, Retry and Close messages', async () => {
  const user = userEvent.setup();
  const onConfirm = vi
    .fn()
    .mockRejectedValueOnce({ kind: 'network', title: 'Offline' })
    .mockRejectedValue({ kind: 'no-access', title: 'Unavailable' });
  render(
    <I18nProvider locale="es">
      <ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={onConfirm} />
    </I18nProvider>,
  );
  expect(await screen.findByRole('button', { name: 'Cancelar' })).toBeVisible();
  await user.type(screen.getByRole('textbox'), 'db{Enter}');
  await user.click(await screen.findByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('button', { name: 'Cerrar' })).toHaveFocus();
});
