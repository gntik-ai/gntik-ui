import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useEffect, type ReactNode } from 'react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogTitle } from '../Dialog';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../Menu';
import { expectNoAxeViolations } from '../../test/a11y';
import DialogsAsyncConfirm from './examples/DialogsAsyncConfirm';
import DialogsCustomDialog from './examples/DialogsCustomDialog';
import DialogsPrompt from './examples/DialogsPrompt';
import DialogsRowMenu from './examples/DialogsRowMenu';
import DialogsTypedConfirm from './examples/DialogsTypedConfirm';
import { doc } from './DialogsProvider.doc';
import { DialogsProvider, useDialogs, type DialogComponentProps, type Dialogs } from './index';

/** Mounts the provider and returns the hook's API through a capture child. */
function mount(ui?: ReactNode, wrap: (children: ReactNode) => ReactNode = (c) => c) {
  const captured: { api: Dialogs | null } = { api: null };
  function Capture() {
    const api = useDialogs();
    useEffect(() => {
      captured.api = api;
    }, [api]);
    return null;
  }
  const { unmount } = render(
    wrap(
      <DialogsProvider>
        <Capture />
        {ui}
      </DialogsProvider>,
    ),
  );
  const api = () => {
    if (!captured.api) throw new Error('useDialogs was not captured');
    return captured.api;
  };
  return Object.assign(api, { unmount });
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const dialogsInDom = () => document.querySelectorAll('[role="dialog"], [role="alertdialog"]').length;

type RenamePayload = { name: string };

function RenameDialog({ payload, open, onClose, finalFocus }: DialogComponentProps<RenamePayload, string | undefined>) {
  const { confirm } = useDialogs();
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose(undefined)}>
      <DialogContent finalFocus={finalFocus}>
        <DialogTitle>Rename</DialogTitle>
        <p data-testid="current-name">{payload.name}</p>
        <Button onClick={() => onClose(`${payload.name}-saved`)}>Save</Button>
        <Button onClick={() => void confirm('Discard changes?', { title: 'Discard', confirmLabel: 'Discard' })}>
          Ask
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/** Records how often, and with what, a promise settles. */
function track<T>(promise: Promise<T>) {
  const state: { count: number; value: T | undefined } = { count: 0, value: undefined };
  void promise.then((value) => {
    state.count += 1;
    state.value = value;
  });
  return state;
}

function start<T>(call: () => Promise<T>) {
  let promise!: Promise<T>;
  act(() => {
    promise = call();
  });
  return { promise, state: track(promise) };
}

describe('DialogsProvider', () => {
  it('useDialogs outside the provider throws an error naming DialogsProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() {
      useDialogs();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/DialogsProvider/);
    spy.mockRestore();
  });

  describe('confirm', () => {
    const message = 'This key stops working at once.';
    const options = { title: 'Revoke API key', confirmLabel: 'Revoke' };

    it('renders an alertdialog named by the title and described by the message; Revoke resolves true', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().confirm(message, options));
      const dialog = await screen.findByRole('alertdialog', { name: 'Revoke API key' });
      expect(dialog).toHaveAccessibleDescription(message);
      await user.click(screen.getByRole('button', { name: 'Revoke' }));
      await waitFor(() => expect(state.value).toBe(true));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('Cancel resolves false and removes the dialog', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().confirm(message, options));
      await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(state.value).toBe(false));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('Escape resolves false and removes the dialog', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().confirm(message, options));
      await screen.findByRole('alertdialog');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(state.value).toBe(false));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('defaults the confirm label to Confirm', async () => {
      const api = mount();
      start(() => api().confirm(message, { title: 'Revoke API key' }));
      await screen.findByRole('alertdialog', { name: 'Revoke API key' });
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('typeToConfirm', () => {
    it('keeps the confirm button disabled until the exact, case-sensitive text is typed', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() =>
        api().confirm('Drops the database.', { title: 'Delete', typeToConfirm: 'prod-db' }),
      );
      await screen.findByRole('alertdialog');
      const field = screen.getByRole('textbox', { name: 'Type prod-db to confirm' });
      const confirm = screen.getByRole('button', { name: 'Confirm' });
      expect(confirm).toBeDisabled();
      await user.type(field, 'Prod-db');
      expect(confirm).toBeDisabled();
      await user.clear(field);
      await user.type(field, 'prod-db');
      expect(confirm).toBeEnabled();
      await user.click(confirm);
      await waitFor(() => expect(state.value).toBe(true));
    });

    it('labels the field in Spanish under the es locale', async () => {
      const api = mount(undefined, (children) => <I18nProvider locale="es">{children}</I18nProvider>);
      start(() => api().confirm('Elimina la base de datos.', { title: 'Eliminar', typeToConfirm: 'prod-db' }));
      await screen.findByRole('alertdialog');
      expect(screen.getByRole('textbox', { name: 'Escribe prod-db para confirmar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });
  });

  describe('async onConfirm', () => {
    it('shows a pending state, ignores Escape, then closes with true on resolve', async () => {
      const user = userEvent.setup();
      const task = deferred();
      const api = mount();
      const { state } = start(() =>
        api().confirm('Stops now.', { title: 'Revoke', confirmLabel: 'Revoke', onConfirm: () => task.promise }),
      );
      await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Revoke' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Revoke' })).toHaveAttribute('aria-busy', 'true'));
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      await user.keyboard('{Escape}');
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(state.count).toBe(0);
      await act(async () => task.resolve());
      await waitFor(() => expect(state.value).toBe(true));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('stays open on rejection, shows the message in an alert and re-enables both buttons', async () => {
      const user = userEvent.setup();
      const task = deferred();
      const api = mount();
      const { state } = start(() =>
        api().confirm('Stops now.', { title: 'Revoke', confirmLabel: 'Revoke', onConfirm: () => task.promise }),
      );
      await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Revoke' }));
      await act(async () => task.reject(new Error('Key in use')));
      expect(await screen.findByRole('alert')).toHaveTextContent('Key in use');
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Revoke' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
      expect(state.count).toBe(0);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(state.value).toBe(false));
      expect(state.count).toBe(1);
    });
  });

  describe('prompt', () => {
    const validate = (value: string) => (value.trim() === '' ? 'Name is required' : undefined);

    it('disables OK and shows the message while the field is empty, then Enter submits the edited value', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() =>
        api().prompt('Rename environment', { label: 'Name', defaultValue: 'staging', validate }),
      );
      const field = await screen.findByRole('textbox', { name: 'Name' });
      expect(screen.getByRole('dialog', { name: 'Rename environment' })).toBeInTheDocument();
      expect(field).toHaveValue('staging');
      await user.clear(field);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
      await user.type(field, 'staging-2{Enter}');
      await waitFor(() => expect(state.value).toBe('staging-2'));
      expect(dialogsInDom()).toBe(0);
    });

    it('resolves null on Cancel', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().prompt('Rename environment', { label: 'Name', defaultValue: 'staging' }));
      await screen.findByRole('textbox', { name: 'Name' });
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(state.value).toBeNull());
      expect(dialogsInDom()).toBe(0);
    });
  });

  describe('alert', () => {
    it('resolves undefined once acknowledged', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().alert('Saved.', { title: 'Done' }));
      await screen.findByRole('alertdialog', { name: 'Done' });
      await user.click(screen.getByRole('button', { name: 'OK' }));
      await waitFor(() => expect(state.count).toBe(1));
      expect(state.value).toBeUndefined();
      expect(dialogsInDom()).toBe(0);
    });
  });

  describe('open, update and close', () => {
    it('resolves with the value given to onClose', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().open(RenameDialog, { name: 'a' }));
      await screen.findByRole('dialog', { name: 'Rename' });
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(state.value).toBe('a-saved'));
      expect(dialogsInDom()).toBe(0);
    });

    it('update re-renders the dialog with the new payload', async () => {
      const api = mount();
      const { promise } = start(() => api().open(RenameDialog, { name: 'a' }));
      await screen.findByRole('dialog', { name: 'Rename' });
      expect(screen.getByTestId('current-name')).toHaveTextContent('a');
      act(() => api().update(promise, { name: 'b' }));
      expect(screen.getByTestId('current-name')).toHaveTextContent('b');
    });

    it('close resolves the dialog with the given result and removes it', async () => {
      const api = mount();
      const { promise, state } = start(() => api().open(RenameDialog, { name: 'a' }));
      await screen.findByRole('dialog', { name: 'Rename' });
      act(() => api().close(promise, 'x'));
      await waitFor(() => expect(state.value).toBe('x'));
      expect(dialogsInDom()).toBe(0);
    });
  });

  describe('stacking', () => {
    it('a confirm opened inside an open() dialog sits on top; Escape closes only the confirm and focus returns inside', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().open(RenameDialog, { name: 'a' }));
      const lower = await screen.findByRole('dialog', { name: 'Rename' });
      const ask = screen.getByRole('button', { name: 'Ask' });
      await user.click(ask);
      const confirmDialog = await screen.findByRole('alertdialog', { name: 'Discard' });
      await waitFor(() => expect(confirmDialog.contains(document.activeElement)).toBe(true));
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(screen.getByRole('dialog', { name: 'Rename' })).toBe(lower);
      expect(state.count).toBe(0);
      await waitFor(() => expect(lower.contains(document.activeElement)).toBe(true));
      expect(ask).toHaveFocus();
    });
  });

  describe('focus', () => {
    function RowMenu() {
      const { confirm } = useDialogs();
      return (
        <Menu>
          <MenuTrigger render={<Button />}>Row actions</MenuTrigger>
          <MenuContent>
            <MenuItem onClick={() => void confirm('Stops at once.', { title: 'Revoke API key' })}>Revoke</MenuItem>
          </MenuContent>
        </Menu>
      );
    }

    it('after Cancel on a confirm started from a menu item, focus lands on the menu trigger', async () => {
      const user = userEvent.setup();
      mount(<RowMenu />);
      const trigger = screen.getByRole('button', { name: 'Row actions' });
      await user.click(trigger);
      await user.click(await screen.findByRole('menuitem', { name: 'Revoke' }));
      await screen.findByRole('alertdialog', { name: 'Revoke API key' });
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it('returnFocus takes precedence over the opener', async () => {
      const user = userEvent.setup();
      const target = document.createElement('button');
      target.textContent = 'Elsewhere';
      document.body.append(target);
      const api = mount(<Button>Opener</Button>);
      const opener = screen.getByRole('button', { name: 'Opener' });
      opener.focus();
      start(() => api().confirm('Sure?', { title: 'Check', returnFocus: target }));
      await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(target).toHaveFocus());
      target.remove();
    });

    it('returns focus to the opener when no menu is involved', async () => {
      const user = userEvent.setup();
      const api = mount(<Button>Opener</Button>);
      const opener = screen.getByRole('button', { name: 'Opener' });
      opener.focus();
      start(() => api().confirm('Sure?', { title: 'Check' }));
      await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(opener).toHaveFocus());
    });

    it('closing the lower dialog keeps focus in the confirm above; focus reaches the outside button only when the stack empties', async () => {
      const user = userEvent.setup();
      const api = mount(<Button>Outside</Button>);
      const outside = screen.getByRole('button', { name: 'Outside' });
      outside.focus();
      const { promise: custom, state: customState } = start(() => api().open(RenameDialog, { name: 'a' }));
      await screen.findByRole('dialog', { name: 'Rename' });
      await user.click(screen.getByRole('button', { name: 'Ask' }));
      const confirmDialog = await screen.findByRole('alertdialog', { name: 'Discard' });
      await waitFor(() => expect(confirmDialog.contains(document.activeElement)).toBe(true));
      act(() => api().close(custom, 'done'));
      await waitFor(() => expect(customState.value).toBe('done'));
      expect(screen.queryByRole('dialog', { name: 'Rename' })).not.toBeInTheDocument();
      expect(screen.getByRole('alertdialog', { name: 'Discard' })).toBeInTheDocument();
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(confirmDialog.contains(document.activeElement)).toBe(true);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      await waitFor(() => expect(outside).toHaveFocus());
    });
  });

  describe('closeAll and unmount', () => {
    it('closeAll resolves confirm with false, prompt with null and alert with undefined, leaving no dialog', async () => {
      const api = mount();
      const confirmed = start(() => api().confirm('Sure?', { title: 'Check' }));
      const prompted = start(() => api().prompt('Name?', { label: 'Name' }));
      const alerted = start(() => api().alert('Heads up', { title: 'Note' }));
      await waitFor(() => expect(dialogsInDom()).toBe(3));
      act(() => api().closeAll());
      await waitFor(() => expect(confirmed.state.count + prompted.state.count + alerted.state.count).toBe(3));
      expect(confirmed.state.value).toBe(false);
      expect(prompted.state.value).toBeNull();
      expect(alerted.state.value).toBeUndefined();
      expect(dialogsInDom()).toBe(0);
    });

    it('unmounting the provider settles the same way', async () => {
      const api = mount();
      const confirmed = start(() => api().confirm('Sure?', { title: 'Check' }));
      const prompted = start(() => api().prompt('Name?', { label: 'Name' }));
      await waitFor(() => expect(dialogsInDom()).toBe(2));
      api.unmount();
      await waitFor(() => expect(confirmed.state.count + prompted.state.count).toBe(2));
      expect(confirmed.state.value).toBe(false);
      expect(prompted.state.value).toBeNull();
      expect(dialogsInDom()).toBe(0);
    });

    it('a late settle of a closed dialog does nothing', async () => {
      const task = deferred();
      const api = mount();
      const { state } = start(() => api().confirm('Sure?', { title: 'Check', onConfirm: () => task.promise }));
      await screen.findByRole('alertdialog');
      await userEvent.setup().click(screen.getByRole('button', { name: 'Confirm' }));
      act(() => api().closeAll());
      await act(async () => task.resolve());
      expect(state.count).toBe(1);
      expect(state.value).toBe(false);
    });
  });

  describe('React.StrictMode effect replay', () => {
    function Starter({ onStart }: { onStart: (promise: Promise<boolean>) => void }) {
      const { confirm } = useDialogs();
      useEffect(() => {
        onStart(confirm('Sure?', { title: 'Check' }));
      }, [confirm, onStart]);
      return null;
    }

    function setup(strict: boolean) {
      const states: Array<ReturnType<typeof track<boolean>>> = [];
      const onStart = (promise: Promise<boolean>) => {
        states.push(track(promise));
      };
      const wrap = (children: ReactNode) => (strict ? <StrictMode>{children}</StrictMode> : children);
      const api = mount(<Starter onStart={onStart} />, wrap);
      return { api, states };
    }

    it('leaves no orphan dialog after Cancel and settles every promise exactly once', async () => {
      const user = userEvent.setup();
      const { states } = setup(true);
      await screen.findByRole('alertdialog');
      expect(dialogsInDom()).toBe(1);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(dialogsInDom()).toBe(0));
      expect(states.length).toBeGreaterThan(1);
      await waitFor(() => expect(states.every((state) => state.count === 1)).toBe(true));
      expect(states.every((state) => state.value === false)).toBe(true);
    });

    it('leaves no orphan dialog after closeAll and settles every promise exactly once', async () => {
      const { api, states } = setup(true);
      await screen.findByRole('alertdialog');
      act(() => api().closeAll());
      await waitFor(() => expect(dialogsInDom()).toBe(0));
      await waitFor(() => expect(states.every((state) => state.count === 1)).toBe(true));
    });

    it('control: without StrictMode a single dialog opens and Cancel removes it', async () => {
      const user = userEvent.setup();
      const { states } = setup(false);
      await screen.findByRole('alertdialog');
      expect(states).toHaveLength(1);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(dialogsInDom()).toBe(0));
      await waitFor(() => expect(states[0]?.count).toBe(1));
    });
  });

  describe('keyboard contract', () => {
    it('documents Tab, Escape and both Enter rows', () => {
      expect(doc.keyboard?.map(([key]) => key)).toEqual(['Tab / Shift+Tab', 'Escape', 'Enter', 'Enter / Space']);
    });

    it('Tab and Shift+Tab cycle focus inside the topmost dialog', async () => {
      const user = userEvent.setup();
      const api = mount(<Button>Outside</Button>);
      start(() => api().confirm('Sure?', { title: 'Check' }));
      const dialog = await screen.findByRole('alertdialog');
      for (let i = 0; i < 6; i++) {
        await user.tab(i % 2 === 0 ? {} : { shift: true });
        await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      }
    });

    it('Enter in a matching typed-confirmation field confirms', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().confirm('Drops it.', { title: 'Delete', typeToConfirm: 'prod-db' }));
      const field = await screen.findByRole('textbox', { name: 'Type prod-db to confirm' });
      await user.type(field, 'prod{Enter}');
      expect(state.count).toBe(0);
      await user.type(field, '-db{Enter}');
      await waitFor(() => expect(state.value).toBe(true));
    });

    it('Space on the confirm button activates it', async () => {
      const user = userEvent.setup();
      const api = mount();
      const { state } = start(() => api().confirm('Sure?', { title: 'Check' }));
      await screen.findByRole('alertdialog');
      screen.getByRole('button', { name: 'Confirm' }).focus();
      await user.keyboard(' ');
      await waitFor(() => expect(state.value).toBe(true));
    });
  });

  describe('examples', () => {
    it('row menu: the opened confirmation has no axe violations', async () => {
      const user = userEvent.setup();
      render(<DialogsRowMenu />);
      await user.click(screen.getByRole('button', { name: 'Key actions' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Revoke key' }));
      await screen.findByRole('alertdialog', { name: 'Revoke API key' });
      await expectNoAxeViolations();
      await user.click(screen.getByRole('button', { name: 'Revoke' }));
      await waitFor(() => expect(screen.getByText('Revoked')).toBeInTheDocument());
    });

    it('typed confirm: the opened confirmation has no axe violations', async () => {
      const user = userEvent.setup();
      render(<DialogsTypedConfirm />);
      await user.click(screen.getByRole('button', { name: 'Delete database' }));
      await screen.findByRole('alertdialog', { name: 'Delete prod-db?' });
      await expectNoAxeViolations();
    });

    it('async confirm: the failure is shown inline, then a retry succeeds', async () => {
      const user = userEvent.setup();
      render(<DialogsAsyncConfirm />);
      await user.click(screen.getByRole('button', { name: 'Rotate key' }));
      await screen.findByRole('alertdialog', { name: 'Rotate API key?' });
      await user.click(screen.getByRole('button', { name: 'Rotate' }));
      expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent('Key in use');
      await expectNoAxeViolations();
      await user.click(screen.getByRole('button', { name: 'Rotate' }));
      await waitFor(() => expect(screen.getByText('Key rotated')).toBeInTheDocument(), { timeout: 3000 });
    });

    it('prompt: the opened dialog has no axe violations', async () => {
      const user = userEvent.setup();
      render(<DialogsPrompt />);
      await user.click(screen.getByRole('button', { name: 'Rename environment' }));
      await screen.findByRole('textbox', { name: 'Name' });
      await expectNoAxeViolations();
      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await expectNoAxeViolations();
    });

    it('custom dialog: the dialog and the confirm stacked above it have no axe violations', async () => {
      const user = userEvent.setup();
      render(<DialogsCustomDialog />);
      await user.click(screen.getByRole('button', { name: 'Rename project' }));
      await screen.findByRole('dialog', { name: 'Rename project' });
      await expectNoAxeViolations();
      await user.type(screen.getByRole('textbox', { name: 'Project name' }), '-2');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await screen.findByRole('alertdialog', { name: 'Discard changes?' });
      await expectNoAxeViolations();
    });
  });
});
