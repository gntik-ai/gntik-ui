import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from './Calendar';
import { expectNoAxeViolations } from '../../test/a11y';
import CalendarViews from './examples/CalendarViews';

const march = new Date(2026, 2, 15);
const button = (name: string) => screen.getByRole('button', { name });

describe('Calendar views', () => {
  it.each(['month', 'year'] as const)('opens an externally controlled %s view at the visible year', async (view) => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const { rerender } = render(<Calendar locale="en-US" today={march} view="day" onViewChange={onViewChange} />);
    for (let i = 0; i < 12; i++) await user.click(button('Next month'));
    rerender(<Calendar locale="en-US" today={march} view={view} onViewChange={onViewChange} />);
    expect(button(view === 'month' ? 'March 2027' : '2027')).toHaveFocus();
    expect(onViewChange).not.toHaveBeenCalled();
    if (view === 'month') expect(screen.getByRole('heading')).toHaveTextContent('2027');
    else {
      await user.keyboard('{Enter}');
      expect(onViewChange).toHaveBeenCalledExactlyOnceWith('month');
      rerender(<Calendar locale="en-US" today={march} view="month" onViewChange={onViewChange} />);
      expect(screen.getByRole('heading')).toHaveTextContent('2027');
    }
    onViewChange.mockClear();
    rerender(<Calendar locale="en-US" today={march} view="day" onViewChange={onViewChange} />);
    await user.click(button('Next month'));
    rerender(<Calendar locale="en-US" today={march} view="month" onViewChange={onViewChange} />);
    expect(button('April 2027')).toHaveFocus();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('opens the month grid with the visible month focused and reports the view', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<Calendar locale="en-US" today={march} onViewChange={onViewChange} />);
    await user.click(button('March 2026, choose a month'));
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: '2026' })).toBeInTheDocument();
    expect(button('March 2026')).toHaveFocus();
    expect(button('Previous year')).toBeEnabled();
    expect(button('Next year')).toBeEnabled();
    expect(onViewChange).toHaveBeenCalledExactlyOnceWith('month');
    expect(within(screen.getByRole('grid')).getAllByRole('button')).toHaveLength(12);
  });

  it('moves by month, rows and years with one grid tab stop', async () => {
    const user = userEvent.setup();
    render(<Calendar locale="en-US" today={march} />);
    await user.click(button('March 2026, choose a month'));
    await user.keyboard('{ArrowRight}');
    expect(button('April 2026')).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(button('June 2026')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(button('April 2026')).toHaveFocus();
    await user.keyboard('{End}');
    expect(button('June 2026')).toHaveFocus();
    await user.keyboard('{ArrowUp}{PageDown}');
    expect(button('March 2027')).toHaveFocus();
    expect(screen.getByRole('heading')).toHaveTextContent('2027');
    await user.keyboard('{PageUp}');
    expect(button('March 2026')).toHaveFocus();
    expect(screen.getByRole('grid').querySelectorAll('button[tabindex="0"]')).toHaveLength(1);
  });

  it.each([
    [new Date(2026, 0, 31), 'January 2026', 'April 2026', 'Thursday, April 30, 2026', new Date(2026, 3, 1)],
    [march, 'March 2026', 'August 2026', 'Saturday, August 15, 2026', new Date(2026, 7, 1)],
  ])('returns to days with the day number clamped from %s', async (date, heading, target, focused, month) => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(<Calendar locale="en-US" defaultValue={date} today={march} onMonthChange={onMonthChange} />);
    await user.click(button(`${heading}, choose a month`));
    button(target).focus();
    await user.keyboard('{Enter}');
    expect(button(focused)).toHaveFocus();
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith(month);
  });

  it('opens the shared year page, pages twelve years and picks a year', async () => {
    const user = userEvent.setup();
    render(<Calendar locale="en-US" today={march} />);
    await user.click(button('March 2026, choose a month'));
    await user.click(button('2026, choose a year'));
    expect(screen.getByRole('heading')).toHaveTextContent('2020–2031');
    expect(button('2026')).toHaveFocus();
    expect(button('Previous 12 years')).toBeEnabled();
    await user.keyboard('{PageUp}');
    expect(screen.getByRole('heading')).toHaveTextContent('2008–2019');
    expect(button('2014')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('grid', { name: '2014' })).toBeInTheDocument();
    expect(button('March 2014')).toHaveFocus();
  });

  it('keeps the header static at maxView and supports controlled view changes', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const { rerender } = render(<Calendar locale="en-US" today={march} maxView="day" />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('March 2026');
    expect(within(heading).queryByRole('button')).not.toBeInTheDocument();
    expect(button('Previous month')).toBeInTheDocument();
    rerender(<Calendar locale="en-US" today={march} defaultView="day" maxView="month" />);
    await user.click(button('March 2026, choose a month'));
    expect(within(screen.getByRole('heading')).queryByRole('button')).not.toBeInTheDocument();
    rerender(<Calendar locale="en-US" today={march} view="day" onViewChange={onViewChange} />);
    await user.click(button('March 2026, choose a month'));
    expect(onViewChange).toHaveBeenCalledExactlyOnceWith('month');
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
    rerender(<Calendar locale="en-US" today={march} view="month" onViewChange={onViewChange} />);
    expect(screen.getByRole('grid', { name: '2026' })).toBeInTheDocument();
    expect(button('March 2026')).toHaveFocus();
  });

  it.each(['min', 'max'] as const)(
    'disables only entire periods outside %s, including page navigation',
    async (bound) => {
      const user = userEvent.setup();
      const boundary = new Date(2025, 5, 15);
      render(
        <Calendar
          locale="en-US"
          today={march}
          defaultMonth={boundary}
          defaultView="month"
          {...{ [bound]: boundary }}
        />,
      );
      const disabledMonth = button(bound === 'min' ? 'May 2025' : 'July 2025');
      expect(disabledMonth).toHaveAttribute('aria-disabled', 'true');
      expect(button('June 2025')).not.toHaveAttribute('aria-disabled');
      expect(button(bound === 'min' ? 'Previous year' : 'Next year')).toBeDisabled();
      disabledMonth.focus();
      await user.keyboard('{Enter} ');
      await user.click(disabledMonth);
      expect(screen.getByRole('grid', { name: '2025' })).toBeInTheDocument();
      await user.click(button('2025, choose a year'));
      const disabledYear = button(bound === 'min' ? '2024' : '2026');
      expect(disabledYear).toHaveAttribute('aria-disabled', 'true');
      disabledYear.focus();
      await user.keyboard('{Enter} ');
      await user.click(disabledYear);
      expect(screen.getByRole('grid', { name: '2020–2031' })).toBeInTheDocument();
      expect(button(bound === 'min' ? 'Previous 12 years' : 'Next 12 years')).toBeDisabled();
      await user.click(button('2025'));
      await user.click(button('June 2025'));
      expect(button('Sunday, June 15, 2025')).toHaveFocus();
    },
  );

  it('marks the selected and current periods without selecting a new value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        locale="en-US"
        today={march}
        defaultValue={new Date(2025, 4, 10)}
        defaultMonth={march}
        onValueChange={onValueChange}
      />,
    );
    await user.click(button('March 2026, choose a month'));
    expect(button('March 2026')).toHaveAttribute('aria-current', 'date');
    await user.click(button('Previous year'));
    expect(button('May 2025').closest('td')).toHaveAttribute('aria-selected', 'true');
    await user.click(button('2025, choose a year'));
    expect(button('2025').closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(button('2026')).toHaveAttribute('aria-current', 'date');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uses kit caption selects to jump years and exposes the default current-year range', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const onViewChange = vi.fn();
    render(
      <Calendar
        locale="en-US"
        today={new Date(2030, 2, 15)}
        defaultMonth={march}
        captionLayout="select"
        onMonthChange={onMonthChange}
        onViewChange={onViewChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Year' }));
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(21);
    expect(options[0]).toHaveTextContent('2020');
    expect(options[20]).toHaveTextContent('2040');
    await user.click(await screen.findByRole('option', { name: '2030' }));
    expect(screen.getByRole('grid', { name: 'March 2030' })).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith(new Date(2030, 2, 1));
    expect(onViewChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('combobox', { name: 'Month' }));
    await user.click(await screen.findByRole('option', { name: 'April' }));
    expect(screen.getByRole('grid', { name: 'April 2030' })).toBeInTheDocument();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('clips the explicit year range to bounds and includes the visible year', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        locale="en-US"
        today={march}
        captionLayout="select"
        yearRange={{ from: 2020, to: 2028 }}
        min={new Date(2024, 5, 15)}
        max={new Date(2027, 5, 15)}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Year' }));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      '2024',
      '2025',
      '2026',
      '2027',
    ]);
  });

  it('keeps a caption selection in its original panel when two months are shown', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <Calendar locale="en-US" today={march} numberOfMonths={2} captionLayout="select" onMonthChange={onMonthChange} />,
    );
    await user.click(screen.getAllByRole('combobox', { name: 'Month' })[1]!);
    await user.click(await screen.findByRole('option', { name: 'July' }));
    expect(screen.getAllByRole('combobox', { name: 'Month' })[1]).toHaveTextContent('July');
    expect(screen.getByRole('grid', { name: 'June 2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'July 2026' })).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 5, 1));
    await user.click(screen.getAllByRole('combobox', { name: 'Year' })[1]!);
    await user.click(await screen.findByRole('option', { name: '2030' }));
    expect(screen.getByRole('grid', { name: 'June 2030' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'July 2030' })).toBeInTheDocument();
  });

  it('includes a visible year outside yearRange and disables out-of-bound month options', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        locale="en-US"
        today={new Date(2040, 5, 15)}
        captionLayout="select"
        yearRange={{ from: 2025, to: 2026 }}
        min={new Date(2025, 5, 15)}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Year' }));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      '2025',
      '2026',
      '2040',
    ]);
    await user.click(await screen.findByRole('option', { name: '2025' }));
    await user.click(screen.getByRole('combobox', { name: 'Month' }));
    expect(await screen.findByRole('option', { name: 'May' })).toHaveAttribute('aria-disabled', 'true');
    expect(await screen.findByRole('option', { name: 'June' })).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('mirrors month and year arrows under RTL', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <style>{'[dir="rtl"] button { direction: rtl; }'}</style>
        <Calendar locale="en-US" today={march} />
      </div>,
    );
    await user.click(button('March 2026, choose a month'));
    await user.keyboard('{ArrowRight}');
    expect(button('February 2026')).toHaveFocus();
    await user.click(button('2026, choose a year'));
    await user.keyboard('{ArrowRight}');
    expect(button('2025')).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(button('2029')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(button('2029')).toHaveFocus();
    await user.keyboard('{End}');
    expect(button('2031')).toHaveFocus();
  });

  it('replaces two day panels with one grid and makes the picked month first', async () => {
    const user = userEvent.setup();
    render(<Calendar locale="en-US" today={march} numberOfMonths={2} />);
    await user.click(button('April 2026, choose a month'));
    expect(screen.getAllByRole('grid')).toHaveLength(1);
    expect(button('April 2026')).toHaveFocus();
    await user.click(button('May 2026'));
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    expect(screen.getByRole('grid', { name: 'May 2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'June 2026' })).toBeInTheDocument();
    expect(button('Friday, May 15, 2026')).toHaveFocus();
  });

  it('the views example has no axe violations in day, month, year and select layouts', async () => {
    const user = userEvent.setup();
    render(<CalendarViews />);
    await expectNoAxeViolations();
    const calendar = screen.getAllByRole('group', { name: 'Calendar' })[0]!;
    await user.click(within(calendar).getByRole('button', { name: 'March 2026, choose a month' }));
    await expectNoAxeViolations();
    await user.click(within(calendar).getByRole('button', { name: '2026, choose a year' }));
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name: 'Year' }));
    await expectNoAxeViolations();
  });
});
