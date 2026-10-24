import TimeZoneExample from './examples/TimeZone';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthCalendar } from './MonthCalendar';

const event = {
  id: 'late',
  title: 'Late run',
  start: new Date('2026-04-15T23:30:00Z'),
  end: new Date('2026-04-16T00:00:00Z'),
};

describe('MonthCalendar display zone', () => {
  beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
  afterAll(() => vi.unstubAllEnvs());
  it('buckets UTC events on April 15 on a Madrid machine, and navigates UTC days', async () => {
    const onSelectDate = vi.fn();
    render(
      <I18nProvider locale="en-US" timeZone="Europe/Madrid">
        <MonthCalendar
          timeZone="UTC"
          events={[event]}
          today={new Date('2026-04-15T23:30:00Z')}
          onSelectDate={onSelectDate}
        />
      </I18nProvider>,
    );
    const day = screen.getByRole('button', { name: 'Wednesday, April 15, 2026, 1 event' });
    expect(within(day).getByText('Late run')).toBeInTheDocument();
    expect(day).toHaveAttribute('aria-current', 'date');
    expect(within(day).getByText('11:30 PM')).toBeInTheDocument();
    expect(screen.getByText('Times in UTC')).toBeInTheDocument();
    day.focus();
    await userEvent.setup().keyboard('{ArrowRight}{Enter}');
    expect(onSelectDate).toHaveBeenCalledWith(new Date('2026-04-16T00:00:00Z'), []);
  });
});

it('has no axe violations in the display-zone example', async () => {
  const { container } = render(<TimeZoneExample />);
  await expectNoAxeViolations(container);
});
