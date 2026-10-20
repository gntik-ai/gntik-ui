import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { TransferList } from './TransferList';
import TransferListColumns from './examples/TransferListColumns';
import TransferListScopes from './examples/TransferListScopes';

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta'].map((l) => ({ value: l.toLowerCase(), label: l }));

function setup(props: Partial<Parameters<typeof TransferList>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn<(v: string[]) => void>();
  render(<TransferList items={items} defaultValue={['delta']} onValueChange={onValueChange} {...props} />);
  const available = screen.getByRole('listbox', { name: 'Available' });
  const selected = screen.getByRole('listbox', { name: 'Selected' });
  const names = (lb: HTMLElement) =>
    within(lb)
      .queryAllByRole('option')
      .map((o) => o.textContent);
  const active = (lb: HTMLElement) =>
    document.getElementById(lb.getAttribute('aria-activedescendant') ?? '')?.textContent;
  return { user, onValueChange, available, selected, names, active };
}

describe('TransferList', () => {
  it('splits items into available and selected (in value order)', () => {
    const { available, selected, names } = setup();
    expect(available).toHaveAttribute('aria-multiselectable', 'true');
    expect(names(available)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(names(selected)).toEqual(['Delta']);
  });

  it('arrows / Home / End move the active option; Space checks; Enter moves', async () => {
    const { user, available, selected, names, active, onValueChange } = setup();
    available.focus();
    expect(active(available)).toBe('Alpha');
    await user.keyboard('{ArrowDown}');
    expect(active(available)).toBe('Bravo');
    await user.keyboard('{End}');
    expect(active(available)).toBe('Charlie');
    await user.keyboard('{Home} ');
    expect(within(available).getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown} {Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['delta', 'alpha', 'bravo']);
    expect(names(selected)).toEqual(['Delta', 'Alpha', 'Bravo']);
    expect(screen.getByRole('status')).toHaveTextContent('Added 2 items.');
  });

  it('Enter with nothing checked moves the active option', async () => {
    const { user, selected, onValueChange } = setup();
    selected.focus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('Shift+Arrow extends and Ctrl+A checks all', async () => {
    const { user, available } = setup();
    available.focus();
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(within(available).getAllByRole('option', { selected: true })).toHaveLength(1);
    await user.keyboard('{Control>}a{/Control}');
    expect(within(available).getAllByRole('option', { selected: true })).toHaveLength(3);
    await user.keyboard('{Control>}a{/Control}');
    expect(within(available).queryAllByRole('option', { selected: true })).toHaveLength(0);
  });

  it('middle buttons move checked items and everything', async () => {
    const { user, available, onValueChange } = setup();
    expect(screen.getByRole('button', { name: 'Add checked' })).toBeDisabled();
    await user.click(within(available).getByRole('option', { name: 'Charlie' }));
    await user.click(screen.getByRole('button', { name: 'Add checked' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['delta', 'charlie']);
    await user.click(screen.getByRole('button', { name: 'Remove all' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    await user.click(screen.getByRole('button', { name: 'Add all' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['alpha', 'bravo', 'charlie', 'delta']);
  });

  it('Alt+ArrowUp / Alt+ArrowDown reorder the selected list', async () => {
    const { user, selected, names, onValueChange } = setup({ defaultValue: ['alpha', 'bravo', 'charlie'] });
    selected.focus();
    await user.keyboard('{End}{Alt>}{ArrowUp}{/Alt}');
    expect(onValueChange).toHaveBeenLastCalledWith(['alpha', 'charlie', 'bravo']);
    expect(names(selected)).toEqual(['Alpha', 'Charlie', 'Bravo']);
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(onValueChange).toHaveBeenLastCalledWith(['alpha', 'bravo', 'charlie']);
  });

  it('search filters a list', async () => {
    const { user, available, names } = setup();
    await user.type(screen.getByRole('searchbox', { name: 'Search available' }), 'ch');
    expect(names(available)).toEqual(['Charlie']);
    await user.type(screen.getByRole('searchbox', { name: 'Search available' }), 'zz');
    expect(within(available.parentElement as HTMLElement).getByText('No matches.')).toBeInTheDocument();
  });

  it('examples have no axe violations (including an empty list)', async () => {
    render(
      <>
        <TransferListColumns />
        <TransferListScopes />
        <TransferList items={items.slice(0, 1)} defaultValue={['alpha']} />
      </>,
    );
    await expectNoAxeViolations();
  });
});

it('windows both panes while keyboard checks, bulk moves and reordering use every item', async () => {
  const items = Array.from({ length: 2000 }, (_, i) => ({ value: `node-${i + 1}`, label: `Node ${i + 1}` }));
  const { user, available, selected, onValueChange, active } = setup({ items, defaultValue: [], virtualized: true });
  expect(within(available).getAllByRole('option').length).toBeLessThanOrEqual(20);
  expect(within(available).getAllByRole('option')[0]).toHaveAttribute('aria-setsize', '2000');
  available.focus();
  await user.keyboard('{End} ');
  const last = within(available).getByRole('option', { name: 'Node 2000' });
  expect(available).toHaveAttribute('aria-activedescendant', last.id);
  expect(last).toHaveAttribute('aria-selected', 'true');
  expect(last).toHaveAttribute('aria-posinset', '2000');
  expect(available.scrollTop).toBeGreaterThan(0);
  await user.keyboard('{Home}{ArrowDown}');
  expect(active(available)).toBe('Node 2');
  await user.keyboard('{Control>}a{/Control}');
  expect(screen.getByText('2000/2000')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add all' }));
  expect(onValueChange).toHaveBeenLastCalledWith(items.map((item) => item.value));
  expect(within(available).queryAllByRole('option')).toHaveLength(0);
  expect(within(selected).getAllByRole('option').length).toBeLessThanOrEqual(20);
  selected.focus();
  await user.keyboard('{End} {Alt>}{ArrowUp}{/Alt}');
  expect(onValueChange.mock.lastCall?.[0].slice(-2)).toEqual(['node-2000', 'node-1999']);
  expect(active(selected)).toBe('Node 2000');
});

it('finds accented items with an unaccented query', async () => {
  const { user, available } = setup({ items: [{ value: 'function', label: 'Función' }], defaultValue: [] });
  await user.type(screen.getByRole('searchbox', { name: 'Search available' }), 'funcion');
  expect(within(available).getByRole('option', { name: 'Función' })).toBeInTheDocument();
});
