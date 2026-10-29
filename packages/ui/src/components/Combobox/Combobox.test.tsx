import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxPopupInput,
} from './Combobox';
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

describe('virtualized Combobox', () => {
  it('preserves the option ref and custom styles while positioning windowed rows', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <Combobox items={['node-1']} virtualized>
        <ComboboxInput label="Nodes" />
        <ComboboxContent itemHeight={32}>
          {(item: string) => (
            <ComboboxItem value={item} ref={ref} style={{ fontWeight: 600 }}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Nodes' }));
    const option = await screen.findByRole('option', { name: 'node-1' });
    expect(ref.current).toBe(option);
    expect(option).toHaveStyle({ fontWeight: 600, height: '32px' });
  });

  it('windows the full list and preserves its accessible positions', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 10000 }, (_, i) => `node-${i + 1}`);
    render(
      <Combobox items={items} virtualized>
        <ComboboxInput label="Nodes" />
        <ComboboxContent itemHeight={32}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Nodes' }));
    const list = await screen.findByRole('listbox');
    const options = within(list).getAllByRole('option');
    expect(options.length).toBeLessThanOrEqual(20);
    expect(options[0]).toHaveAttribute('aria-setsize', '10000');
    options.forEach((option, i) => expect(option).toHaveAttribute('aria-posinset', String(i + 1)));
  });
});

it('keeps keyboard highlights mounted and scrolls selection into view on reopen', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const onItemHighlighted = vi.fn();
  const items = Array.from({ length: 10000 }, (_, i) => `node-${i + 1}`);
  render(
    <Combobox items={items} virtualized onValueChange={onValueChange} onItemHighlighted={onItemHighlighted}>
      <ComboboxInput label="Nodes" />
      <ComboboxContent itemHeight={32}>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'Nodes' });
  await user.click(input);
  const list = await screen.findByRole('listbox');
  Object.defineProperty(list, 'clientHeight', { configurable: true, value: 256 });
  await user.keyboard('{ArrowDown}{ArrowDown>50/}');
  const option51 = await screen.findByRole('option', { name: 'node-51' });
  expect(input).toHaveAttribute('aria-activedescendant', option51.id);
  expect(option51).toHaveAttribute('data-highlighted');
  expect(list.scrollTop).toBe(1376);
  onItemHighlighted.mockClear();
  await user.keyboard('{End}');
  const last = await screen.findByRole('option', { name: 'node-10000' });
  expect(input).toHaveAttribute('aria-activedescendant', last.id);
  expect(list.scrollTop).toBe(319744);
  expect(onItemHighlighted).toHaveBeenLastCalledWith('node-10000', expect.objectContaining({ index: 9999 }));
  expect(onItemHighlighted).toHaveBeenCalledTimes(1);
  fireEvent.change(input, { target: { value: 'node-4242' } });
  expect(await screen.findByRole('option', { name: 'node-4242' })).toBeInTheDocument();
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(list.scrollTop).toBe(0);
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onValueChange).toHaveBeenCalledWith('node-4242', expect.anything());
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Show options' }));
  const reopened = await screen.findByRole('listbox');
  const selected = await screen.findByRole('option', { name: 'node-4242' });
  expect(selected).toHaveAttribute('aria-selected', 'true');
  expect(reopened.scrollTop).toBe(135488);
  expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(20);
});

it('keeps the highlight mounted during manual scrolling and supports Home and page navigation', async () => {
  const user = userEvent.setup();
  const onItemHighlighted = vi.fn();
  const items = Array.from({ length: 1000 }, (_, i) => `node-${i + 1}`);
  render(
    <Combobox items={items} virtualized onItemHighlighted={onItemHighlighted}>
      <ComboboxInput label="Nodes" />
      <ComboboxContent itemHeight={32}>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'Nodes' });
  await user.click(input);
  const list = await screen.findByRole('listbox');
  await user.keyboard('{Home}');
  expect(highlighted()).toHaveTextContent('node-1');
  expect(onItemHighlighted).toHaveBeenCalledTimes(1);
  const firstId = highlighted()?.id;
  fireEvent.scroll(list, { target: { scrollTop: 16000 } });
  expect(list.scrollTop).toBe(16000);
  expect(input).toHaveAttribute('aria-activedescendant', firstId);
  expect(document.getElementById(firstId!)).toBeInTheDocument();
  expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(20);
  onItemHighlighted.mockClear();
  await user.keyboard('{PageDown}');
  expect(highlighted()).toHaveTextContent('node-8');
  expect(onItemHighlighted).toHaveBeenCalledTimes(1);
  expect(list.scrollTop).toBe(224);
  onItemHighlighted.mockClear();
  await user.keyboard('{PageUp}');
  expect(highlighted()).toHaveTextContent('node-1');
  expect(onItemHighlighted).toHaveBeenCalledTimes(1);
  expect(list.scrollTop).toBe(0);
  await user.keyboard('{End}');
  onItemHighlighted.mockClear();
  await user.keyboard('{Home}');
  expect(highlighted()).toHaveTextContent('node-1');
  expect(onItemHighlighted).toHaveBeenCalledTimes(1);
});

it('measures variable option rows rather than treating the estimate as a fixed height', async () => {
  const geometry = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 200,
      bottom: this.getAttribute('role') === 'option' ? 64 : 256,
      width: 200,
      height: this.getAttribute('role') === 'option' ? 64 : 256,
      toJSON: () => ({}),
    };
  });
  try {
    const user = userEvent.setup();
    const items = Array.from({ length: 10000 }, (_, i) => `node-${i + 1}`);
    render(
      <Combobox items={items} virtualized>
        <ComboboxInput label="Nodes" />
        <ComboboxContent estimatedItemHeight={32}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Nodes' }));
    const second = await screen.findByRole('option', { name: 'node-2' });
    expect(second).toHaveStyle({ transform: 'translateY(64px)' });
    expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(20);
    await user.keyboard('{Home}');
    const list = screen.getByRole('listbox');
    fireEvent.scroll(list, { target: { scrollTop: 16000 } });
    expect(list.scrollTop).toBe(16000);
    expect(highlighted()).toHaveTextContent('node-1');
  } finally {
    geometry.mockRestore();
  }
});

it('opens a trigger popup with a search header and filters while the input keeps focus', async () => {
  const user = userEvent.setup();
  render(
    <Combobox items={fruits}>
      <ComboboxTrigger aria-label="Fruit">Fruit</ComboboxTrigger>
      <ComboboxContent header={<ComboboxPopupInput />} footer={<span>Footer</span>}>
        {(fruit: string) => (
          <ComboboxItem key={fruit} value={fruit}>
            {fruit}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  await user.tab();
  await user.keyboard('{Enter}');
  const input = await screen.findByRole('combobox', { name: 'Search' });
  await waitFor(() => expect(input).toHaveFocus());
  await user.keyboard('ban');
  expect(await screen.findByRole('option', { name: 'Banana' })).toBeInTheDocument();
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByText('Footer')).toBeInTheDocument();
  expect(input).toHaveFocus();
});
