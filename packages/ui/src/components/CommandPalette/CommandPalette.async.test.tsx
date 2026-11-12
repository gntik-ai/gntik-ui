import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { CommandPalette, CommandPaletteTrigger, type CommandPaletteProps } from './CommandPalette';
import type { CommandGroup, CommandItem } from './command-filter';

type Load = NonNullable<CommandPaletteProps['loadItems']>;

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const item = (id: string, label = id, extra: Partial<CommandItem> = {}): CommandItem => ({ id, label, ...extra });
const staticGroups: CommandGroup[] = [
  { label: 'Actions', items: [item('run-tests', 'Run tests'), item('settings', 'Settings')] },
];
const agents = (...ids: string[]): CommandGroup[] => [{ label: 'Agents', items: ids.map((id) => item(id, id)) }];

const options = () => screen.queryAllByRole('option');
const names = () => options().map((o) => o.textContent);
const statusText = () =>
  screen
    .queryAllByRole('status')
    .map((el) => el.textContent)
    .join(' ');

async function setup(props: Partial<CommandPaletteProps> & { loadItems?: Load } = {}, { locale = 'en' } = {}) {
  const user = userEvent.setup();
  const view = render(
    <I18nProvider locale={locale}>
      <CommandPalette groups={staticGroups} debounceMs={10} {...props}>
        <CommandPaletteTrigger />
      </CommandPalette>
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button'));
  const input = await screen.findByRole('combobox');
  await waitFor(() => expect(input).toHaveFocus());
  return { user, input, ...view };
}

describe('CommandPalette loadItems', () => {
  afterEach(() => vi.useRealTimers());

  it('debounces typing: r, u, n 100 ms apart load once with "run", 250 ms after the last key', async () => {
    const load = vi.fn<Load>(async () => []);
    const { input } = await setup({ loadItems: load, debounceMs: 250 });
    // user-event would wait on a faked timer, so type with change events and advance the clock by hand.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    for (const value of ['r', 'ru']) {
      fireEvent.change(input, { target: { value } });
      act(() => void vi.advanceTimersByTime(100));
    }
    fireEvent.change(input, { target: { value: 'run' } });
    expect(load).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(249));
    expect(load).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith('run', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('aborts the pending signal on a newer keystroke and on Escape, and never renders a late result', async () => {
    const signals: Record<string, AbortSignal> = {};
    const pending: Record<string, ReturnType<typeof deferred<CommandGroup[]>>> = {};
    const load = vi.fn<Load>((q, { signal }) => {
      signals[q] = signal;
      pending[q] = deferred<CommandGroup[]>();
      return pending[q]!.promise;
    });
    const { user, input } = await setup({ loadItems: load });
    await user.type(input, 'ag');
    await waitFor(() => expect(load).toHaveBeenCalledWith('ag', expect.anything()));
    await user.type(input, 'e');
    expect(signals['ag']!.aborted).toBe(true);
    await act(async () => pending['ag']!.resolve(agents('late')));
    expect(screen.queryByText('late')).not.toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalledWith('age', expect.anything()));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(signals['age']!.aborted).toBe(true);
    await act(async () => pending['age']!.resolve(agents('later')));
    expect(screen.queryByText('later')).not.toBeInTheDocument();
  });

  it('does not load on open, and recents and static groups render as before', async () => {
    const load = vi.fn<Load>(async () => agents('a1'));
    await setup({ loadItems: load, recent: [item('r1', 'Recent one')] });
    expect(names()).toEqual(['Recent one', 'Run tests', 'Settings']);
    await new Promise((r) => setTimeout(r, 40));
    expect(load).not.toHaveBeenCalled();
  });

  it('waits for minQueryLength trimmed characters', async () => {
    const load = vi.fn<Load>(async () => agents('a1'));
    const { user, input } = await setup({ loadItems: load, minQueryLength: 2 });
    await user.type(input, 'a');
    await new Promise((r) => setTimeout(r, 40));
    expect(load).not.toHaveBeenCalled();
    await user.type(input, 'g');
    await waitFor(() => expect(load).toHaveBeenCalledWith('ag', expect.anything()));
    await user.clear(input);
    await user.type(input, ' a ');
    await new Promise((r) => setTimeout(r, 40));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('hides loaded groups below minQueryLength, including after a reopen', async () => {
    const load = vi.fn<Load>(async () => agents('a1'));
    const { user, input } = await setup({ loadItems: load, minQueryLength: 2 });
    await user.type(input, 'ag');
    expect(await screen.findByRole('option', { name: 'a1' })).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    await waitFor(() => expect(screen.queryByRole('option', { name: 'a1' })).not.toBeInTheDocument());
    await user.type(input, 'g');
    expect(await screen.findByRole('option', { name: 'a1' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button'));
    await screen.findByRole('dialog');
    expect(screen.queryByRole('option', { name: 'a1' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('combobox'), 'a');
    expect(screen.queryByRole('option', { name: 'a1' })).not.toBeInTheDocument();
  });

  it('asks again when the same query is typed in a new session', async () => {
    const load = vi.fn<Load>(async () => agents('a1'));
    const { user, input } = await setup({ loadItems: load });
    await user.type(input, 'ag');
    await screen.findByRole('option', { name: 'a1' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button'));
    await user.type(await screen.findByRole('combobox'), 'ag');
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });

  describe('pending state', () => {
    it('marks the list busy, shows Loading… and keeps static matches usable', async () => {
      const d = deferred<CommandGroup[]>();
      const onSelect = vi.fn();
      const groups: CommandGroup[] = [
        {
          label: 'Actions',
          items: [item('a-one', 'Agent one', { onSelect }), item('a-two', 'Agent two', { onSelect })],
        },
      ];
      const { user, input } = await setup({ groups, loadItems: () => d.promise });
      await user.type(input, 'agent');
      await waitFor(() => expect(statusText()).toContain('Loading…'));
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText(/No results/)).not.toBeInTheDocument();
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('reads Cargando… in Spanish and honours loadingText', async () => {
      const d = deferred<CommandGroup[]>();
      const { user, input } = await setup({ loadItems: () => d.promise }, { locale: 'es' });
      await user.type(input, 'ag');
      await waitFor(() => expect(statusText()).toContain('Cargando…'));
    });

    it('lets loadingText override the default', async () => {
      const d = deferred<CommandGroup[]>();
      const { user, input } = await setup({ loadItems: () => d.promise, loadingText: 'Searching the server…' });
      await user.type(input, 'ag');
      await waitFor(() => expect(statusText()).toContain('Searching the server…'));
    });

    it('clears the busy state once the result arrives', async () => {
      const d = deferred<CommandGroup[]>();
      const { user, input } = await setup({ loadItems: () => d.promise });
      await user.type(input, 'ag');
      await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true'));
      await act(async () => d.resolve(agents('a1')));
      await screen.findByRole('option', { name: 'a1' });
      expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');
      expect(statusText()).not.toContain('Loading');
    });
  });

  describe('error and Retry', () => {
    it('shows the default message and Retry as the last option; Enter on Retry loads the same query again', async () => {
      const onSelect = vi.fn();
      const onQueryChange = vi.fn();
      const load = vi.fn<Load>().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(agents('a1'));
      const { user, input } = await setup({
        loadItems: load,
        groups: [{ label: 'Actions', items: [item('agent-x', 'Agent x')] }],
        onSelect,
        onQueryChange,
      });
      await user.type(input, 'agent');
      await waitFor(() => expect(statusText()).toContain('Couldn’t load results.'));
      expect(names()).toEqual(['Agent x', 'Retry']);
      expect(options().at(-1)).toHaveTextContent('Retry');
      onQueryChange.mockClear();
      await user.keyboard('{ArrowDown}{Enter}');
      await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
      expect(load).toHaveBeenLastCalledWith('agent', expect.anything());
      expect(await screen.findByRole('option', { name: 'a1' })).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(input).toHaveValue('agent');
      expect(onSelect).not.toHaveBeenCalled();
      expect(onQueryChange).not.toHaveBeenCalled();
    });

    it('does not count the status row or Retry as results', async () => {
      const { user, input } = await setup({ loadItems: () => Promise.reject(new Error('x')) });
      await user.type(input, 'run');
      await waitFor(() => expect(names()).toContain('Retry'));
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('lets errorText override the message, as a node or a function of the error', async () => {
      const { user, input, unmount } = await setup({
        loadItems: () => Promise.reject(new Error('x')),
        errorText: 'Search is down.',
      });
      await user.type(input, 'ag');
      await waitFor(() => expect(statusText()).toContain('Search is down.'));
      unmount();
      const second = await setup({
        loadItems: () => Promise.reject(new Error('quota')),
        errorText: (e) => `Failed: ${(e as Error).message}`,
      });
      await second.user.type(second.input, 'ag');
      await waitFor(() => expect(statusText()).toContain('Failed: quota'));
    });

    it('reads the Spanish message', async () => {
      const { user, input } = await setup({ loadItems: () => Promise.reject(new Error('x')) }, { locale: 'es' });
      await user.type(input, 'ag');
      await waitFor(() => expect(statusText()).toContain('No se pudieron cargar los resultados.'));
      expect(options().at(-1)).toHaveTextContent('Reintentar');
    });

    it('shows no error for an AbortError', async () => {
      const load = vi.fn<Load>(() => Promise.reject(new DOMException('Aborted', 'AbortError')));
      const { user, input } = await setup({ loadItems: load });
      await user.type(input, 'ag');
      await waitFor(() => expect(load).toHaveBeenCalled());
      await new Promise((r) => setTimeout(r, 20));
      expect(statusText()).not.toContain('Couldn’t');
      expect(names()).not.toContain('Retry');
    });
  });

  describe('ordering and de-duplication', () => {
    it('renders loaded groups after static ones in the returned order, without ranking', async () => {
      const a1 = item('a1', 'Alpha one');
      const a2 = item('a2', 'Zeta two');
      const { user, input } = await setup({ loadItems: async () => [{ label: 'Agents', items: [a2, a1] }] });
      await user.type(input, 'run');
      await screen.findByRole('option', { name: 'Zeta two' });
      expect(names()).toEqual(['Run tests', 'Zeta two', 'Alpha one']);
      const headings = screen.getAllByText(/^(Actions|Agents)$/).map((h) => h.textContent);
      expect(headings).toEqual(['Actions', 'Agents']);
    });

    it('renders a loaded id that is already visible once, in the static group', async () => {
      const { user, input } = await setup({
        loadItems: async () => [{ label: 'Agents', items: [item('settings', 'Settings (server)'), item('a1')] }],
      });
      await user.type(input, 'set');
      await screen.findByRole('option', { name: 'a1' });
      expect(names()).toEqual(['Settings', 'a1']);
    });

    it('drops a loaded group whose items are all duplicates', async () => {
      const { user, input } = await setup({
        loadItems: async () => [{ label: 'Agents', items: [item('settings')] }],
      });
      await user.type(input, 'set');
      await waitFor(() => expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy'));
      expect(screen.queryByText('Agents')).not.toBeInTheDocument();
    });

    it('runs the loaded item, then the palette onSelect, then closes', async () => {
      const calls: string[] = [];
      const a1 = item('a1', 'Agent one', { onSelect: () => calls.push('item') });
      const { user, input } = await setup({
        loadItems: async () => [{ label: 'Agents', items: [a1] }],
        onSelect: () => calls.push('palette'),
      });
      await user.type(input, 'zzz');
      await user.click(await screen.findByRole('option', { name: 'Agent one' }));
      expect(calls).toEqual(['item', 'palette']);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('shows emptyText only when nothing is loading and nothing matched', async () => {
      const d = deferred<CommandGroup[]>();
      const { user, input } = await setup({ loadItems: () => d.promise, emptyText: (q) => `Nothing for ${q}` });
      await user.type(input, 'zzz');
      await waitFor(() => expect(statusText()).toContain('Loading…'));
      expect(screen.queryByText('Nothing for zzz')).not.toBeInTheDocument();
      await act(async () => d.resolve([]));
      expect(await screen.findByText('Nothing for zzz')).toBeInTheDocument();
    });

    it('does not show emptyText while only loaded items matched', async () => {
      const { user, input } = await setup({ loadItems: async () => agents('a1'), emptyText: () => 'Nothing' });
      await user.type(input, 'zzz');
      await screen.findByRole('option', { name: 'a1' });
      expect(screen.queryByText('Nothing')).not.toBeInTheDocument();
    });
  });

  describe('onQueryChange', () => {
    it('receives every typed value and "" on reopen, and is not called when an item is chosen', async () => {
      const onQueryChange = vi.fn();
      const { user, input } = await setup({ onQueryChange });
      expect(onQueryChange.mock.calls.map((c) => c[0])).toEqual(['']);
      onQueryChange.mockClear();
      await user.type(input, 'ru');
      expect(onQueryChange.mock.calls.map((c) => c[0])).toEqual(['r', 'ru']);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await user.click(screen.getByRole('button'));
      await screen.findByRole('dialog');
      expect(onQueryChange.mock.calls.map((c) => c[0])).toEqual(['r', 'ru', '']);
      await user.type(screen.getByRole('combobox'), 'se');
      onQueryChange.mockClear();
      await user.click(await screen.findByRole('option', { name: 'Settings' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onQueryChange).not.toHaveBeenCalled();
    });
  });

  it('keeps the loaded rows scoped to the dialog list', async () => {
    const { user, input } = await setup({ loadItems: async () => agents('a1') });
    await user.type(input, 'ag');
    const option = await screen.findByRole('option', { name: 'a1' });
    expect(within(screen.getByRole('dialog')).getByRole('listbox')).toContainElement(option);
  });
});
