import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from './Combobox';

it('bounds commits for End on 5000 non-looping virtualized options', async () => {
  const user = userEvent.setup();
  const items = Array.from({ length: 5000 }, (_, i) => `node-${i + 1}`);
  let commits = 0;
  render(
    <Profiler id="combobox" onRender={() => commits++}>
      <Combobox items={items} virtualized loopFocus={false}>
        <ComboboxInput label="Nodes" />
        <ComboboxContent itemHeight={32}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </Profiler>,
  );
  const input = screen.getByRole('combobox', { name: 'Nodes' });
  await user.click(input);
  await user.keyboard('{ArrowDown}');
  commits = 0;
  fireEvent.keyDown(input, { key: 'End' });
  const last = screen.getByRole('option', { name: 'node-5000' });
  expect(input).toHaveAttribute('aria-activedescendant', last.id);
  expect(last).toHaveAttribute('data-highlighted');
  // A jump may render a viewport, but must not commit once for every intervening row.
  expect(commits).toBeLessThanOrEqual(32);
  commits = 0;
  fireEvent.keyDown(input, { key: 'Home' });
  const first = screen.getByRole('option', { name: 'node-1' });
  expect(input).toHaveAttribute('aria-activedescendant', first.id);
  expect(first).toHaveAttribute('data-highlighted');
  expect(commits).toBeLessThanOrEqual(32);
  await user.keyboard('{ArrowUp}{PageUp}');
  expect(input).toHaveAttribute('aria-activedescendant', first.id);
  await user.keyboard('{PageDown}');
  const eighth = screen.getByRole('option', { name: 'node-8' });
  expect(input).toHaveAttribute('aria-activedescendant', eighth.id);
  await user.keyboard('{End}{ArrowDown}{PageDown}');
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'node-5000' }).id);
});

it('jumps to End before any highlight with autoHighlight and looping disabled', async () => {
  const user = userEvent.setup();
  const items = Array.from({ length: 5000 }, (_, i) => `node-${i + 1}`);
  let commits = 0;
  const onValueChange = vi.fn();
  render(
    <Profiler id="combobox" onRender={() => commits++}>
      <Combobox items={items} virtualized autoHighlight loopFocus={false} onValueChange={onValueChange}>
        <ComboboxInput label="Nodes" />
        <ComboboxContent itemHeight={32}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </Profiler>,
  );
  const input = screen.getByRole('combobox', { name: 'Nodes' });
  await user.click(input);
  commits = 0;
  fireEvent.keyDown(input, { key: 'End' });
  const last = screen.getByRole('option', { name: 'node-5000' });
  expect(input).toHaveAttribute('aria-activedescendant', last.id);
  expect(commits).toBeLessThanOrEqual(32);
  await user.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenCalledWith('node-5000', expect.anything());
});
