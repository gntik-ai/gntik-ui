import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { MonthCalendar } from './MonthCalendar';

describe('MonthCalendar', () => {
  it('renders the sample month with today and event counts', async () => {
    const { container } = render(<MonthCalendar />);
    expect(screen.getByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
    const today = screen.getByRole('button', { name: 'Wednesday, April 15, 2026, 9 events' });
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(today).toHaveAttribute('tabindex', '0');
    await expectNoAxeViolations(container);
  });

  it('navigates with the keyboard and selects a day', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    render(<MonthCalendar onSelectDate={onSelectDate} />);
    screen.getByRole('button', { name: /April 15, 2026/ }).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('button', { name: /April 23, 2026/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 3, 23), []);
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('heading', { name: 'May 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /May 23, 2026/ })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
  });
});
