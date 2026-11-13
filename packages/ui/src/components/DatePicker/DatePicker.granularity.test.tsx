import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DatePicker } from './DatePicker';
import DatePickerMonth from './examples/DatePickerMonth';
import DateRangePickerQuarters from './examples/DateRangePickerQuarters';

const today = new Date(2026, 2, 11);
const button = (name: string) => screen.getByRole('button', { name });
const normalised = (text: string) => text.replace(/\s/g, ' ');

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox'));
  return screen.findByRole('dialog');
}

describe('DatePicker granularity', () => {
  it('month: picks March 2026 once, closes and reads "Mar 2026"', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker aria-label="Month" granularity="month" locale="en-US" today={today} onValueChange={onValueChange} />,
    );
    await open(user);
    await user.click(button('Mar'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 1), { reason: 'calendar' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox')).toHaveValue('Mar 2026');
  });

  it('month in Spanish reads "mar 2026"', () => {
    render(<DatePicker aria-label="Mes" granularity="month" locale="es-ES" defaultValue={new Date(2026, 2, 1)} />);
    expect(screen.getByRole('combobox')).toHaveValue('mar 2026');
  });

  it('month shows a month grid, not the day grid, with no time picker', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Month" granularity="month" withTime locale="en-US" today={today} />);
    const dialog = await open(user);
    expect(within(dialog).getByRole('grid', { name: '2026' })).toBeInTheDocument();
    expect(within(dialog).getAllByRole('gridcell')).toHaveLength(12);
    expect(within(dialog).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('group', { name: /time/i })).not.toBeInTheDocument();
  });

  it('year reads the year and emits 1 January', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker aria-label="Year" granularity="year" locale="en-US" today={today} onValueChange={onValueChange} />,
    );
    await open(user);
    await user.click(button('2027'));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2027, 0, 1), { reason: 'calendar' });
    expect(screen.getByRole('combobox')).toHaveValue('2027');
  });

  it.each([
    ['en-US', ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'], 'Q2 2026'],
    ['es-ES', ['T1 2026', 'T2 2026', 'T3 2026', 'T4 2026'], 'T2 2026'],
  ])('quarter in %s: grid labels, picks Q2 as 1 April and reads the quarter', async (locale, labels, text) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Quarter"
        granularity="quarter"
        locale={locale}
        today={today}
        onValueChange={onValueChange}
      />,
    );
    const dialog = await open(user);
    expect(
      within(within(dialog).getByRole('grid'))
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(labels);
    await user.click(button(labels[1]!));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 3, 1), { reason: 'calendar' });
    expect(screen.getByRole('combobox')).toHaveValue(text);
  });

  it.each([
    [1, new Date(2026, 2, 2), 'Mar 2 – 8, 2026'],
    [0, new Date(2026, 2, 1), 'Mar 1 – 7, 2026'],
  ] as const)('week with weekStartsOn=%i: the week of 2026-03-04 emits %s', async (weekStartsOn, start, text) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Week"
        granularity="week"
        weekStartsOn={weekStartsOn}
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button('Wednesday, March 4, 2026'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(start, { reason: 'calendar' });
    expect(normalised((screen.getByRole('combobox') as HTMLInputElement).value)).toBe(text);
  });

  it('week grid starts its columns on weekStartsOn', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Week" granularity="week" weekStartsOn={0} locale="en-US" today={today} />);
    const dialog = await open(user);
    const headers = within(dialog).getAllByRole('columnheader');
    expect(headers[1]).toHaveTextContent('S');
    expect(within(headers[1]!).getByText('S').getAttribute('title')).toBe('Sunday');
  });

  it('min 2026-02-15: January is aria-disabled and emits nothing, February is enabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Month"
        granularity="month"
        locale="en-US"
        today={today}
        min={new Date(2026, 1, 15)}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    expect(button('Jan')).toHaveAttribute('aria-disabled', 'true');
    expect(button('Feb')).not.toHaveAttribute('aria-disabled');
    await user.click(button('Jan'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('max 2026-04-15: May is disabled, April is enabled', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker aria-label="Month" granularity="month" locale="en-US" today={today} max={new Date(2026, 3, 15)} />,
    );
    await open(user);
    expect(button('May')).toHaveAttribute('aria-disabled', 'true');
    expect(button('Apr')).not.toHaveAttribute('aria-disabled');
  });

  it('ignores isDateDisabled in non-day granularities', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const isDateDisabled = vi.fn(() => true);
    render(
      <DatePicker
        aria-label="Month"
        granularity="month"
        locale="en-US"
        today={today}
        isDateDisabled={isDateDisabled}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button('Mar'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(isDateDisabled).not.toHaveBeenCalled();
  });

  it('submits the period start as YYYY-MM-DD', () => {
    const { container } = render(
      <DatePicker
        aria-label="Month"
        granularity="month"
        name="usage"
        locale="en-US"
        defaultValue={new Date(2026, 2, 17)}
      />,
    );
    expect(container.querySelector('[name="usage"]')).toHaveValue('2026-03-01');
  });

  it('keeps focus on the selected period on open; Escape closes and returns focus to the field', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Month" granularity="month" locale="en-US" defaultValue={new Date(2026, 4, 1)} />);
    const field = screen.getByRole('combobox');
    await open(user);
    await waitFor(() => expect(button('May')).toHaveFocus());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(field).toHaveValue('Jun 2026');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(field);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(field).toHaveFocus());
  });

  it('formatOptions overrides the period text', () => {
    render(
      <DatePicker
        aria-label="Month"
        granularity="month"
        locale="en-US"
        formatOptions={{ month: 'long', year: 'numeric' }}
        defaultValue={new Date(2026, 2, 1)}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('March 2026');
  });

  it('emits the zone midnight of the period start in a non-system zone', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Month"
        granularity="month"
        timeZone="UTC"
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button('Mar'));
    expect(onValueChange).toHaveBeenCalledWith(new Date(Date.UTC(2026, 2, 1)), { reason: 'calendar' });
    expect(screen.getByRole('combobox')).toHaveValue('Mar 2026');
  });

  it('default granularity keeps the day grid', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Day" locale="en-US" today={today} />);
    const dialog = await open(user);
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('March 2026');
    expect(within(dialog).getAllByRole('button', { name: /2026$/ }).length).toBeGreaterThan(28);
  });
});

describe('DatePicker month forwarding', () => {
  it('a controlled month sets the visible month and next-month reports the first day', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    function Controlled() {
      const [month, setMonth] = useState(new Date(2026, 2, 1));
      return (
        <DatePicker
          aria-label="Day"
          locale="en-US"
          today={today}
          month={month}
          onMonthChange={(next) => {
            onMonthChange(next);
            setMonth(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const dialog = await open(user);
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('March 2026');
    await user.click(within(dialog).getByRole('button', { name: /next month/i }));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 3, 1));
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('April 2026');
  });

  it('a controlled month that changes moves the visible month', async () => {
    const { rerender } = render(
      <DatePicker aria-label="Day" locale="en-US" today={today} month={new Date(2026, 2, 1)} defaultOpen />,
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('March 2026');
    rerender(<DatePicker aria-label="Day" locale="en-US" today={today} month={new Date(2026, 6, 1)} defaultOpen />);
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('July 2026');
  });

  it('defaultMonth opens the calendar on that month', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Day" locale="en-US" today={today} defaultMonth={new Date(2026, 8, 1)} />);
    const dialog = await open(user);
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('September 2026');
  });
});

describe('period examples', () => {
  it('DatePickerMonth is axe clean closed and open', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePickerMonth />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('combobox', { name: 'Billing month' }));
    const dialog = await screen.findByRole('dialog');
    await expectNoAxeViolations(dialog);
  });

  it('DateRangePickerQuarters is axe clean closed and open and reads the quarter range', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateRangePickerQuarters />);
    await expectNoAxeViolations(container);
    const field = screen.getByRole('combobox', { name: 'Reporting quarters' });
    expect(field).toHaveValue('Q1 2026 – Q2 2026');
    await user.click(field);
    const dialog = await screen.findByRole('dialog');
    await expectNoAxeViolations(dialog);
  });
});
