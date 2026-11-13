import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';

const today = new Date(2026, 2, 11);
const aprilMarkers = (date: Date) =>
  date.getMonth() === 3 && date.getDate() === 9 ? [{ label: 'April deploy', tone: 'success' as const }] : undefined;

describe('DatePicker marker props', () => {
  it('forwards onMonthChange and getDayMarkers to the popup calendar on PageDown', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <DatePicker
        locale="en-US"
        today={today}
        defaultValue={new Date(2026, 2, 20)}
        onMonthChange={onMonthChange}
        getDayMarkers={aprilMarkers}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const dialog = await screen.findByRole('dialog');
    expect(onMonthChange).not.toHaveBeenCalled();
    const focused = await within(dialog).findByRole('button', { name: 'Friday, March 20, 2026' });
    focused.focus();
    await user.keyboard('{PageDown}');
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 3, 1));
    const marked = within(dialog).getByRole('button', { name: 'Thursday, April 9, 2026, April deploy' });
    expect(marked.querySelector('[data-marker]')).toHaveClass('bg-success');
  });

  it('forwards the next-month button, highlightedDates, highlightedLabel, loading and renderDay', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <DatePicker
        locale="en-US"
        today={today}
        defaultOpen
        onMonthChange={onMonthChange}
        highlightedDates={[new Date(2026, 2, 10)]}
        highlightedLabel="Maintenance"
        renderDay={(d) => <i>{d.getDate()}!</i>}
      />,
    );
    const dialog = await screen.findByRole('dialog');
    const day = within(dialog).getByRole('button', { name: 'Tuesday, March 10, 2026, Maintenance' });
    expect(day.querySelector('[aria-hidden="true"]')).toHaveTextContent('10!');
    await user.click(within(dialog).getByRole('button', { name: 'Next month' }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 3, 1));
  });

  it('shows the loading state in the popup calendar', async () => {
    render(<DatePicker locale="en-US" today={today} defaultOpen loading />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('grid')).toHaveAttribute('aria-busy', 'true');
  });

  it('passes calendar days unchanged to getDayMarkers under a non-system zone', async () => {
    const getDayMarkers = vi.fn<(date: Date) => undefined>(() => undefined);
    render(<DatePicker locale="en-US" today={today} timeZone="Asia/Tokyo" defaultOpen getDayMarkers={getDayMarkers} />);
    await screen.findByRole('dialog');
    const days = getDayMarkers.mock.calls.map(([d]) => d);
    expect(days.length).toBeGreaterThan(0);
    for (const d of days) {
      expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([0, 0, 0]);
      expect(d.getMonth()).toBe(2);
    }
  });
});

describe('DateRangePicker marker props', () => {
  it('forwards the marker props and onMonthChange to the popup calendar', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <DateRangePicker
        locale="en-US"
        today={today}
        defaultOpen
        numberOfMonths={1}
        onMonthChange={onMonthChange}
        getDayMarkers={aprilMarkers}
        highlightedDates={[new Date(2026, 2, 10)]}
      />,
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Tuesday, March 10, 2026, Highlighted' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Next month' }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 3, 1));
    expect(within(dialog).getByRole('button', { name: 'Thursday, April 9, 2026, April deploy' })).toBeInTheDocument();
  });

  it('forwards loading and renderDay', async () => {
    render(
      <DateRangePicker locale="en-US" today={today} defaultOpen loading renderDay={(d) => <i>{d.getDate()}</i>} />,
    );
    const dialog = await screen.findByRole('dialog');
    for (const grid of within(dialog).getAllByRole('grid')) expect(grid).toHaveAttribute('aria-busy', 'true');
  });
});
