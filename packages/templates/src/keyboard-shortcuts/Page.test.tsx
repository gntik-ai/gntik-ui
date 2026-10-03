import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import KeyboardShortcutsPage, { KeyboardShortcutsDialog } from './Page';
import { filterShortcuts, shortcutGroups } from './data';

describe('KeyboardShortcutsPage', () => {
  it('renders the console page with every group', { timeout: 15000 }, async () => {
    render(<KeyboardShortcutsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Keyboard shortcuts' })).toBeInTheDocument();
    for (const g of shortcutGroups) expect(screen.getByRole('heading', { level: 2, name: g.title })).toBeInTheDocument();
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
