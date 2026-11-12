import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { filterCommandGroups, scoreCommand } from './command-filter';
import CommandPaletteBasic from './examples/CommandPaletteBasic';
import { CommandPalette, CommandPaletteTrigger } from './CommandPalette';
import { createCommandPaletteStore } from './commandPaletteStore';
import { I18nProvider } from '../../i18n/I18nProvider';

describe('CommandPaletteTrigger platform hints', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows Ctrl K announced as Control on Windows', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    render(
      <CommandPalette groups={[]}>
        <CommandPaletteTrigger />
      </CommandPalette>,
    );
    const trigger = screen.getByRole('button', { name: /Search/ });
    expect(within(trigger).getByText('Ctrl')).toHaveAttribute('aria-hidden', 'true');
    expect(within(trigger).getByText('Control')).toHaveClass('sr-only');
    expect(within(trigger).getByText('K')).toBeInTheDocument();
    expect(within(trigger).queryByText('⌘')).not.toBeInTheDocument();
  });

  it('shows Command K on macOS', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    render(
      <CommandPalette groups={[]}>
        <CommandPaletteTrigger />
      </CommandPalette>,
    );
    const trigger = screen.getByRole('button', { name: /Search/ });
    expect(within(trigger).getByText('⌘')).toHaveAttribute('aria-hidden', 'true');
    expect(within(trigger).getByText('Command')).toHaveClass('sr-only');
    expect(within(trigger).getByText('K')).toBeInTheDocument();
  });

  it.each(['Win32', 'MacIntel', 'Linux x86_64'])('keeps explicit keys on %s', (platform) => {
    vi.stubGlobal('navigator', { platform });
    render(
      <CommandPalette groups={[]}>
        <CommandPaletteTrigger keys={['⌘', 'K']} />
      </CommandPalette>,
    );
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.queryByText('Ctrl')).not.toBeInTheDocument();
  });
});

async function openWithShortcut(combo = '{Meta>}k{/Meta}') {
  const user = userEvent.setup();
  render(<CommandPaletteBasic />);
  await user.keyboard(combo);
  const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
  const input = within(dialog).getByRole('combobox');
  await waitFor(() => expect(input).toHaveFocus());
  return { user, dialog, input };
}

const options = (dialog: HTMLElement) => within(dialog).getAllByRole('option');
const highlighted = (dialog: HTMLElement) => dialog.querySelector('[role="option"][data-highlighted]');

describe('CommandPalette', () => {
  beforeEach(() => vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel'));
  afterEach(() => vi.restoreAllMocks());

  it('uses only the platform command key and toggles while open on macOS', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteBasic />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.keyboard('{Meta>}k{/Meta}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Meta>}k{/Meta}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('highlights the first match arriving after typing and selects it with Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(<CommandPalette defaultOpen groups={[]} onSelect={onSelect} />);
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, 'proj');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    const first = { id: 'projects', label: 'Projects' };
    rerender(
      <CommandPalette
        defaultOpen
        groups={[{ label: 'Results', items: [first, { id: 'create', label: 'Create project' }] }]}
        onSelect={onSelect}
      />,
    );
    const option = await screen.findByRole('option', { name: 'Projects' });
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', option.id));
    expect(option).toHaveAttribute('data-highlighted');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(first);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('ranks prefix > word start > subsequence and searches keywords', () => {
    expect(scoreCommand({ id: 'a', label: 'Projects' }, 'pro')).toBeGreaterThan(
      scoreCommand({ id: 'b', label: 'Create project' }, 'pro'),
    );
    expect(scoreCommand({ id: 'a', label: 'Create project' }, 'crp')).toBeGreaterThan(0);
    expect(scoreCommand({ id: 'a', label: 'Billing', keywords: ['invoices'] }, 'invoice')).toBeGreaterThan(0);
    expect(scoreCommand({ id: 'a', label: 'Billing' }, 'xyz')).toBe(-1);
    const groups = filterCommandGroups([{ label: 'G', items: [{ id: 'a', label: 'Analytics' }] }], '', [
      { id: 'a', label: 'Analytics' },
    ]);
    expect(groups.map((g) => g.value)).toEqual(['Recent', 'G']);
  });

  it.each([['{Meta>}k{/Meta}'], ['{Control>}k{/Control}']])(
    '%s opens the palette with groups and recent items',
    async (combo) => {
      if (combo.includes('Control')) vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
      const { dialog } = await openWithShortcut(combo);
      expect(within(dialog).getByText('Recent')).toBeInTheDocument();
      expect(within(dialog).getByText('Actions')).toBeInTheDocument();
      expect(options(dialog)).toHaveLength(12);
      expect(highlighted(dialog)).toHaveTextContent('web-frontend');
    },
  );

  it('the trigger button opens it too', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteBasic />);
    await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
  });

  it('typing filters and ranks the commands', async () => {
    const { user, dialog } = await openWithShortcut();
    await user.keyboard('proj');
    await waitFor(() => expect(within(dialog).queryByText('Recent')).not.toBeInTheDocument());
    const labels = options(dialog).map((o) => o.textContent);
    expect(labels[0]).toMatch(/Create project/);
    expect(labels).toEqual(expect.arrayContaining([expect.stringMatching(/^Projects/)]));
    expect(within(dialog).getByText(/3 results/)).toBeInTheDocument();
    await user.clear(within(dialog).getByRole('combobox'));
    await user.keyboard('invoices');
    await waitFor(() => expect(options(dialog)).toHaveLength(1));
    expect(options(dialog)[0]).toHaveTextContent('Billing');
  });

  it('shows the empty state when nothing matches', async () => {
    const { user, dialog } = await openWithShortcut();
    await user.keyboard('qqqq');
    expect(await within(dialog).findByText(/No results for/)).toBeInTheDocument();
    expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
  });

  it('ArrowDown / ArrowUp move the highlight across groups', async () => {
    const { user, dialog } = await openWithShortcut();
    expect(highlighted(dialog)).toHaveTextContent('web-frontend');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('billing-api'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('Create project'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('billing-api'));
  });

  it('Enter runs the highlighted command and closes', async () => {
    const { user } = await openWithShortcut();
    await user.keyboard('deploy');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Deploy to production', { selector: 'span' })).toBeInTheDocument();
  });

  it('Escape closes and returns focus to the trigger; reopening resets the query', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteBasic />);
    const trigger = screen.getByRole('button', { name: /Search or run a command/ });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('combobox')).toHaveFocus());
    await user.keyboard('bill');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.keyboard('{Meta>}k{/Meta}');
    const again = await screen.findByRole('dialog');
    expect(within(again).getByRole('combobox')).toHaveValue('');
  });

  it.each(['dark', 'light', 'high_contrast'])('open palette has no axe violations in %s', async (theme) => {
    document.documentElement.className = theme;
    const { user } = await openWithShortcut();
    await expectNoAxeViolations();
    await user.keyboard('zzzz');
    await expectNoAxeViolations();
  });
});

it('lists accented commands with the same score for either spelling', () => {
  const item = { id: 'function', label: 'Función de prueba' };
  expect(scoreCommand(item, 'funcion')).toBe(100);
  expect(scoreCommand(item, 'función')).toBe(100);
  expect(filterCommandGroups([{ label: 'Actions', items: [item] }], 'funcion')[0]?.items[0]?.item).toEqual(item);
});

describe('CommandPalette filter, limit and renderItem', () => {
  const ids = ['run-a', 'beta', 'run-b', 'rerun'];
  const groups = [{ label: 'Actions', items: ids.map((id) => ({ id, label: id })) }];

  it('ranks static items with a custom filter: only ids starting with the query are listed', async () => {
    const user = userEvent.setup();
    render(<CommandPalette defaultOpen groups={groups} filter={(item, q) => (item.id.startsWith(q) ? 1 : -1)} />);
    await user.type(await screen.findByRole('combobox'), 'ru');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['run-a', 'run-b']));
  });

  it('filter={() => 0} keeps every item in the given order', async () => {
    const user = userEvent.setup();
    render(<CommandPalette defaultOpen groups={groups} filter={() => 0} />);
    await user.type(await screen.findByRole('combobox'), 'zzz');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(ids);
    expect(screen.queryByText(/No results/)).not.toBeInTheDocument();
  });

  it('a custom filter also ranks the empty query on open: below 0 hides, higher scores come first', async () => {
    const { unmount } = render(<CommandPalette defaultOpen groups={groups} filter={() => -1} />);
    await screen.findByRole('combobox');
    expect(screen.queryAllByRole('option')).toEqual([]);
    unmount();
    render(<CommandPalette defaultOpen groups={groups} filter={(item) => (item.id === 'rerun' ? 2 : 1)} />);
    await screen.findByRole('combobox');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['rerun', 'run-a', 'beta', 'run-b']);
  });

  it('a custom filter also scores recent items: filter={() => -1} lists no option even with recents', async () => {
    render(
      <CommandPalette defaultOpen groups={groups} recent={[{ id: 'old', label: 'Old command' }]} filter={() => -1} />,
    );
    await screen.findByRole('combobox');
    expect(screen.queryAllByRole('option')).toEqual([]);
  });

  it('limit renders that many options and the footer reads Showing 50 of 120', async () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ id: `cmd-${i}`, label: `Command ${i}` }));
    render(<CommandPalette defaultOpen groups={[{ label: 'All', items: many }]} limit={50} />);
    await screen.findAllByRole('option');
    expect(screen.getAllByRole('option')).toHaveLength(50);
    expect(screen.getByText('Showing 50 of 120')).toBeInTheDocument();
  });

  it('reads Mostrando 50 de 120 in Spanish, and keeps the results count when nothing is cut', async () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ id: `cmd-${i}`, label: `Command ${i}` }));
    const { rerender } = render(
      <I18nProvider locale="es">
        <CommandPalette defaultOpen groups={[{ label: 'All', items: many }]} limit={50} />
      </I18nProvider>,
    );
    expect(await screen.findByText('Mostrando 50 de 120')).toBeInTheDocument();
    rerender(
      <I18nProvider locale="es">
        <CommandPalette defaultOpen groups={[{ label: 'All', items: many }]} limit={500} />
      </I18nProvider>,
    );
    expect(await screen.findByText('120 resultados')).toBeInTheDocument();
  });

  it('renderItem content sits inside the option, which keeps data-highlighted and runs on Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CommandPalette
        defaultOpen
        groups={[
          {
            label: 'Runs',
            items: [
              { id: 'a', label: 'Alpha' },
              { id: 'b', label: 'Beta', onSelect },
            ],
          },
        ]}
        renderItem={(item) => (
          <span>
            {item.label} <em>status: ok</em>
          </span>
        )}
      />,
    );
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveTextContent('Beta status: ok');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(options[1]).toHaveAttribute('data-highlighted'));
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('CommandPalette store', () => {
  beforeEach(() => vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel'));
  afterEach(() => vi.restoreAllMocks());

  it('store.open() from an outside button opens it with an empty query and focus in the input', async () => {
    const user = userEvent.setup();
    const store = createCommandPaletteStore();
    const onOpenChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <>
        <button onClick={store.open}>Open from outside</button>
        <CommandPalette
          groups={[{ label: 'G', items: [{ id: 'a', label: 'Alpha' }] }]}
          store={store}
          onOpenChange={onOpenChange}
          onQueryChange={onQueryChange}
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open from outside' }));
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue('');
    expect(store.isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(onQueryChange).toHaveBeenLastCalledWith('');
  });

  it('the shortcut, store.close() and Escape update the store and fire onOpenChange each time', async () => {
    const user = userEvent.setup();
    const store = createCommandPaletteStore();
    const onOpenChange = vi.fn();
    render(<CommandPalette groups={[]} store={store} onOpenChange={onOpenChange} />);
    act(() => store.open());
    await screen.findByRole('dialog');
    await user.keyboard('{Meta>}k{/Meta}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(store.isOpen()).toBe(false);
    await user.keyboard('{Meta>}k{/Meta}');
    await screen.findByRole('dialog');
    expect(store.isOpen()).toBe(true);
    act(() => store.close());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    act(() => store.toggle());
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(store.isOpen()).toBe(false));
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false, true, false, true, false]);
  });

  it('the trigger goes through the store', async () => {
    const user = userEvent.setup();
    const store = createCommandPaletteStore();
    render(
      <CommandPalette groups={[]} store={store}>
        <CommandPaletteTrigger />
      </CommandPalette>,
    );
    await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
    await screen.findByRole('dialog');
    expect(store.isOpen()).toBe(true);
  });

  it('the store wins over `open` and a development warning flags both', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createCommandPaletteStore();
    render(<CommandPalette groups={[]} store={store} open />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('both `store` and `open`'));
  });

  it('does not warn when only the store is set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<CommandPalette groups={[]} store={createCommandPaletteStore()} />);
    expect(warn).not.toHaveBeenCalled();
  });
});
