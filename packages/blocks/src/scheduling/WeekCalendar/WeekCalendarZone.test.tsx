import TimeZoneExample from './examples/TimeZone';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import { WeekCalendar } from './WeekCalendar';

it('places events and the now line on the New York clock inherited from the provider', () => {
  vi.stubEnv('TZ', 'Europe/Madrid');
  try {
    render(
      <I18nProvider locale="en-US" timeZone="America/New_York">
        <WeekCalendar
          weekStartsOn={1}
          hourHeight={60}
          today={new Date('2026-04-15T13:00:00Z')}
          now={new Date('2026-04-15T13:30:00Z')}
          events={[
            {
              id: 'ny',
              title: 'Morning run',
              start: new Date('2026-04-15T13:00:00Z'),
              end: new Date('2026-04-15T14:00:00Z'),
            },
          ]}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Morning run').closest('li')).toHaveStyle({ top: '541px' });
    expect(screen.getByText('Times in America/New_York (EDT)')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Morning run').closest('ul')).toHaveAccessibleName('Wednesday, April 15');
    expect(screen.getByText('now').parentElement).toHaveStyle({ top: '570px' });
  } finally {
    vi.unstubAllEnvs();
  }
});

it('has no axe violations in the display-zone example', async () => {
  const { container } = render(<TimeZoneExample />);
  await expectNoAxeViolations(container);
});
