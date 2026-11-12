import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCommandPaletteStore } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import ServerSearch from './examples/ServerSearch';
import { GlobalSearch } from './GlobalSearch';

describe('GlobalSearch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows Ctrl for the Create project shortcut on Linux', async () => {
    vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
    const user = userEvent.setup();
    render(<GlobalSearch />);
    await user.click(screen.getByRole('button', { name: /Search/ }));
    const item = await screen.findByRole('option', { name: /Create project/ });
    expect(within(item).getByText('Ctrl')).toBeInTheDocument();
    expect(within(item).queryByText('⌘')).not.toBeInTheDocument();
  });

  it('renders the trigger with the shortcut hint', async () => {
    const { container } = render(<GlobalSearch />);
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('⌘K opens it with recent and grouped results; choosing one reports its group', async () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<GlobalSearch onSelect={onSelect} />);
    await user.keyboard('{Meta>}k{/Meta}');
    const dialog = await screen.findByRole('dialog', { name: 'Global search' });
    for (const heading of ['Recent', 'Pages', 'Records', 'Actions'])
      expect(within(dialog).getByText(heading)).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.keyboard('INV-2041');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'record-inv-2041' });
    expect(onSelect.mock.calls[0]?.[1]).toBe('records');
  }, 15_000);

  it('reports a chosen loaded item as records, forwarding loadItems, onQueryChange and the store', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onQueryChange = vi.fn();
    const store = createCommandPaletteStore();
    const run = { id: 'run-42', label: 'Run 42' };
    const loadItems = vi.fn(async () => [{ label: 'Runs', items: [run] }]);
    render(
      <GlobalSearch
        pages={[]}
        records={[]}
        actions={[]}
        recent={[]}
        loadItems={loadItems}
        debounceMs={10}
        minQueryLength={3}
        onQueryChange={onQueryChange}
        store={store}
        onSelect={onSelect}
      />,
    );
    act(() => store.open());
    const input = await screen.findByRole('combobox');
    await user.type(input, 'ru');
    await new Promise((r) => setTimeout(r, 40));
    expect(loadItems).not.toHaveBeenCalled();
    await user.type(input, 'n');
    await user.click(await screen.findByRole('option', { name: 'Run 42' }));
    expect(loadItems).toHaveBeenCalledWith('run', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(onQueryChange).toHaveBeenCalledWith('run');
    expect(onSelect).toHaveBeenCalledWith(run, 'records');
    await waitFor(() => expect(store.isOpen()).toBe(false));
  });

  it('keeps the static group of an item that is also returned by loadItems', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const settings = { id: 'settings', label: 'Settings' };
    render(
      <GlobalSearch
        pages={[settings]}
        records={[]}
        actions={[]}
        recent={[]}
        loadItems={async () => [{ label: 'Server', items: [{ id: 'settings', label: 'Settings (server)' }] }]}
        debounceMs={10}
        onSelect={onSelect}
        defaultOpen
      />,
    );
    await user.type(await screen.findByRole('combobox'), 'set');
    await user.click(await screen.findByRole('option', { name: 'Settings' }));
    expect(onSelect).toHaveBeenCalledWith(settings, 'pages');
  });

  it('reports a loaded item as records when a hidden static item shares its id', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const server = { id: 'settings', label: 'Server agent' };
    render(
      <GlobalSearch
        pages={[{ id: 'settings', label: 'Settings' }]}
        records={[]}
        actions={[]}
        recent={[]}
        loadItems={async () => [{ label: 'Server', items: [server] }]}
        debounceMs={10}
        onSelect={onSelect}
        defaultOpen
      />,
    );
    await user.type(await screen.findByRole('combobox'), 'agent');
    await user.click(await screen.findByRole('option', { name: 'Server agent' }));
    expect(onSelect).toHaveBeenCalledWith(server, 'records');
  });

  it('reports a loaded item as records when the loader returns the same object as a hidden static item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const settings = { id: 'settings', label: 'Settings' };
    render(
      <GlobalSearch
        pages={[settings]}
        records={[]}
        actions={[]}
        recent={[]}
        loadItems={async () => [{ label: 'Server', items: [settings] }]}
        debounceMs={10}
        onSelect={onSelect}
        defaultOpen
      />,
    );
    await user.type(await screen.findByRole('combobox'), 'agent');
    await user.click(await screen.findByRole('option', { name: 'Settings' }));
    expect(onSelect).toHaveBeenCalledWith(settings, 'records');
  });

  it('the Server search example opens from its button, loads records and passes axe', async () => {
    const user = userEvent.setup();
    const { container } = render(<ServerSearch />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Open from a button' }));
    await user.type(await screen.findByRole('combobox'), 'agent');
    await expectNoAxeViolations();
    await user.click(await screen.findByRole('option', { name: 'Support triage' }, { timeout: 3000 }));
    expect(await screen.findByText('Support triage (records)')).toBeInTheDocument();
  }, 15_000);
});
