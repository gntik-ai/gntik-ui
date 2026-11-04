import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

// Real timers: Testing Library's async helpers hang under Vitest fake timers, and the
// acceptance criteria are about the default 250 ms debounce.
const options = () => screen.queryAllByRole('option');
const statusText = () =>
  screen
    .queryAllByRole('status')
    .map((el) => el.textContent)
    .join(' ');
const sleep = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

type Load = (q: string, c: { signal: AbortSignal }) => Promise<readonly string[]>;

function Harness({
  loadOptions,
  onItemSelect,
  onValueChange,
  limit,
  mode,
}: {
  loadOptions: Load;
  onItemSelect?: (item: string) => void;
  onValueChange?: (value: string) => void;
  limit?: number;
  mode?: 'list' | 'both';
}) {
  return (
    <Autocomplete<string>
      label="Model"
      loadOptions={loadOptions}
      onItemSelect={onItemSelect}
      onValueChange={onValueChange}
      limit={limit}
      mode={mode}
    />
  );
}

const box = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Model' });

describe('Autocomplete async (loadOptions)', () => {
  it('debounces: ab then abc within 250 ms loads once, with abc', async () => {
    const user = userEvent.setup();
    const load = vi.fn<Load>(async () => ['model-alpha']);
    render(<Harness loadOptions={load} />);
    await user.type(box(), 'ab');
    await sleep(100);
    await user.type(box(), 'c');
    await sleep(150);
    expect(load).not.toHaveBeenCalled();
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    await sleep(400);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.calls[0]?.[0]).toBe('abc');
  });

  it('aborts the running request when the user keeps typing', async () => {
    const user = userEvent.setup();
    const pending = deferred<readonly string[]>();
    const signals: AbortSignal[] = [];
    const load = vi.fn<Load>((_q, { signal }) => {
      signals.push(signal);
      return pending.promise;
    });
    render(<Harness loadOptions={load} />);
    await user.type(box(), 'ab');
    await waitFor(() => expect(signals).toHaveLength(1));
    expect(signals[0]?.aborted).toBe(false);
    await user.type(box(), 'c');
    await waitFor(() => expect(signals[0]?.aborted).toBe(true));
  });

  it('announces Loading… in a status region while the request runs, then lists the results as returned', async () => {
    const user = userEvent.setup();
    const pending = deferred<readonly string[]>();
    render(<Harness loadOptions={() => pending.promise} />);
    await user.type(box(), 'mod');
    await waitFor(() => expect(statusText()).toContain('Loading…'));
    await act(async () => pending.resolve(['model-alpha', 'unrelated-hit']));
    await waitFor(() => expect(options()).toHaveLength(2));
    expect(options().map((o) => o.textContent)).toEqual(['model-alpha', 'unrelated-hit']);
    expect(statusText()).not.toContain('Loading');
  });

  it('shows the error text and a Retry option that loads again, keeping the text and popup, without selecting', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    const onValueChange = vi.fn();
    let attempt = 0;
    const load = vi.fn<Load>(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error('boom');
      return ['model-alpha'];
    });
    render(<Harness loadOptions={load} onItemSelect={onItemSelect} onValueChange={onValueChange} />);
    await user.type(box(), 'mod');
    await waitFor(() => expect(statusText()).toContain('Couldn’t load options.'));
    onValueChange.mockClear();
    await user.click(screen.getByRole('option', { name: 'Retry' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('option', { name: 'model-alpha' })).toBeInTheDocument());
    expect(box()).toHaveValue('mod');
    expect(box()).toHaveAttribute('aria-expanded', 'true');
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('counts the returned items, not the Retry row, for the limit status', async () => {
    const user = userEvent.setup();
    const twenty = Array.from({ length: 20 }, (_, i) => `model-${i}`);
    render(<Harness loadOptions={async () => twenty} limit={5} />);
    await user.type(box(), 'mod');
    await waitFor(() => expect(options()).toHaveLength(5));
    expect(statusText()).toContain('Showing 5 of 20. Keep typing to refine.');
  });

  it('has no refine status after a failure', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        loadOptions={async () => {
          throw new Error('nope');
        }}
        limit={1}
      />,
    );
    await user.type(box(), 'mod');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Retry' })).toBeInTheDocument());
    expect(options()).toHaveLength(1);
    expect(statusText()).not.toContain('Showing');
  });

  it('picking a loaded option fills the input and reports the item once', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(<Harness loadOptions={async () => ['model-alpha']} onItemSelect={onItemSelect} />);
    await user.type(box(), 'mod');
    await user.click(await screen.findByRole('option', { name: 'model-alpha' }));
    expect(box()).toHaveValue('model-alpha');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith('model-alpha');
  });
});

describe('Autocomplete mode="both" with async results', () => {
  it('completes from the results of the current query', async () => {
    const user = userEvent.setup();
    render(<Harness mode="both" loadOptions={async (q) => (q.startsWith('mod') ? ['model-alpha'] : [])} />);
    await user.type(box(), 'mod');
    await waitFor(() => expect(box()).toHaveValue('model-alpha'));
    expect([box().selectionStart, box().selectionEnd]).toEqual([3, 11]);
  });

  it('never completes from results of an earlier query', async () => {
    const user = userEvent.setup();
    const first = deferred<readonly string[]>();
    const load = vi.fn<Load>((q) => (q === 'mod' ? first.promise : Promise.resolve(['moderate-load'])));
    render(<Harness mode="both" loadOptions={load} />);
    await user.type(box(), 'mod');
    await waitFor(() => expect(load).toHaveBeenCalledWith('mod', expect.anything()));
    await user.type(box(), 'x');
    await waitFor(() => expect(load).toHaveBeenCalledWith('modx', expect.anything()));
    await act(async () => first.resolve(['model-alpha']));
    await sleep(50);
    expect(box()).toHaveValue('modx');
  });
});
