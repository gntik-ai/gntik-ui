import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldLabel } from '../Field';
import { MultiSelect } from './MultiSelect';
import MultiSelectBasic from './examples/MultiSelectBasic';
import MultiSelectField from './examples/MultiSelectField';

const options = ['Alpha', 'Beta', 'Gamma', 'Delta'].map((l) => ({ value: l.toLowerCase(), label: l }));
const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

function setup(props: Partial<Parameters<typeof MultiSelect>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<MultiSelect label="Teams" options={options} onValueChange={onValueChange} {...props} />);
  return { user, onValueChange, input: screen.getByRole('combobox', { name: 'Teams' }) };
}

describe('MultiSelect', () => {
  it('typing filters the options (and hides Select all)', async () => {
    const { user, input } = setup();
    await user.click(input);
    expect(await screen.findAllByRole('option')).toHaveLength(5);
    await user.keyboard('ta');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Beta', 'Delta']));
  });

  it('Enter toggles the highlighted option', async () => {
    const { user, input, onValueChange } = setup();
    await user.type(input, 'gam');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Gamma'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['gamma']);
    expect(screen.getByRole('button', { name: 'Remove Gamma' })).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Gamma'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('Escape closes the popup and keeps focus in the input', async () => {
    const { user, input } = setup();
    await user.click(input);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });

  it('Select all selects every enabled option, then deselects', async () => {
    const { user, input, onValueChange } = setup({ defaultValue: ['beta'] });
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'Select all' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['beta', 'alpha', 'gamma', 'delta']);
    await user.click(await screen.findByRole('option', { name: 'Deselect all' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('collapses extra chips into +N and clears everything', async () => {
    const { user, onValueChange } = setup({ defaultValue: ['alpha', 'beta', 'gamma', 'delta'], maxVisibleChips: 2 });
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(2);
    expect(screen.getByText('+2')).toHaveTextContent('+2 more selected');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText(/more selected/)).not.toBeInTheDocument();
  });

  it('Backspace on an empty input removes the last chip', async () => {
    const { user, input } = setup({ defaultValue: ['alpha', 'beta'] });
    await user.click(input);
    await user.keyboard('{Escape}{Backspace}');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeInTheDocument();
  });

  it('takes its name from a Field label', () => {
    render(
      <Field>
        <FieldLabel>Projects</FieldLabel>
        <MultiSelect options={options} />
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Projects' })).toBeInTheDocument();
  });

  it.each([
    ['MultiSelectBasic', MultiSelectBasic, 'Deployment regions'],
    ['MultiSelectField', MultiSelectField, 'Projects'],
  ] as const)('%s has no axe violations, closed and open', async (_n, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name }));
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getAllByRole('option').length).toBeGreaterThan(0);
    await expectNoAxeViolations();
  });
});

it('windows 5000 options while Select all selects the full enabled data set', async () => {
  const options = Array.from({ length: 5000 }, (_, i) => ({ value: `node-${i + 1}`, label: `Node ${i + 1}` }));
  const { user, input, onValueChange } = setup({ options, virtualized: true, itemHeight: 32 });
  await user.click(input);
  const list = await screen.findByRole('listbox');
  const rows = within(list).getAllByRole('option');
  expect(rows.length).toBeLessThanOrEqual(20);
  expect(rows[0]).toHaveTextContent('Select all');
  expect(rows[0]).toHaveAttribute('aria-posinset', '1');
  expect(rows[0]).toHaveAttribute('aria-setsize', '5001');
  await user.click(rows[0]!);
  expect(onValueChange).toHaveBeenLastCalledWith(options.map((option) => option.value));
  expect(within(list).getAllByRole('option').length).toBeLessThanOrEqual(20);
});

it('navigates Home, End and pages across virtualized options including Select all', async () => {
  const options = Array.from({ length: 5000 }, (_, i) => ({ value: `node-${i + 1}`, label: `Node ${i + 1}` }));
  const { user, input } = setup({ options, virtualized: true, itemHeight: 32 });
  await user.click(input);
  const list = await screen.findByRole('listbox');
  const expectActive = (name: string, position: number) => {
    const option = within(list).getByRole('option', { name });
    expect(option).toHaveAttribute('data-highlighted');
    expect(option).toHaveAttribute('aria-posinset', String(position));
    expect(input).toHaveAttribute('aria-activedescendant', option.id);
    expect(within(list).getAllByRole('option').length).toBeLessThanOrEqual(20);
  };
  await user.keyboard('{Home}');
  expectActive('Select all', 1);
  await user.keyboard('{PageDown}');
  expectActive('Node 7', 8);
  expect(list.scrollTop).toBe(0);
  await user.keyboard('{End}');
  expectActive('Node 5000', 5001);
  expect(list.scrollTop).toBe(159776);
  await user.keyboard('{PageUp}');
  expectActive('Node 4993', 4994);
  await user.keyboard('{Home}');
  expectActive('Select all', 1);
  expect(list.scrollTop).toBe(0);
});
