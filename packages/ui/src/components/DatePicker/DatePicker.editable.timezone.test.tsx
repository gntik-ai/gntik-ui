import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

beforeAll(() => vi.stubEnv('TZ', 'America/New_York'));
afterAll(() => vi.unstubAllEnvs());

it('edits UTC wall time without passing through host DST and rebuilds drafts when the zone changes', async () => {
  // This local wall time falls in New York's spring-forward gap.
  expect(new Date('2026-03-08T02:30:00').getHours()).toBe(3);
  expect(new Date('2026-03-08T02:30:00').getTimezoneOffset()).toBe(240);
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <DatePicker editable withTime hourCycle={24} timeZone="UTC" locale="en-US" onValueChange={change} />,
  );
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('030820260230');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date('2026-03-08T02:30:00Z'));
  rerender(
    <DatePicker
      editable
      withTime
      hourCycle={24}
      timeZone="America/Los_Angeles"
      locale="en-US"
      value={new Date('2026-03-08T02:30:00Z')}
    />,
  );
  expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-valuenow', '18');
  expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('aria-valuenow', '7');
});
