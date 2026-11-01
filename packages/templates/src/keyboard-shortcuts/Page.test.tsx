import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import KeyboardShortcutsPage, { KeyboardShortcutsDialog } from './Page';
import { filterShortcuts, shortcutGroups, type ShortcutGroup } from './data';
import { ShortcutSheet } from './ShortcutSheet';

describe('platform shortcut hints', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows Ctrl on Linux and finds the command palette by ctrl k', async () => {
    vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
    render(<ShortcutSheet groups={shortcutGroups} />);
    const row = screen.getByText('Open the command palette').closest('li');
    expect(row).not.toBeNull();
    expect(within(row!).getByText('Ctrl')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox'), 'ctrl k');
    expect(screen.getByText('Open the command palette')).toBeInTheDocument();
    expect(screen.getByText('1 shortcut')).toBeInTheDocument();
  });

  it('matches platform modifier spellings without changing legacy callers', () => {
    const ids = (groups: ShortcutGroup[]) => groups.flatMap((group) => group.shortcuts.map((shortcut) => shortcut.id));
    expect(ids(filterShortcuts(shortcutGroups, 'CtRl k', 'en', 'linux'))).toEqual(['palette']);
    expect(ids(filterShortcuts(shortcutGroups, '⌘ k', 'en', 'macos'))).toEqual(['palette']);
    expect(ids(filterShortcuts(shortcutGroups, '⌘ k', 'en'))).toEqual(['palette']);
    const legacy: ShortcutGroup[] = [
      {
        id: 'legacy',
        title: 'Legacy',
        shortcuts: [
          { id: 'literal', description: 'Explicit shortcut', keys: ['⌘', 'K'] },
          { id: 'sequence', description: 'Sequence', keys: ['G'], then: ['P'] },
        ],
      },
    ];
    expect(ids(filterShortcuts(legacy, '⌘ k', 'es'))).toEqual(['literal']);
    expect(filterShortcuts(legacy, 'ctrl k', 'es')).toEqual([]);
    expect(ids(filterShortcuts(legacy, 'g p'))).toEqual(['sequence']);
    expect(filterShortcuts(legacy, 'legacy')).toEqual(legacy);
    expect(filterShortcuts(legacy, ' ')).toEqual(legacy);
  });
});

describe('KeyboardShortcutsPage', () => {
  it.each(['dark', 'light', 'high_contrast'])(
    'opens help and focuses search without intercepting typing in %s',
    async (theme) => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      render(<KeyboardShortcutsPage />);
      fireEvent.keyDown(document.body, { key: '/' });
      expect(screen.getByRole('searchbox', { name: 'Search shortcuts' })).toHaveFocus();
      screen.getByRole('searchbox').blur();
      fireEvent.keyDown(document.body, { key: '?', shiftKey: true });
      const dialog = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
      const search = within(dialog).getByRole('searchbox', { name: 'Search shortcuts' });
      await user.type(search, '?');
      expect(search).toHaveValue('?');
      expect(dialog).toBeInTheDocument();
      const close = within(dialog).getByRole('button', { name: 'Close' });
      close.focus();
      fireEvent.keyDown(close, { key: '/' });
      expect(search).toHaveFocus();
      await expectNoAxeViolations();
    },
  );
  it('renders the console page with every group', { timeout: 15000 }, async () => {
    render(<KeyboardShortcutsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Keyboard shortcuts' })).toBeInTheDocument();
    for (const g of shortcutGroups)
      expect(screen.getByRole('heading', { level: 2, name: g.title })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('filters by description and shows an empty state', { timeout: 15000 }, async () => {
    render(<KeyboardShortcutsPage />);
    const search = screen.getByRole('searchbox', { name: 'Search shortcuts' });
    await userEvent.type(search, 'save');
    expect(screen.getByText('1 shortcut')).toBeInTheDocument();
    const editing = screen.getByRole('region', { name: 'Editing' });
    expect(within(editing).getByText('Save changes')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Navigation' })).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByRole('heading', { name: 'No shortcuts match' })).toBeInTheDocument();
  });

  it('filterShortcuts matches an exact key', () => {
    const groups = filterShortcuts(shortcutGroups, '?');
    expect(groups.flatMap((g) => g.shortcuts.map((s) => s.id))).toEqual(['help']);
  });
});

describe('KeyboardShortcutsDialog', () => {
  it('opens from its trigger with the searchable sheet', { timeout: 15000 }, async () => {
    render(<KeyboardShortcutsDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    const dialog = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
    expect(within(dialog).getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
    expect(within(dialog).getByRole('searchbox', { name: 'Search shortcuts' })).toHaveFocus();
    await expectNoAxeViolations();
  });
});
