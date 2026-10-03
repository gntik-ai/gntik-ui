import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SimpleSelect, type SimpleSelectItem } from './Select';
import SelectAsync from './examples/SelectAsync';

const fruits: SimpleSelectItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

describe('SimpleSelect async (loadOptions)', () => {
  it('loads on first open: loading status, then options selectable by keyboard', async () => {
    const d = deferred<SimpleSelectItem[]>();
    const load = vi.fn(() => d.promise);
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<SimpleSelect label="Fruit" loadOptions={load} onValueChange={onValueChange} />);
    expect(load).not.toHaveBeenCalled();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('status')).toHaveTextContent('Loading…');
    expect(load).toHaveBeenCalledWith('', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    await act(async () => d.resolve(fruits));
    expect(await screen.findAllByRole('option')).toHaveLength(2);
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toBeTruthy());
    const name = highlighted()?.textContent;
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveTextContent(name ?? ''));
  });

  it('shows the empty message when nothing loads', async () => {
    const user = userEvent.setup();
    render(<SimpleSelect label="Fruit" loadOptions={async () => []} emptyText="No fruit yet." />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(await screen.findByText('No fruit yet.')).toBeInTheDocument();
  });

  it('announces errors; Retry (and reopening) loads again', async () => {
    let fail = true;
    const load = vi.fn(async () => {
      if (fail) throw new Error('offline');
      return fruits;
    });
    const user = userEvent.setup();
    render(<SimpleSelect label="Fruit" loadOptions={load} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t load options.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    // Keyboard path: close and reopen retries.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    fail = false;
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findAllByRole('option')).toHaveLength(2);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('aborts the request when the select unmounts', async () => {
    let signal: AbortSignal | undefined;
    const user = userEvent.setup();
    const { unmount } = render(
      <SimpleSelect
        label="Fruit"
        loadOptions={(_q, ctx) => {
          signal = ctx.signal;
          return new Promise<SimpleSelectItem[]>(() => {});
        }}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await waitFor(() => expect(signal).toBeDefined());
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('SelectAsync shows the known label before loading and has no axe violations', async () => {
    const user = userEvent.setup();
    render(<SelectAsync />);
    const trigger = screen.getByRole('combobox', { name: 'Target cluster' });
    expect(trigger).toHaveTextContent('prod-eu · 12 nodes');
    await expectNoAxeViolations();
    await user.click(trigger);
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(3), { timeout: 2000 });
    await expectNoAxeViolations();
  });
});
