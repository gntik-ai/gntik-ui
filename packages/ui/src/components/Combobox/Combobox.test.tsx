import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from './Combobox';
import ComboboxBasic from './examples/ComboboxBasic';
import ComboboxMembers from './examples/ComboboxMembers';
import ComboboxMultiple from './examples/ComboboxMultiple';

const fruits = ['Apple', 'Apricot', 'Banana', 'Cherry'];

function setup(onValueChange = vi.fn()) {
  const user = userEvent.setup();
  render(
    <Combobox items={fruits} onValueChange={onValueChange}>
      <ComboboxInput label="Fruit" placeholder="Search…" />
      <ComboboxContent emptyText="Nothing found.">
        {(f: string) => (
          <ComboboxItem key={f} value={f}>
            {f}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  return { user, input: screen.getByRole('combobox', { name: 'Fruit' }), onValueChange };
}

const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

describe('Combobox', () => {
  it('filters the options while typing', async () => {
    const { user, input } = setup();
    await user.click(input);
    expect(await screen.findAllByRole('option')).toHaveLength(4);
    await user.keyboard('ap');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the empty state when nothing matches', async () => {
    const { user, input } = setup();
    await user.type(input, 'zzz');
    expect(await screen.findByText('Nothing found.')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('moves the highlight with ArrowDown / ArrowUp', async () => {
    const { user, input } = setup();
    await user.click(input);
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apple'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apricot'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apple'));
  });

  it('selects the highlighted option with Enter', async () => {
    const { user, input, onValueChange } = setup();
    await user.type(input, 'ban');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Banana'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Banana', expect.anything());
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveValue('Banana');
  });

  it('closes on Escape and keeps focus in the input', async () => {
    const { user, input } = setup();
    await user.click(input);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });

  it('multi-select: Enter adds a chip, remove button and Backspace remove chips', async () => {
    const user = userEvent.setup();
    render(<ComboboxMultiple />);
    const input = screen.getByRole('combobox', { name: 'Role permissions' });
    expect(screen.getByRole('button', { name: 'Remove Read projects' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Run deployments' })).toBeInTheDocument();

    await user.type(input, 'billing');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('View billing'));
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('button', { name: 'Remove View billing' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Read projects' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Read projects' })).not.toBeInTheDocument());

    await user.click(input);
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
    await user.keyboard('{Backspace}');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove View billing' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remove Run deployments' })).toBeInTheDocument();
  });

  it('marks the selected option in a rich list', async () => {
    const user = userEvent.setup();
    render(<ComboboxMembers />);
    const input = screen.getByRole('combobox', { name: 'On-call owner' });
    expect(input).toHaveValue('Mara Vidal');
    await user.click(screen.getByRole('button', { name: 'Show options' }));
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByRole('option', { name: /Mara Vidal/ })).toHaveAttribute('aria-selected', 'true');
  });

  it.each([
    ['ComboboxBasic', ComboboxBasic, 'Function runtime'],
    ['ComboboxMembers', ComboboxMembers, 'On-call owner'],
    ['ComboboxMultiple', ComboboxMultiple, 'Role permissions'],
  ] as const)('%s has no axe violations, closed and open', async (_n, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name }));
    await screen.findByRole('listbox');
    await expectNoAxeViolations();
  });
});
