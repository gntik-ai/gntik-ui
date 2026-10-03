import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from './Combobox';
import ComboboxAsync from './examples/ComboboxAsync';
import ComboboxCreatable from './examples/ComboboxCreatable';

interface Opt {
  value: string;
  label: string;
}
const ALL: Opt[] = ['Apple', 'Apricot', 'Banana', 'Cherry'].map((l) => ({ value: l.toLowerCase(), label: l }));
const statusText = () => screen.getAllByRole('status').map((el) => el.textContent).join(' ');
const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function AsyncHarness({ loadOptions, onValueChange }: { loadOptions: (q: string, c: { signal: AbortSignal }) => Promise<Opt[]>; onValueChange?: (v: Opt | null) => void }) {
  return (
    <Combobox<Opt> loadOptions={loadOptions} debounceMs={20} onValueChange={onValueChange}>
      <ComboboxInput label="Fruit" />
      <ComboboxContent emptyText="Nothing found.">
        {(o: Opt) => (
          <ComboboxItem key={o.value} value={o}>
            {o.label}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

const filterAll = async (q: string) => ALL.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));

describe('Combobox async (loadOptions)', () => {
  it('shows a loading status, then the loaded options', async () => {
    const d = deferred<Opt[]>();
    const load = vi.fn(() => d.promise);
    const user = userEvent.setup();
    render(<AsyncHarness loadOptions={load} />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await waitFor(() => expect(statusText()).toContain('Loading…'));
    expect(screen.queryByText('Nothing found.')).not.toBeInTheDocument();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    await act(async () => d.resolve(ALL));
    expect(await screen.findAllByRole('option')).toHaveLength(4);
    expect(load).toHaveBeenCalledWith('', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('debounces typing and aborts stale requests', async () => {
    const signals: Record<string, AbortSignal> = {};
    const pending: Array<ReturnType<typeof deferred<Opt[]>>> = [];
    const load = vi.fn((q: string, { signal }: { signal: AbortSignal }) => {
      signals[q] = signal;
      const d = deferred<Opt[]>();
      pending.push(d);
      return d.promise;
    });
    const user = userEvent.setup();
    render(<AsyncHarness loadOptions={load} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await waitFor(() => expect(load).toHaveBeenCalledWith('', expect.anything()));
    await user.keyboard('apr');
    await waitFor(() => expect(load).toHaveBeenCalledWith('apr', expect.anything()));
    // Typed in one burst: intermediate queries never fire.
    expect(load.mock.calls.map((c) => c[0])).toEqual(['', 'apr']);
    expect(signals['']?.aborted).toBe(true);
    await act(async () => pending[0]?.resolve(ALL)); // stale result is ignored
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    await act(async () => pending[1]?.resolve(ALL.filter((o) => o.label === 'Apricot')));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option')).toHaveTextContent('Apricot');
  });

  it('shows the empty message when the result is empty', async () => {
    const user = userEvent.setup();
    render(<AsyncHarness loadOptions={filterAll} />);
    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'zzz');
    expect(await screen.findByText('Nothing found.')).toBeInTheDocument();
  });

  it('announces errors and retries from the keyboard', async () => {
    let fail = true;
    const load = vi.fn(async (q: string) => {
      if (fail) throw new Error('offline');
      return filterAll(q);
    });
    const user = userEvent.setup();
    render(<AsyncHarness loadOptions={load} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await waitFor(() => expect(statusText()).toContain('Couldn’t load options.'));
    fail = false;
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Retry'));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects a loaded option with ArrowDown + Enter', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<AsyncHarness loadOptions={filterAll} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'ban');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Banana'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(ALL[2], expect.anything());
    await waitFor(() => expect(input).toHaveValue('Banana'));
  });
});

function CreatableHarness({ onCreate }: { onCreate: (input: string) => Opt | void | Promise<Opt | void> }) {
  const [items, setItems] = useState(ALL);
  const [value, setValue] = useState<Opt | null>(null);
  return (
    <>
      <Combobox<Opt>
        items={items}
        value={value}
        onValueChange={setValue}
        onCreate={async (input) => {
          const created = await onCreate(input);
          if (created) setItems((prev) => [...prev, created]);
          return created;
        }}
      >
        <ComboboxInput label="Fruit" />
        <ComboboxContent>
          {(o: Opt) => (
            <ComboboxItem key={o.value} value={o}>
              {o.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <output>{value?.label ?? 'none'}</output>
    </>
  );
}

describe('Combobox creatable (onCreate)', () => {
  it('offers “Create …” for unmatched text and selects the created item via the keyboard', async () => {
    const onCreate = vi.fn((input: string) => ({ value: input.toLowerCase(), label: input }));
    const user = userEvent.setup();
    render(<CreatableHarness onCreate={onCreate} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'Mango');
    const create = await screen.findByRole('option', { name: 'Create “Mango”' });
    expect(create).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Create “Mango”'));
    await user.keyboard('{Enter}');
    expect(onCreate).toHaveBeenCalledWith('Mango');
    await waitFor(() => expect(screen.getByText('Mango', { selector: 'output' })).toBeInTheDocument());
    expect(input).toHaveValue('Mango');
  });

  it('keeps the create option alongside partial matches and hides it on an exact match', async () => {
    const user = userEvent.setup();
    render(<CreatableHarness onCreate={() => undefined} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'ap');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Apple', 'Apricot', 'Create “ap”']));
    await user.type(input, 'ple');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Apple']));
  });

  it('returning nothing from onCreate leaves the value unchanged', async () => {
    const user = userEvent.setup();
    render(<CreatableHarness onCreate={() => undefined} />);
    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'Kiwi');
    await user.click(await screen.findByRole('option', { name: 'Create “Kiwi”' }));
    expect(screen.getByText('none', { selector: 'output' })).toBeInTheDocument();
  });

  it.each([
    ['ComboboxAsync', ComboboxAsync, 'Assignee'],
    ['ComboboxCreatable', ComboboxCreatable, 'Labels'],
  ] as const)('%s has no axe violations, closed and open', async (_n, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name }));
    await screen.findByRole('listbox');
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));
    await expectNoAxeViolations();
  });
});
