import TimeZoneExample from './examples/TimeZone';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import { AgendaList } from './AgendaList';

it('groups, filters and formats on the provider clock instead of the Madrid runtime', () => {
  vi.stubEnv('TZ', 'Europe/Madrid');
  try {
    render(
      <I18nProvider locale="en-US" timeZone="America/New_York">
        <AgendaList
          days={1}
          today={new Date('2026-04-16T01:00:00Z')}
          events={[
            {
              id: 'late',
              title: 'Late run',
              start: new Date('2026-04-16T01:00:00Z'),
              end: new Date('2026-04-16T02:00:00Z'),
            },
          ]}
        />
      </I18nProvider>,
    );
    const group = screen.getByRole('list', { name: 'Today · Wednesday, April 15' });
    expect(within(group).getByText('9:00 PM–10:00 PM')).toBeInTheDocument();
    expect(within(group).getByText('Late run')).toBeInTheDocument();
    expect(screen.getByText('Times in America/New_York (EDT)')).toBeInTheDocument();
  } finally {
    vi.unstubAllEnvs();
  }
});

it('has no axe violations in the display-zone example', async () => {
  const { container } = render(<TimeZoneExample />);
  await expectNoAxeViolations(container);
});
