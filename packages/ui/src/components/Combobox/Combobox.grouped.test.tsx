import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxSeparator,
} from './index';

const regions = [
  { value: 'Europe', items: ['Madrid', 'Paris'] },
  { value: 'Americas', items: ['Toronto'] },
];

type Region = (typeof regions)[number];

function RegionRows({ group }: { group: Region }) {
  return (
    <>
      <ComboboxGroup items={group.items}>
        <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
        <ComboboxCollection>
          {(city: string) => (
            <ComboboxItem key={city} value={city}>
              {city}
            </ComboboxItem>
          )}
        </ComboboxCollection>
      </ComboboxGroup>
      <ComboboxSeparator />
    </>
  );
}

it('names groups and navigates across labels and separators, then selects with Enter', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Combobox items={regions} onValueChange={onValueChange}>
      <ComboboxInput label="City" />
      <ComboboxContent>{(group: Region) => <RegionRows key={group.value} group={group} />}</ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.click(input);
  expect(
    within(await screen.findByRole('group', { name: 'Europe' }))
      .getAllByRole('option')
      .map((o) => o.textContent),
  ).toEqual(['Madrid', 'Paris']);
  expect(screen.getByRole('group', { name: 'Americas' })).toHaveTextContent('Toronto');
  await user.keyboard('{ArrowDown}{ArrowDown}');
  const paris = screen.getByRole('option', { name: 'Paris' });
  await waitFor(() => expect(paris).toHaveAttribute('data-highlighted'));
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(screen.getByRole('option', { name: 'Toronto' })).toHaveAttribute('data-highlighted'));
  await user.keyboard('{ArrowUp}');
  expect(paris).toHaveAttribute('data-highlighted');
  await user.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenCalledWith('Paris', expect.anything());
  expect(input).toHaveValue('Paris');
});

it('filters within groups and removes empty groups and their labels', async () => {
  const user = userEvent.setup();
  render(
    <Combobox items={regions}>
      <ComboboxInput label="City" />
      <ComboboxContent emptyText="Nothing found.">
        {(group: Region) => <RegionRows key={group.value} group={group} />}
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.type(input, 'par');
  expect(within(await screen.findByRole('group', { name: 'Europe' })).getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option', { name: 'Paris' })).toBeInTheDocument();
  expect(screen.queryByText('Americas')).not.toBeInTheDocument();
  await user.clear(input);
  await user.type(input, 'zzz');
  expect(await screen.findByText('Nothing found.')).toBeInTheDocument();
  expect(within(screen.getByRole('listbox')).queryAllByRole('group')).toHaveLength(0);
  expect(screen.queryByText('Europe')).not.toBeInTheDocument();
  expect(screen.queryAllByRole('option')).toHaveLength(0);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(input).toHaveFocus();
});

it('creates outside groups after partial matches and suppresses exact matches inside groups', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn((text: string) => text);
  render(
    <Combobox<string> items={regions} onCreate={onCreate}>
      <ComboboxInput label="City" />
      <ComboboxContent>{(group: Region) => <RegionRows key={group.value} group={group} />}</ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.type(input, 'paris');
  expect(await screen.findByRole('option', { name: 'Paris' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
  await user.clear(input);
  await user.type(input, 'a');
  const partial = await screen.findByRole('option', { name: 'Create “a”' });
  expect(partial.closest('[role="group"]')).toBeNull();
  expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Madrid', 'Paris', 'Create “a”']);
  expect(
    screen.getByRole('group', { name: 'Europe' }).compareDocumentPosition(partial) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  await user.clear(input);
  await user.type(input, 'Lisbon');
  const create = await screen.findByRole('option', { name: 'Create “Lisbon”' });
  expect(create.closest('[role="group"]')).toBeNull();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onCreate).toHaveBeenCalledWith('Lisbon');
  await waitFor(() => expect(input).toHaveValue('Lisbon'));
});

it('keeps flat options as direct listbox children', async () => {
  const user = userEvent.setup();
  render(
    <Combobox items={['Madrid', 'Paris']}>
      <ComboboxInput label="City" />
      <ComboboxContent>
        {(city: string) => (
          <ComboboxItem key={city} value={city}>
            {city}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  await user.click(screen.getByRole('combobox', { name: 'City' }));
  const list = await screen.findByRole('listbox');
  expect(Array.from(list.children).map((el) => el.getAttribute('role'))).toEqual(['option', 'option']);
});

it('keeps special rows outside groups when the root collection is composed as static content', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(
    <Combobox<string> items={regions} onCreate={onCreate}>
      <ComboboxInput label="City" />
      <ComboboxContent>
        <ComboboxCollection>{(group: Region) => <RegionRows key={group.value} group={group} />}</ComboboxCollection>
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.type(input, 'a');
  const create = await screen.findByRole('option', { name: 'Create “a”' });
  expect(create.closest('[role="group"]')).toBeNull();
  expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Madrid', 'Paris', 'Create “a”']);
  await user.click(create);
  expect(onCreate).toHaveBeenCalledWith('a');
});
