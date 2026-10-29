import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Globe } from 'lucide-react';
import { Button } from '../Button';
import { I18nProvider } from '../../i18n/I18nProvider';
import { SearchableSelect } from './SearchableSelect';

const options = [
  { value: 'eu-west-1', label: 'Zürich', icon: Globe },
  { value: 'zag', label: 'Zagreb' },
  { value: 'lis', label: 'Lisbon' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: `region-${i}`, label: `Region ${i}` })),
];

async function open(key = '{Enter}') {
  const user = userEvent.setup();
  const trigger = screen.getByRole('combobox', { name: 'Region' });
  await user.tab();
  await user.keyboard(key);
  const list = await screen.findByRole('listbox', { name: 'Region' });
  const input = screen.getByRole('combobox', { name: 'Search' });
  await waitFor(() => expect(input).toHaveFocus());
  return { user, trigger, list, input };
}

it.each(['{Enter}', ' ', '{ArrowDown}'])('opens with %s, names the list, and marks the current option', async (key) => {
  render(<SearchableSelect options={options} label="Region" defaultValue="eu-west-1" />);
  const { trigger } = await open(key);
  expect(screen.getAllByRole('option')).toHaveLength(13);
  expect(screen.getByRole('option', { name: 'Zürich' })).toHaveAttribute('aria-selected', 'true');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

it('selects once, closes, restores focus, and displays the selected label and icon', async () => {
  const changed = vi.fn();
  render(<SearchableSelect options={options} label="Region" onValueChange={changed} />);
  const { user, trigger } = await open();
  await user.keyboard('{ArrowDown}{Enter}');
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(changed).toHaveBeenCalledExactlyOnceWith('eu-west-1');
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent('Zürich');
  expect(trigger.querySelector('svg.lucide-globe')).toHaveAttribute('aria-hidden', 'true');
});

it('matches labels, descriptions and keywords without accents, hides empty groups, and announces no matches', async () => {
  const searched = vi.fn();
  render(
    <SearchableSelect
      label="Region"
      options={[
        { label: 'Europe', options: options.slice(0, 2) },
        { label: 'Atlantic', options: [{ ...options[2]!, description: 'Portugal', keywords: ['coast'] }] },
      ]}
      onSearchChange={searched}
    />,
  );
  const { user, input } = await open();
  await user.keyboard('zur');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option', { name: 'Zürich' })).toBeInTheDocument();
  expect(screen.queryByText('Atlantic')).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Zagreb' })).not.toBeInTheDocument();
  expect(searched.mock.calls.map(([query]) => query)).toEqual(['z', 'zu', 'zur']);
  for (const query of ['port', 'coast']) {
    await user.clear(input);
    await user.type(input, query);
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Lisbon/ })).toBeInTheDocument();
    expect(screen.queryByText('Europe')).not.toBeInTheDocument();
  }
  await user.clear(input);
  await user.type(input, 'qqq');
  expect(screen.getByText('No matches.')).toBeInTheDocument();
  expect(screen.queryAllByRole('option')).toHaveLength(0);
  expect(input).toHaveFocus();
});

it('a custom filter replaces matching; Escape discards the search and keeps the selection', async () => {
  const changed = vi.fn();
  render(
    <SearchableSelect
      label="Region"
      options={options}
      defaultValue="lis"
      onValueChange={changed}
      filter={(option, query) => query === '' || option.value === 'zag'}
    />,
  );
  const { user, trigger } = await open();
  await user.keyboard('zur');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option', { name: 'Zagreb' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(changed).not.toHaveBeenCalled();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent('Lisbon');
  await user.keyboard('{Enter}');
  expect(await screen.findAllByRole('option')).toHaveLength(13);
});

it.each([
  ['en', '2 selected'],
  ['es', '2 seleccionados'],
])('toggles multiple values and keeps the query in %s', async (locale, count) => {
  const changed = vi.fn();
  render(
    <I18nProvider locale={locale}>
      <SearchableSelect multiple label="Region" options={options} onValueChange={changed} />
    </I18nProvider>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole('combobox', { name: 'Region' });
  await user.click(trigger);
  const input = await screen.findByRole('combobox', { name: locale === 'es' ? 'Buscar' : 'Search' });
  await user.type(input, 'z');
  await user.keyboard('{Enter}');
  expect(changed).toHaveBeenLastCalledWith(['eu-west-1']);
  expect(input).toHaveValue('z');
  expect(screen.getByRole('option', { name: 'Zürich' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('option', { name: 'Zürich' }).querySelector('svg.lucide-check')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await user.keyboard('{ArrowDown}{Enter}');
  expect(changed).toHaveBeenLastCalledWith(['eu-west-1', 'zag']);
  expect(trigger).toHaveTextContent(count);
  expect(input).toHaveValue('z');
  await user.keyboard('{Enter}');
  expect(changed).toHaveBeenLastCalledWith(['eu-west-1']);
  expect(screen.getByRole('option', { name: 'Zagreb' })).toHaveAttribute('aria-selected', 'false');
  expect(screen.getByRole('listbox')).toBeInTheDocument();
});

it.each([false, true])(
  'actions survive a query and never enter the value or submitted form (multiple=%s)',
  async (multiple) => {
    const selected = vi.fn();
    const changed = vi.fn();
    const { container } = render(
      <form>
        <SearchableSelect
          multiple={multiple}
          name="region"
          label="Region"
          options={options}
          onValueChange={changed}
          actions={[{ id: 'manage', label: 'Manage labels…', onSelect: selected }]}
        />
      </form>,
    );
    const { user, trigger } = await open();
    await user.keyboard('zzz');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Manage labels…' })).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(selected).toHaveBeenCalledTimes(1);
    expect(changed).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(new FormData(container.querySelector('form')!).getAll('region')).toEqual([]);
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Manage labels…' }));
    expect(selected).toHaveBeenCalledTimes(2);
    expect(changed).not.toHaveBeenCalled();
  },
);

it('submits single, multiple and empty selections through native FormData', async () => {
  const { container } = render(
    <form>
      <SearchableSelect name="region" label="Single" options={options} defaultValue="eu-west-1" required />
      <SearchableSelect
        name="regions"
        label="Multiple"
        options={options}
        multiple
        defaultValue={['eu-west-1', 'lis']}
      />
      <SearchableSelect name="empty" label="Empty" options={options} />
      <SearchableSelect name="emptyMulti" label="Empty multiple" options={options} multiple />
    </form>,
  );
  expect([...new FormData(container.querySelector('form')!).entries()]).toEqual([
    ['region', 'eu-west-1'],
    ['regions', 'eu-west-1'],
    ['regions', 'lis'],
  ]);
});

it.each(['{Enter}', ' ', '{ArrowDown}'])('custom kit button retains its styling and opens with %s', async (key) => {
  render(
    <SearchableSelect
      options={options}
      aria-label="Status"
      trigger={
        <Button variant="secondary" size="sm">
          Status
        </Button>
      }
    />,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole('combobox', { name: 'Status' });
  expect(trigger.tagName).toBe('BUTTON');
  expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveTextContent('Status');
  expect(trigger).toHaveClass('h-8');
  await user.tab();
  await user.keyboard(key);
  await screen.findByRole('listbox', { name: 'Status' });
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Search' })).toHaveFocus());
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

it('disabled options cannot be selected by click or keyboard', async () => {
  const changed = vi.fn();
  render(
    <SearchableSelect
      label="Region"
      options={[{ value: 'off', label: 'Unavailable', disabled: true }]}
      onValueChange={changed}
    />,
  );
  const { user } = await open();
  const option = screen.getByRole('option', { name: 'Unavailable' });
  expect(option).toHaveAttribute('aria-disabled', 'true');
  await user.click(option);
  await user.keyboard('{ArrowDown}{Enter}');
  expect(changed).not.toHaveBeenCalled();
});

it.each(['disabled', 'readOnly'] as const)('%s prevents editing', async (state) => {
  const changed = vi.fn();
  render(<SearchableSelect label="Region" options={options} {...{ [state]: true }} onValueChange={changed} />);
  const user = userEvent.setup();
  const trigger = screen.getByRole('combobox', { name: 'Region' });
  expect(trigger).toHaveAttribute(state === 'disabled' ? 'data-disabled' : 'data-readonly');
  await user.click(trigger);
  await user.keyboard('{Enter}{ArrowDown}');
  if (state === 'disabled') expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  else {
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
  }
  expect(changed).not.toHaveBeenCalled();
});

it('windows 5,000 options, keeps option 80 rendered and scrolls as the highlight moves', async () => {
  render(
    <SearchableSelect
      label="Region"
      options={Array.from({ length: 5000 }, (_, index) => ({ value: index, label: `Option ${index + 1}` }))}
      virtualized
      itemHeight={32}
      overscan={4}
    />,
  );
  const { user, list, input } = await open();
  expect(screen.getAllByRole('option').length).toBeLessThan(60);
  expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('aria-posinset', '1');
  expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('aria-setsize', '5000');
  await user.keyboard('{ArrowDown>80/}');
  const option = screen.getByRole('option', { name: 'Option 80' });
  expect(option).toHaveAttribute('data-highlighted');
  expect(input).toHaveAttribute('aria-activedescendant', option.id);
  expect(list.scrollTop).toBeGreaterThanOrEqual(2304);
  expect(list.scrollTop).toBeLessThanOrEqual(2528);
  expect(screen.getAllByRole('option').length).toBeLessThan(60);
  await user.keyboard('{End}');
  expect(screen.getByRole('option', { name: 'Option 5000' })).toHaveAttribute('data-highlighted');
  await user.keyboard('{Home}');
  expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('data-highlighted');
  await user.keyboard('{PageDown}');
  expect(screen.getByRole('option', { name: 'Option 8' })).toHaveAttribute('data-highlighted');
  await user.keyboard('{PageUp}');
  expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('data-highlighted');
  await user.keyboard('{ArrowDown}{ArrowUp}');
  expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('data-highlighted');
});

it('supports object keys and controlled values without depending on object identity', async () => {
  const changed = vi.fn();
  const objectOptions = options.slice(0, 2).map((option) => ({ ...option, value: { id: option.value } }));
  const { rerender, container } = render(
    <form>
      <SearchableSelect
        label="Region"
        options={objectOptions}
        value={{ id: 'eu-west-1' }}
        getOptionKey={(value) => value.id}
        name="region"
        onValueChange={changed}
      />
    </form>,
  );
  const { user, trigger } = await open();
  expect(screen.getByRole('option', { name: 'Zürich' })).toHaveAttribute('aria-selected', 'true');
  await user.click(screen.getByRole('option', { name: 'Zagreb' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith({ id: 'zag' });
  expect(trigger).toHaveTextContent('Zürich');
  rerender(
    <form>
      <SearchableSelect
        label="Region"
        options={objectOptions}
        value={{ id: 'zag' }}
        getOptionKey={(value) => value.id}
        name="region"
        onValueChange={changed}
      />
    </form>,
  );
  expect(trigger).toHaveTextContent('Zagreb');
  expect(new FormData(container.querySelector('form')!).getAll('region')).toEqual(['zag']);
});

it('mixes ungrouped options, groups and action rows without inventing labels or windowing groups', async () => {
  const action = vi.fn();
  render(
    <SearchableSelect
      label="Region"
      virtualized
      options={[options[0]!, { label: 'Atlantic', options: [options[2]!] }]}
      actions={[{ id: 'manage', label: 'Manage', onSelect: action }]}
    />,
  );
  const { user, list, input } = await open();
  expect(list).not.toHaveAttribute('data-virtualized');
  expect(screen.queryByText('0')).not.toBeInTheDocument();
  await user.type(input, 'zzz');
  expect(screen.queryByText('Atlantic')).not.toBeInTheDocument();
  expect(screen.getAllByRole('option')).toHaveLength(1);
  await user.keyboard('{Enter}');
  expect(action).toHaveBeenCalledTimes(1);
});

it('uses the Spanish empty message', async () => {
  render(
    <I18nProvider locale="es">
      <SearchableSelect label="Region" options={options} />
    </I18nProvider>,
  );
  const user = userEvent.setup();
  await user.tab();
  await user.keyboard('{Enter}');
  await user.type(await screen.findByRole('combobox', { name: 'Buscar' }), 'qqq');
  expect(screen.getByText('Sin coincidencias.')).toBeInTheDocument();
  expect(screen.queryAllByRole('option')).toHaveLength(0);
});
