import ScheduleInputTimeZone from './examples/ScheduleInputTimeZone';
import { expectNoAxeViolations } from '../../test/a11y';
import { render, screen, within } from '@testing-library/react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { ScheduleInput } from './ScheduleInput';

const scenarios = [
  ['2026-03-28T12:00:00Z', ['2026-03-30T00:30:00.000Z', '2026-03-31T00:30:00.000Z']],
  ['2026-10-24T12:00:00Z', ['2026-10-25T00:30:00.000Z', '2026-10-26T01:30:00.000Z']],
] as const;

describe('ScheduleInput local preview compatibility', () => {
  beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
  afterAll(() => vi.unstubAllEnvs());
  it.each(scenarios)('keeps local instants across DST after %s', (now, expected) => {
    const { container } = render(<ScheduleInput defaultValue="30 2 * * *" now={new Date(now)} previewCount={2} />);
    expect([...container.querySelectorAll('time')].map((el) => el.dateTime)).toEqual([...expected]);
    expect(screen.getByRole('list', { name: 'Next runs (local time)' })).toBeInTheDocument();
  });
  it('keeps the explicit Madrid overlap choice', () => {
    const { container } = render(
      <ScheduleInput
        timeZone="Europe/Madrid"
        defaultValue="30 2 * * *"
        now={new Date('2026-10-24T12:00:00Z')}
        previewCount={1}
      />,
    );
    expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-10-25T01:30:00.000Z');
  });
});

it('defaults previews and labels to the provider zone, allowing an explicit override', () => {
  const { rerender } = render(
    <I18nProvider locale="en-GB" timeZone="UTC">
      <ScheduleInput defaultValue="30 9 * * *" now={new Date('2026-04-15T07:30:00Z')} previewCount={1} />
    </I18nProvider>,
  );
  const list = screen.getByRole('list', { name: 'Next runs (UTC)' });
  expect(within(list).getByText('Wed, 15 Apr 2026, 09:30')).toHaveAttribute('datetime', '2026-04-15T09:30:00.000Z');
  rerender(
    <I18nProvider locale="en-GB" timeZone="UTC">
      <ScheduleInput
        timeZone="Europe/Madrid"
        defaultValue="30 9 * * *"
        now={new Date('2026-04-15T07:30:00Z')}
        previewCount={1}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('list', { name: 'Next runs (Europe/Madrid)' }).querySelector('time')).toHaveAttribute(
    'datetime',
    '2026-04-16T07:30:00.000Z',
  );
});

it('has no axe violations in the provider-zone example', async () => {
  render(<ScheduleInputTimeZone />);
  await expectNoAxeViolations();
});
