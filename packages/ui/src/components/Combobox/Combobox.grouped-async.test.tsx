import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
} from './index';

const regions = [
  { value: 'Europe', items: ['Madrid', 'Paris'] },
  { value: 'Americas', items: ['Toronto'] },
];
type Region = (typeof regions)[number];
function deferred() {
  let resolve!: (items: Region[]) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<Region[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
const status = () =>
  screen
    .getAllByRole('status')
    .map((el) => el.textContent)
    .join(' ');

it('loads grouped options with status, debounce, abort and an ungrouped keyboard Retry row', async () => {
  const requests: Array<ReturnType<typeof deferred>> = [];
  const signals: AbortSignal[] = [];
  const load = vi.fn((_query: string, { signal }: { signal: AbortSignal }) => {
    signals.push(signal);
    const request = deferred();
    requests.push(request);
    return request.promise;
  });
  const user = userEvent.setup();
  render(
    <Combobox<string> items={regions} loadOptions={load} debounceMs={40}>
      <ComboboxInput label="City" />
      <ComboboxContent emptyText="Nothing found.">
        {(group: Region) => (
          <ComboboxGroup key={group.value} items={group.items}>
            <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
            <ComboboxCollection>
              {(city: string) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.click(input);
  await waitFor(() => expect(load).toHaveBeenCalledWith('', expect.anything()));
  expect(status()).toContain('Loading…');
  expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByText('Nothing found.')).not.toBeInTheDocument();
  await user.keyboard('par');
  await waitFor(() => expect(load).toHaveBeenCalledWith('par', expect.anything()));
  expect(load.mock.calls.map((call) => call[0])).toEqual(['', 'par']);
  expect(signals[0]?.aborted).toBe(true);
  await act(async () => requests[0]!.resolve(regions));
  expect(screen.queryAllByRole('option')).toHaveLength(0);
  // Remote results are authoritative: Toronto remains even though it does not match "par".
  await act(async () => requests[1]!.resolve(regions));
  expect(await screen.findByRole('group', { name: 'Europe' })).toHaveTextContent('Paris');
  expect(screen.getByRole('group', { name: 'Americas' })).toHaveTextContent('Toronto');
  expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');
  await user.keyboard('x');
  await waitFor(() => expect(load).toHaveBeenCalledWith('parx', expect.anything()));
  await act(async () => requests[2]!.reject(new Error('offline')));
  await waitFor(() => expect(status()).toContain('Couldn’t load options.'));
  const retry = await screen.findByRole('option', { name: 'Retry' });
  expect(retry.closest('[role="group"]')).toBeNull();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(retry).toHaveAttribute('data-highlighted'));
  await user.keyboard('{Enter}');
  await waitFor(() => expect(requests).toHaveLength(4));
  expect(status()).toContain('Loading…');
  await act(async () => requests[3]!.resolve(regions));
  expect(await screen.findByRole('group', { name: 'Americas' })).toHaveTextContent('Toronto');
  expect(input).toHaveValue('parx');
  expect(screen.queryByRole('option', { name: 'Retry' })).not.toBeInTheDocument();
});

it('keeps the input and query when a virtualized async picker receives groups for the first time', async () => {
  const user = userEvent.setup();
  const pending = deferred();
  const load = vi.fn(() => pending.promise);
  render(
    <Combobox<string> virtualized loadOptions={load} debounceMs={0}>
      <ComboboxInput label="City" />
      <ComboboxContent>
        {(group: Region) => (
          <ComboboxGroup key={group.value} items={group.items}>
            <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
            <ComboboxCollection>
              {(city: string) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole('combobox', { name: 'City' });
  await user.type(input, 'par');
  await act(async () => pending.resolve(regions));
  expect(await screen.findByRole('group', { name: 'Europe' })).toBeInTheDocument();
  expect(input).toBeInTheDocument();
  expect(input).toHaveValue('par');
  expect(input).toHaveFocus();
  expect(screen.getByRole('listbox')).not.toHaveAttribute('data-virtualized');
  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
  await waitFor(() => expect(screen.getByRole('option', { name: 'Toronto' })).toHaveAttribute('data-highlighted'));
});
