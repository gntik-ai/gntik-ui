import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './DateRangePicker';

it('applies two calendar picks when a read-only controlled range gets an equal inline value on a parent render', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  function Example() {
    const [, setPicks] = useState(0);
    return (
      <DateRangePicker
        locale="en-US"
        aria-label="Period"
        value={{ start: new Date(2026, 2, 1), end: new Date(2026, 2, 2) }}
        onValueChange={change}
        onCalendarChange={() => setPicks((count) => count + 1)}
        presets={[]}
      />
    );
  }
  render(<Example />);
  await user.click(screen.getByRole('combobox', { name: 'Period' }));
  await user.click(await screen.findByRole('button', { name: 'Tuesday, March 3, 2026' }));
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Thursday, March 5, 2026' }));
  expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 3), end: new Date(2026, 2, 5) });
});

it.each([null, '2025-03-02T00:00:00'])(
  'preserves a typed start across month callback renders with an equal inline controlled range (start=%s)',
  async (initialStart) => {
    const user = userEvent.setup();
    const change = vi.fn();
    function Example() {
      const [, setMonth] = useState<Date>();
      return (
        <DateRangePicker
          editable
          locale="en-US"
          value={{ start: initialStart ? new Date(initialStart) : null, end: null }}
          onValueChange={change}
          onMonthChange={setMonth}
          presets={[]}
        />
      );
    }
    render(<Example />);
    const startMonth = screen.getByRole('spinbutton', { name: 'Start date, Month' });
    await user.click(startMonth);
    await user.keyboard('10012026');
    expect(change).not.toHaveBeenCalled();
    expect(startMonth).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getByRole('spinbutton', { name: 'Start date, Day' })).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('spinbutton', { name: 'Start date, Year' })).toHaveAttribute('aria-valuenow', '2026');
    await user.click(screen.getByRole('spinbutton', { name: 'End date, Month' }));
    await user.keyboard('10032026');
    expect(change).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 3) });
  },
);
