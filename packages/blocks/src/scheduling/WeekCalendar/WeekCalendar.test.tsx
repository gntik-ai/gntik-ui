import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { WeekCalendar } from './WeekCalendar';

describe('WeekCalendar', () => {
  it('renders the sample week with its events per day', async () => {
    const { container } = render(<WeekCalendar />);
    expect(screen.getByRole('heading', { name: 'Apr 13 – 19, 2026' })).toBeInTheDocument();
    const wednesday = screen.getByRole('list', { name: 'Wednesday, April 15' });
    expect(within(wednesday).getAllByRole('listitem')).toHaveLength(9);
    await expectNoAxeViolations(container);
  });

  it('changes week and reports event clicks', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onWeekChange = vi.fn();
    render(<WeekCalendar onEventClick={onEventClick} onWeekChange={onWeekChange} />);
    await user.click(screen.getByRole('button', { name: 'Checkout hotfix, 09:00–10:00, eu-west-1' }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Checkout hotfix' }));
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    expect(onWeekChange).toHaveBeenCalledWith(new Date(2026, 3, 20));
    expect(screen.getByRole('heading', { name: 'Apr 20 – 26, 2026' })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});
