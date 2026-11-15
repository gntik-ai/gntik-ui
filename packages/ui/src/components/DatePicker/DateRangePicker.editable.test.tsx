import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { DateRangePicker } from './DateRangePicker';

function paste(name: string, text: string) {
  fireEvent.paste(screen.getByRole('spinbutton', { name }), { clipboardData: { getData: () => text } });
}

it('keeps incomplete and reversed endpoints as drafts, emits a complete pair once, and only emits a full clear', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DateRangePicker editable locale="en-US" onValueChange={change} presets={[]} name="range" />);
  expect(within(screen.getByRole('group', { name: 'Start date' })).getAllByRole('spinbutton')).toHaveLength(3);
  expect(within(screen.getByRole('group', { name: 'End date' })).getAllByRole('spinbutton')).toHaveLength(3);
  paste('Start date, Month', '2026-03-10');
  paste('End date, Month', '2026-03-05');
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('group', { name: 'End date' })).toHaveAttribute('aria-invalid', 'true');
  paste('End date, Day', '2026-03-12');
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 10), end: new Date(2026, 2, 12) });
  change.mockClear();
  for (const endpoint of ['Start date', 'End date']) {
    await user.click(screen.getByRole('spinbutton', { name: `${endpoint}, Day` }));
    await user.keyboard('{Backspace}');
    expect(change).not.toHaveBeenCalled();
  }
  for (const endpoint of ['Start date', 'End date'])
    for (const segment of ['Month', 'Year']) {
      await user.click(screen.getByRole('spinbutton', { name: `${endpoint}, ${segment}` }));
      await user.keyboard('{Backspace}');
    }
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: null, end: null });
});

it('keeps a rejected controlled edit and its calendar on the controlled range without replacing focused segments', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const value = { start: new Date(2026, 2, 1), end: new Date(2026, 2, 3) };
  const { container } = render(
    <DateRangePicker editable locale="en-US" value={value} onValueChange={change} presets={[]} name="range" />,
  );
  const day = screen.getByRole('spinbutton', { name: 'End date, Day' });
  await user.click(day);
  for (let i = 0; i < 3; i++) {
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('spinbutton', { name: 'End date, Day' })).toBe(day);
    expect(day).toHaveFocus();
    expect(day).toHaveAttribute('aria-valuenow', '3');
    expect(container.querySelector('input[name="range-end"]')).toHaveValue('2026-03-03');
  }
  expect(change).toHaveBeenCalledTimes(3);
  paste('Start date, Month', '2027-10-01');
  paste('End date, Month', '2027-10-05');
  await user.click(screen.getByRole('button', { name: 'Choose date' }));
  expect(await screen.findByRole('button', { name: 'Sunday, March 1, 2026' })).toHaveAttribute('data-selected');
  expect(screen.queryByRole('grid', { name: 'October 2027' })).not.toBeInTheDocument();
});

it('previews a start-only small year and applies year-safe range limits', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DateRangePicker editable locale="en-US" onValueChange={change} maxRange={2} presets={[]} />);
  paste('Start date, Month', '0099-12-31');
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Choose date' }));
  expect(await screen.findByRole('grid', { name: 'December 99' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thursday, December 31, 99' })).toHaveAttribute('data-selected');
  await user.keyboard('{Escape}');
  paste('End date, Month', '0100-01-01');
  expect(change).toHaveBeenCalledExactlyOnceWith({
    start: new Date('0099-12-31T00:00:00'),
    end: new Date('0100-01-01T00:00:00'),
  });
  expect(screen.getByRole('group', { name: 'End date' })).not.toHaveAttribute('aria-invalid');
  change.mockClear();
  paste('End date, Month', '0100-01-02');
  expect(change).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('group', { name: 'End date' })).toHaveAttribute('aria-invalid', 'true');
});

it('emits an unavailable pair and validates its end with the typed rangeStart', () => {
  const change = vi.fn();
  const disabled = vi.fn(
    (date: Date, context: { rangeStart: Date | null }) => !!context.rangeStart && date.getDate() === 12,
  );
  render(<DateRangePicker editable locale="en-US" onValueChange={change} isDateDisabled={disabled} presets={[]} />);
  paste('Start date, Day', '2026-03-10');
  paste('End date, Day', '2026-03-12');
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 10), end: new Date(2026, 2, 12) });
  expect(disabled).toHaveBeenCalledWith(new Date(2026, 2, 12), { rangeStart: new Date(2026, 2, 10) });
  expect(screen.getByRole('group', { name: 'End date' })).toHaveAttribute('aria-invalid', 'true');
});

it('rewrites typed endpoints after calendar picks and restores Choose date focus', async () => {
  const user = userEvent.setup();
  render(<DateRangePicker editable locale="en-US" presets={[]} />);
  paste('Start date, Day', '2026-03-10');
  paste('End date, Day', '2026-03-12');
  await user.click(screen.getByRole('spinbutton', { name: 'End date, Day' }));
  await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
  await user.click(await screen.findByRole('button', { name: 'Tuesday, March 3, 2026' }));
  await user.click(screen.getByRole('button', { name: 'Thursday, March 5, 2026' }));
  expect(screen.getByRole('spinbutton', { name: 'Start date, Day' })).toHaveTextContent('03');
  expect(screen.getByRole('spinbutton', { name: 'End date, Day' })).toHaveTextContent('05');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Choose date' })).toHaveFocus());
});

it('restores the field range when reopening after an abandoned partial calendar pick', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DateRangePicker
      editable
      locale="en-US"
      presets={[]}
      defaultValue={{ start: new Date(2026, 2, 10), end: new Date(2026, 2, 12) }}
      onValueChange={change}
    />,
  );
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(choose);
  await user.click(await screen.findByRole('button', { name: 'Tuesday, March 3, 2026' }));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('spinbutton', { name: 'Start date, Day' })).toHaveTextContent('10');
  expect(screen.getByRole('spinbutton', { name: 'End date, Day' })).toHaveTextContent('12');
  expect(change).not.toHaveBeenCalled();

  await user.click(choose);
  expect(await screen.findByRole('button', { name: 'Tuesday, March 10, 2026' })).toHaveAttribute('data-selected');
  expect(screen.getByRole('button', { name: 'Thursday, March 12, 2026' })).toHaveAttribute('data-selected');
  expect(screen.getByRole('button', { name: 'Tuesday, March 3, 2026' })).not.toHaveAttribute('data-selected');
  await user.click(screen.getByRole('button', { name: 'Sunday, March 15, 2026' }));
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Tuesday, March 17, 2026' }));
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 15), end: new Date(2026, 2, 17) });
  expect(screen.getByRole('spinbutton', { name: 'Start date, Day' })).toHaveTextContent('15');
  expect(screen.getByRole('spinbutton', { name: 'End date, Day' })).toHaveTextContent('17');
  await waitFor(() => expect(choose).toHaveFocus());
});

it('inherits invalid and disabled Field states without allowing popup Clear', async () => {
  const user = userEvent.setup();
  const clear = vi.fn();
  const { rerender } = render(
    <Field invalid>
      <FieldLabel>Window</FieldLabel>
      <DateRangePicker
        editable
        locale="en-US"
        presets={[]}
        defaultValue={{ start: new Date(2026, 2, 1), end: new Date(2026, 2, 3) }}
      />
    </Field>,
  );
  const group = screen.getByRole('group', { name: 'Window' });
  expect(group).toHaveAttribute('aria-invalid', 'true');
  expect(group).toHaveAttribute('data-invalid');
  paste('End date, Day', '2026-03-05');
  expect(group).toHaveAttribute('aria-invalid', 'true');
  rerender(
    <Field disabled>
      <FieldLabel>Window</FieldLabel>
      <DateRangePicker
        editable
        open
        clearable
        onClear={clear}
        locale="en-US"
        presets={[]}
        defaultValue={{ start: new Date(2026, 2, 1), end: new Date(2026, 2, 3) }}
      />
    </Field>,
  );
  expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled();
  for (const segment of screen.getAllByRole('spinbutton')) expect(segment).toHaveAttribute('aria-disabled', 'true');
  const action = await screen.findByRole('button', { name: 'Clear' });
  expect(action).toBeDisabled();
  await user.click(action);
  expect(clear).not.toHaveBeenCalled();
});
