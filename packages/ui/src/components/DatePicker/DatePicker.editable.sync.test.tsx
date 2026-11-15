import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';

it('does not treat an inferred period from a two-digit hour as an explicit period', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DatePicker editable withTime hourCycle={12} locale="en-US" onValueChange={change} />);
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('100120261030');
  expect(change).not.toHaveBeenCalled();
  await user.keyboard('p');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 22, 30));
});

it('uses the picked month after a preset replaces the initial default month', async () => {
  const user = userEvent.setup();
  render(
    <DatePicker
      editable
      locale="en-US"
      defaultMonth={new Date(2025, 4, 1)}
      presets={[{ id: 'due', label: 'Due date', date: () => new Date(2026, 9, 1) }]}
    />,
  );
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(choose);
  await user.click(await screen.findByRole('button', { name: 'Due date' }));
  await user.click(choose);
  expect(await screen.findByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute('aria-valuenow', '10');
});

it('updates a typed range preview when a preset selects a different month', async () => {
  const user = userEvent.setup();
  render(
    <DateRangePicker
      editable
      locale="en-US"
      presets={[
        {
          id: 'next',
          label: 'Next range',
          range: () => ({ start: new Date(2027, 0, 1), end: new Date(2027, 0, 3) }),
        },
      ]}
    />,
  );
  for (const [name, text] of [
    ['Start date, Day', '2026-10-01'],
    ['End date, Day', '2026-10-02'],
  ]) {
    fireEvent.paste(screen.getByRole('spinbutton', { name }), { clipboardData: { getData: () => text } });
  }
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(choose);
  await user.click(await screen.findByRole('button', { name: 'Next range' }));
  await user.click(choose);
  expect(await screen.findByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: 'Start date, Month' })).toHaveAttribute('aria-valuenow', '1');
});

it('keeps the preview month aligned when a zone change crosses a month boundary', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DatePicker editable locale="en-US" timeZone="UTC" />);
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
    clipboardData: { getData: () => '2026-01-01' },
  });
  rerender(<DatePicker editable locale="en-US" timeZone="America/Los_Angeles" />);
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute('aria-valuenow', '12');
  await user.click(screen.getByRole('button', { name: 'Choose date' }));
  expect(await screen.findByRole('grid', { name: 'December 2025' })).toBeInTheDocument();
});

it('submits a four-digit small year in a zoned editable picker', () => {
  const { container } = render(<DatePicker editable timeZone="UTC" name="year" locale="en-US" />);
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Year' }), {
    clipboardData: { getData: () => '0099-12-31' },
  });
  expect(container.querySelector('input[name="year"]')).toHaveValue('0099-12-31');
});

it('keeps the existing withTime preset behavior while calendar picks close the editable popup', async () => {
  const user = userEvent.setup();
  render(
    <DatePicker
      editable
      withTime
      locale="en-US"
      defaultValue={new Date(2026, 2, 1, 14, 30)}
      presets={[{ id: 'next', label: 'Next day', date: () => new Date(2026, 2, 2) }]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Choose date' }));
  await user.click(await screen.findByRole('button', { name: 'Next day' }));
  expect(screen.getByRole('button', { name: 'Choose date' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('aria-valuenow', '2');
});

it('validates a typed date-time through the calendar-day disabled-date contract', () => {
  const change = vi.fn();
  render(
    <DatePicker
      editable
      withTime
      hourCycle={24}
      locale="en-US"
      onValueChange={change}
      isDateDisabled={(date) => date.getTime() === new Date(2026, 9, 1).getTime()}
    />,
  );
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
    clipboardData: { getData: () => '2026-10-01T14:30' },
  });
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 14, 30));
  expect(screen.getByRole('group', { name: 'Date' })).toHaveAttribute('aria-invalid', 'true');
});

it('emits a valid range once even when the same completed date is pasted again', () => {
  const change = vi.fn();
  render(<DateRangePicker editable locale="en-US" presets={[]} onValueChange={change} />);
  const paste = (name: string, text: string) =>
    fireEvent.paste(screen.getByRole('spinbutton', { name }), {
      clipboardData: { getData: () => text },
    });
  paste('Start date, Day', '2026-10-01');
  paste('End date, Day', '2026-10-02');
  paste('End date, Month', '2026-10-02');
  paste('Start date, Year', '2026-10-01');
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 2) });
});

it('requests a range preview month only when typing changes that month', () => {
  const change = vi.fn();
  render(<DateRangePicker editable locale="en-US" presets={[]} onMonthChange={change} />);
  for (const [name, text] of [
    ['Start date, Day', '2026-10-01'],
    ['End date, Day', '2026-10-02'],
  ]) {
    fireEvent.paste(screen.getByRole('spinbutton', { name }), { clipboardData: { getData: () => text } });
  }
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
});

it('does not request a controlled month change when typing in the visible month', () => {
  const change = vi.fn();
  render(<DatePicker editable locale="en-US" month={new Date(2026, 9, 1)} onMonthChange={change} />);
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
    clipboardData: { getData: () => '2026-10-01' },
  });
  expect(change).not.toHaveBeenCalled();
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
    clipboardData: { getData: () => '2026-11-01' },
  });
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 10, 1));
});

it('emits one full clear after a range draft that never became a complete pair', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DateRangePicker editable locale="en-US" presets={[]} onValueChange={change} />);
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Start date, Day' }), {
    clipboardData: { getData: () => '2026-10-01' },
  });
  expect(change).not.toHaveBeenCalled();
  for (const segment of ['Day', 'Month', 'Year']) {
    await user.click(screen.getByRole('spinbutton', { name: `Start date, ${segment}` }));
    await user.keyboard('{Backspace}');
  }
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: null, end: null });
  await user.keyboard('{Backspace}');
  expect(change).toHaveBeenCalledTimes(1);
});

it('validates the start without an end-selection context and the end with the typed start', () => {
  const disabled = vi.fn(
    (date: Date, context: { rangeStart: Date | null }) => context.rangeStart !== null && date < new Date(2026, 2, 13),
  );
  render(<DateRangePicker editable locale="en-US" presets={[]} isDateDisabled={disabled} />);
  for (const [name, text] of [
    ['Start date, Day', '2026-03-10'],
    ['End date, Day', '2026-03-13'],
  ]) {
    fireEvent.paste(screen.getByRole('spinbutton', { name }), { clipboardData: { getData: () => text } });
  }
  expect(disabled).toHaveBeenCalledWith(new Date(2026, 2, 10), { rangeStart: null });
  expect(disabled).toHaveBeenCalledWith(new Date(2026, 2, 13), { rangeStart: new Date(2026, 2, 10) });
  expect(screen.getByRole('group', { name: 'End date' })).not.toHaveAttribute('aria-invalid');
});
