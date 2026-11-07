import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n';
import { Button } from '../Button';
import { DialogClose } from '../Dialog';
import { DrawerClose } from '../Drawer';
import { Input } from '../Input';
import { FormDialog, type FormDialogProps, type FormDialogResult } from './FormDialog';
import { doc } from './FormDialog.doc';
import FormDialogCreate from './examples/FormDialogCreate';
import FormDialogDrawerEdit from './examples/FormDialogDrawerEdit';
import FormDialogServerError from './examples/FormDialogServerError';

type Submit = (data: FormData) => FormDialogResult | Promise<FormDialogResult>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

type SetupProps = Partial<Omit<FormDialogProps, 'variant' | 'side' | 'size'>> & {
  variant?: 'dialog' | 'drawer';
  side?: 'right';
  size?: 'sm' | 'md' | 'lg';
};

function setup(props: SetupProps = {}) {
  const { onSubmit = () => undefined, ...rest } = props;
  const dialogProps = { title: 'New quota', trigger: <Button />, onSubmit, ...rest } as FormDialogProps;
  return (
    <FormDialog {...dialogProps}>
      <Input name="name" aria-label="Quota name" />
      <Input name="limit" aria-label="Limit" />
    </FormDialog>
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'New quota' }));
  return screen.findByRole('dialog', { name: 'New quota' });
}

const variants = [
  ['dialog', { variant: 'dialog' }],
  ['drawer', { variant: 'drawer', side: 'right' }],
] as const;

const closing: Array<[string, Submit]> = [
  ['undefined', () => undefined],
  ['true', () => true],
  ['a resolved undefined', () => Promise.resolve(undefined)],
  ['a resolved true', () => Promise.resolve(true)],
];

const staying: Array<[string, Submit]> = [
  ['false', () => false],
  ['a resolved false', () => Promise.resolve(false)],
];

const failing: Array<[string, Submit, string]> = [
  ['an Error', () => Promise.reject(new Error('Timeout')), 'Timeout'],
  [
    'a synchronous throw',
    () => {
      throw new Error('Boom');
    },
    'Boom',
  ],
  ['a non-Error rejection', () => Promise.reject(null), 'The changes could not be saved.'],
  ['an empty-message Error', () => Promise.reject(new Error('')), 'The changes could not be saved.'],
  ['an empty string', () => '', 'The changes could not be saved.'],
];

describe('FormDialog', () => {
  it('opens named by its title with focus in the first field and submits FormData once on Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Submit>();
    render(setup({ onSubmit, description: 'Set a limit.' }));
    const dialog = await openDialog(user);
    expect(dialog).toHaveAccessibleDescription('Set a limit.');
    const name = screen.getByRole('textbox', { name: 'Quota name' });
    await waitFor(() => expect(name).toHaveFocus());
    await user.type(name, 'monthly');
    await user.type(screen.getByRole('textbox', { name: 'Limit' }), '100{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = onSubmit.mock.calls[0]![0];
    expect(data).toBeInstanceOf(FormData);
    expect(Object.fromEntries(data)).toEqual({ name: 'monthly', limit: '100' });
  });

  it('submits once from the submit button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Submit>();
    render(setup({ onSubmit }));
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it.each(closing)('closes, returns focus to the trigger and calls onClosed once for %s', async (_label, result) => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(setup({ onSubmit: result, onClosed }));
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'New quota' })).toHaveFocus();
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it.each(staying)('stays open with no alert for %s', async (_label, result) => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(setup({ onSubmit: result, onClosed }));
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy'));
    expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('does not call onClosed on mount', () => {
    const onClosed = vi.fn();
    render(setup({ onClosed }));
    render(setup({ onClosed, defaultOpen: true }));
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('shows a returned string in a destructive alert at the top of the body and clears it on the next submit', async () => {
    const user = userEvent.setup();
    const answers: Array<string | undefined> = ['Quota name already exists', undefined];
    const gate = deferred<void>();
    const onSubmit = vi.fn<Submit>(() => {
      const next = answers.shift();
      return next === undefined ? gate.promise.then(() => false) : next;
    });
    render(setup({ onSubmit, summary: <p>Summary</p> }));
    const dialog = await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Quota name already exists');
    expect(dialog).toContainElement(alert);
    const body = alert.closest('form')!.firstElementChild!;
    expect(body.firstElementChild).toBe(alert);
    expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    gate.resolve();
  });

  it.each(failing)('shows the message for %s', async (_label, result, text) => {
    const user = userEvent.setup();
    render(setup({ onSubmit: result }));
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(text);
    expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
  });

  it('localizes the fallback message', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <FormDialog title="Nueva cuota" trigger={<Button />} onSubmit={() => Promise.reject(null)}>
          <Input name="name" aria-label="Nombre" />
        </FormDialog>
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Nueva cuota' }));
    await user.click(await screen.findByRole('button', { name: 'Guardar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar los cambios.');
  });

  it('labels a trigger without children by the title and keeps trigger children', () => {
    render(
      <>
        {setup()}
        <FormDialog title="Other" trigger={<Button>Custom</Button>} onSubmit={() => undefined} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'New quota' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });

  it('supports a custom footer, labels and a trigger-less controlled dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FormDialog
        title="Custom"
        open
        onOpenChange={onOpenChange}
        submitLabel="Create"
        cancelLabel="Dismiss"
        onSubmit={() => undefined}
      />,
    );
    expect(await screen.findByRole('button', { name: 'Create' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe.each(variants)('while a submit is pending (%s)', (variant, extra) => {
    it('blocks Escape, backdrop, close button, Cancel and repeat submits', async () => {
      const user = userEvent.setup();
      const gate = deferred<void>();
      const onSubmit = vi.fn<Submit>(() => gate.promise);
      const onOpenChange = vi.fn();
      render(setup({ onSubmit, onOpenChange, ...extra }));
      const dialog = await openDialog(user);
      const submit = screen.getByRole('button', { name: 'Save' });
      await user.type(screen.getByRole('textbox', { name: 'Quota name' }), 'a{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
      onOpenChange.mockClear();
      expect(submit).toHaveAttribute('aria-busy', 'true');
      expect(submit).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      expect(dialog.querySelector('form')).toHaveAttribute('aria-busy', 'true');

      await user.keyboard('{Escape}');
      await user.click(dialog.parentElement!.previousElementSibling!);
      await user.click(screen.getByRole('button', { name: 'Close' }));
      await user.keyboard('{Enter}');
      await user.click(submit);
      fireEvent.submit(dialog.querySelector('form')!);
      fireEvent.submit(dialog.querySelector('form')!);

      expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onOpenChange).not.toHaveBeenCalled();
      await act(async () => gate.resolve());
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(variant).toBeTruthy();
    });

    it('calls onSubmit once for two submits in the same tick', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn<Submit>(() => new Promise<void>(() => undefined));
      render(setup({ onSubmit, ...extra }));
      const dialog = await openDialog(user);
      const form = dialog.querySelector('form')!;
      act(() => {
        fireEvent.submit(form);
        fireEvent.submit(form);
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('blocks a custom footer close control too', async () => {
      const user = userEvent.setup();
      const gate = deferred<void>();
      render(
        <FormDialog
          title="New quota"
          trigger={<Button />}
          onSubmit={() => gate.promise}
          footer={<Button type="submit">Go</Button>}
          {...extra}
        >
          <Input name="name" aria-label="Quota name" />
        </FormDialog>,
      );
      await openDialog(user);
      await user.click(screen.getByRole('button', { name: 'Go' }));
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
      await act(async () => gate.resolve());
    });

    it('blocks a custom footer DialogClose/DrawerClose while pending and honours it afterwards', async () => {
      const user = userEvent.setup();
      const gate = deferred<false>();
      const Close = extra.variant === 'drawer' ? DrawerClose : DialogClose;
      const onOpenChange = vi.fn();
      render(
        <FormDialog
          title="New quota"
          trigger={<Button />}
          onSubmit={() => gate.promise}
          onOpenChange={onOpenChange}
          footer={
            <>
              <Button type="submit">Go</Button>
              <Close render={<Button type="button" />}>Dismiss</Close>
            </>
          }
          {...extra}
        >
          <Input name="name" aria-label="Quota name" />
        </FormDialog>,
      );
      await openDialog(user);
      onOpenChange.mockClear();
      await user.click(screen.getByRole('button', { name: 'Go' }));
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
      await act(async () => gate.resolve(false));
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows an Error rejection, re-enables the controls and clears the alert on the next submit', async () => {
      const user = userEvent.setup();
      const outcomes = [() => Promise.reject(new Error('Timeout')), () => Promise.resolve(false)];
      render(setup({ onSubmit: () => outcomes.shift()!(), ...extra }));
      await openDialog(user);
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Timeout');
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });
  });

  describe.each(variants)('reset (%s)', (_variant, extra) => {
    it('empties an uncontrolled input after close and reopen', async () => {
      const user = userEvent.setup();
      const onClosed = vi.fn();
      render(setup({ onClosed, ...extra }));
      await openDialog(user);
      await user.type(screen.getByRole('textbox', { name: 'Quota name' }), 'staging');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onClosed).toHaveBeenCalledTimes(1);
      await openDialog(user);
      expect(screen.getByRole('textbox', { name: 'Quota name' })).toHaveValue('');
    });

    it('keeps the text with keepMounted and clears the alert on close', async () => {
      const user = userEvent.setup();
      render(setup({ keepMounted: true, onSubmit: () => 'Taken', ...extra }));
      await openDialog(user);
      await user.type(screen.getByRole('textbox', { name: 'Quota name' }), 'staging');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Taken');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.queryByRole('alert', { hidden: true })).not.toBeInTheDocument();
      await openDialog(user);
      expect(screen.getByRole('textbox', { name: 'Quota name' })).toHaveValue('staging');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('a parent-driven close', () => {
    function Parent({
      onSubmit,
      onClosed,
      api,
    }: {
      onSubmit: Submit;
      onClosed: () => void;
      api: { open: (v: boolean) => void };
    }) {
      const [open, setOpen] = useState(true);
      api.open = setOpen;
      return (
        <FormDialog title="New quota" open={open} onOpenChange={setOpen} onSubmit={onSubmit} onClosed={onClosed}>
          <Input name="name" aria-label="Quota name" />
        </FormDialog>
      );
    }

    it.each([
      ['rejection', (g: ReturnType<typeof deferred<void>>) => g.reject(new Error('Late'))],
      ['success', (g: ReturnType<typeof deferred<void>>) => g.resolve()],
    ] as const)('ignores a settled %s and does not affect a reopened dialog', async (_label, settle) => {
      const user = userEvent.setup();
      const first = deferred<void>();
      const onSubmit = vi
        .fn<Submit>()
        .mockReturnValueOnce(first.promise)
        .mockReturnValue(new Promise(() => undefined));
      const onClosed = vi.fn();
      const api: { open: (open: boolean) => void } = { open: () => undefined };
      render(<Parent onSubmit={onSubmit} onClosed={onClosed} api={api} />);
      await screen.findByRole('dialog', { name: 'New quota' });
      await user.click(screen.getByRole('button', { name: 'Save' }));
      act(() => api.open(false));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1));
      act(() => api.open(true));
      await screen.findByRole('dialog', { name: 'New quota' });
      await act(async () => {
        settle(first);
        await first.promise.catch(() => undefined);
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'New quota' })).toBeInTheDocument();
      expect(onClosed).toHaveBeenCalledTimes(1);
      // The reopened dialog is not pending and accepts its own submit.
      expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    it('calls onClosed exactly once per close, including a parent-driven one', async () => {
      const onClosed = vi.fn();
      const api: { open: (open: boolean) => void } = { open: () => undefined };
      render(<Parent onSubmit={() => undefined} onClosed={onClosed} api={api} />);
      await screen.findByRole('dialog');
      expect(onClosed).not.toHaveBeenCalled();
      act(() => api.open(false));
      await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1));
      act(() => api.open(true));
      await screen.findByRole('dialog');
      act(() => api.open(false));
      await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(2));
    });
  });

  it('ignores a result that settles after unmount', async () => {
    const user = userEvent.setup();
    const gate = deferred<void>();
    const onOpenChange = vi.fn();
    const onClosed = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = render(setup({ onSubmit: () => gate.promise, onOpenChange, onClosed }));
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    onOpenChange.mockClear();
    view.unmount();
    await act(async () => gate.resolve());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('submits only itself when rendered inside another form', async () => {
    const user = userEvent.setup();
    const outer = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onSubmit = vi.fn<Submit>();
    render(<form onSubmit={outer}>{setup({ onSubmit })}</form>);
    await openDialog(user);
    expect(outer).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox', { name: 'Quota name' }), 'a{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it('renders the drawer variant in the drawer parts', async () => {
    const user = userEvent.setup();
    render(
      setup({ variant: 'drawer', side: 'right', size: 'lg', onSubmit: () => Promise.reject(new Error('Timeout')) }),
    );
    const dialog = await openDialog(user);
    expect(dialog).toHaveClass('w-[560px]');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Timeout');
  });

  it('opens and closes from the keyboard', async () => {
    const user = userEvent.setup();
    render(setup());
    await user.tab();
    expect(screen.getByRole('button', { name: 'New quota' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog', { name: 'New quota' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'New quota' })).toHaveFocus();
  });

  it.each(variants)('traps Tab and Shift+Tab inside the %s', async (_variant, extra) => {
    const user = userEvent.setup();
    render(
      <>
        {setup({ ...extra })}
        <button type="button">Outside</button>
      </>,
    );
    const dialog = await openDialog(user);
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    const isGuard = (el: Element | null) => el?.hasAttribute('data-base-ui-focus-guard') === true;
    const outside = () => [
      screen.getByRole('button', { name: 'Outside', hidden: true }),
      screen.getByRole('button', { name: 'New quota', hidden: true }),
    ];
    const visited = new Set<Element | null>();
    // Forward: the cycle runs through every control, parks on a guard and wraps back into the dialog.
    for (let i = 0; i < 10; i++) {
      await user.tab();
      const active = document.activeElement;
      visited.add(active);
      expect(isGuard(active) || active === document.body || dialog.contains(active)).toBe(true);
      for (const el of outside()) expect(el).not.toHaveFocus();
    }
    expect(visited.has(screen.getByRole('textbox', { name: 'Limit' }))).toBe(true);
    expect(visited.has(screen.getByRole('button', { name: 'Save' }))).toBe(true);
    // Backward: leaving the first control parks on a guard rather than on the page behind the dialog.
    screen.getByRole('textbox', { name: 'Quota name' }).focus();
    await user.tab({ shift: true });
    expect(isGuard(document.activeElement) || dialog.contains(document.activeElement)).toBe(true);
    for (const el of outside()) expect(el).not.toHaveFocus();
  });

  it('documents every keyboard row', () => {
    expect(doc.keyboard?.map(([key]) => key)).toEqual(['Enter / Space', 'Tab / Shift+Tab', 'Enter', 'Escape']);
  });
});

describe('FormDialog examples', () => {
  it.each(['dark', 'light', 'high_contrast'])('have no axe violations in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    const view = render(
      <>
        <FormDialogCreate />
        <FormDialogDrawerEdit />
        <FormDialogServerError />
      </>,
    );
    await expectNoAxeViolations();
    for (const name of ['New quota', 'Edit quota', 'Rename quota']) {
      await user.click(screen.getByRole('button', { name }));
      const dialog = await screen.findByRole('dialog');
      await expectNoAxeViolations(dialog);
      if (name === 'Rename quota') {
        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Quota name already exists');
        await expectNoAxeViolations(dialog);
      }
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
    view.unmount();
    document.documentElement.className = '';
  });

  it('create example closes after its simulated save', async () => {
    const user = userEvent.setup();
    render(<FormDialogCreate />);
    await user.click(screen.getByRole('button', { name: 'New quota' }));
    await user.type(await screen.findByRole('textbox', { name: 'Quota name' }), 'monthly{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 });
  });
});
