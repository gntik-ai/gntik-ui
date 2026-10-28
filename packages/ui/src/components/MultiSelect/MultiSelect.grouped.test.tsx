import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from './MultiSelect';

const options = [
  { value: 'all', label: 'All regions' },
  { value: 'madrid', label: 'Madrid', group: 'Europe' },
  { value: 'toronto', label: 'Toronto', group: 'Americas' },
  { value: 'paris', label: 'Paris', group: 'Europe' },
];

it('puts ungrouped options before first-seen groups, and filters away empty headings', async () => {
  const user = userEvent.setup();
  render(<MultiSelect label="Cities" options={options} />);
  const input = screen.getByRole('combobox', { name: 'Cities' });
  await user.click(input);
  const list = await screen.findByRole('listbox');
  expect(
    within(list)
      .getAllByRole('option')
      .map((o) => o.textContent),
  ).toEqual(['Select all', 'All regions', 'Madrid', 'Paris', 'Toronto']);
  expect(
    within(list)
      .getAllByRole('group')
      .map((g) => g.textContent),
  ).toEqual(['EuropeMadridParis', 'AmericasToronto']);
  expect(
    within(screen.getByRole('group', { name: 'Europe' }))
      .getAllByRole('option')
      .map((o) => o.textContent),
  ).toEqual(['Madrid', 'Paris']);
  expect(screen.getByRole('option', { name: 'Select all' }).closest('[role="group"]')).toBeNull();
  expect(screen.getByRole('option', { name: 'All regions' }).closest('[role="group"]')).toBeNull();
  await user.type(input, 'par');
  expect(
    within(list)
      .getAllByRole('option')
      .map((o) => o.textContent),
  ).toEqual(['Paris']);
  expect(screen.queryByText('Americas')).not.toBeInTheDocument();
  await user.clear(input);
  await user.type(input, 'zzz');
  expect(screen.getByText('No matches.')).toBeInTheDocument();
  expect(within(list).queryAllByRole('group')).toHaveLength(0);
  expect(screen.queryByText('Europe')).not.toBeInTheDocument();
});

it('Select all selects and clears enabled options across every group, skipping disabled options', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <MultiSelect
      label="Cities"
      options={[...options, { value: 'lima', label: 'Lima', group: 'Americas', disabled: true }]}
      onValueChange={onValueChange}
      virtualized
    />,
  );
  await user.click(screen.getByRole('combobox', { name: 'Cities' }));
  expect(screen.getByRole('listbox')).not.toHaveAttribute('data-virtualized');
  expect(screen.getByRole('option', { name: 'Lima' })).toHaveAttribute('aria-disabled', 'true');
  await user.click(await screen.findByRole('option', { name: 'Select all' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['all', 'madrid', 'toronto', 'paris']);
  expect(screen.queryByRole('button', { name: 'Remove Lima' })).not.toBeInTheDocument();
  await user.click(await screen.findByRole('option', { name: 'Deselect all' }));
  expect(onValueChange).toHaveBeenLastCalledWith([]);
});

it('leaves the flat list DOM without group wrappers', async () => {
  const user = userEvent.setup();
  render(
    <MultiSelect
      label="Cities"
      options={[
        { value: 'madrid', label: 'Madrid' },
        { value: 'paris', label: 'Paris' },
      ]}
    />,
  );
  await user.click(screen.getByRole('combobox', { name: 'Cities' }));
  const list = await screen.findByRole('listbox');
  expect(Array.from(list.children).map((el) => el.getAttribute('role'))).toEqual(['option', 'option', 'option']);
  expect(
    within(list)
      .getAllByRole('option')
      .map((o) => o.textContent),
  ).toEqual(['Select all', 'Madrid', 'Paris']);
});

it('keeps a grouped creatable row outside groups after matching options', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn((label: string) => ({ value: label, label }));
  render(<MultiSelect label="Cities" options={options} onCreate={onCreate} />);
  const input = screen.getByRole('combobox', { name: 'Cities' });
  await user.type(input, 'paris');
  expect(await screen.findByRole('option', { name: 'Paris' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
  await user.clear(input);
  await user.type(input, 'a');
  const partial = await screen.findByRole('option', { name: 'Create “a”' });
  expect(partial.closest('[role="group"]')).toBeNull();
  expect(screen.getAllByRole('option').at(-1)).toBe(partial);
  await user.clear(input);
  await user.type(input, 'Lisbon');
  await user.click(await screen.findByRole('option', { name: 'Create “Lisbon”' }));
  expect(onCreate).toHaveBeenCalledWith('Lisbon');
  expect(await screen.findByRole('button', { name: 'Remove Lisbon' })).toBeInTheDocument();
});

it('keeps focus and the typed query when grouped async results disable windowing', async () => {
  const user = userEvent.setup();
  let resolve!: (result: typeof options) => void;
  const pending = new Promise<typeof options>((done) => {
    resolve = done;
  });
  render(<MultiSelect label="Cities" options={[]} virtualized loadOptions={() => pending} debounceMs={0} />);
  const input = screen.getByRole('combobox', { name: 'Cities' });
  await user.type(input, 'par');
  await act(async () => resolve(options));
  expect(await screen.findByRole('group', { name: 'Europe' })).toBeInTheDocument();
  expect(input).toBeInTheDocument();
  expect(input).toHaveFocus();
  expect(input).toHaveValue('par');
  expect(screen.getByRole('listbox')).not.toHaveAttribute('data-virtualized');
});
