import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Timestamp } from './Timestamp';
import { formatRelative, toDate } from './format';
import TimestampActivity from './examples/TimestampActivity';
import TimestampFormats from './examples/TimestampFormats';

const NOW = new Date('2026-10-03T12:00:00Z').getTime();

describe('Timestamp', () => {
  afterEach(() => vi.useRealTimers());

  it('formats relative times with Intl and parses every input type', () => {
    expect(formatRelative(new Date(NOW - 3 * 60_000), NOW, 'en')).toBe('3 minutes ago');
    expect(formatRelative(new Date(NOW + 2 * 86_400_000), NOW, 'en')).toBe('in 2 days');
    expect(formatRelative(new Date(NOW - 2_000), NOW, 'en')).toBe('now');
    expect(formatRelative(new Date(NOW - 3 * 60_000), NOW, 'es')).toBe('hace 3 minutos');
    expect(toDate(NOW)?.getTime()).toBe(NOW);
    expect(toDate('2026-10-03T12:00:00Z')?.getTime()).toBe(NOW);
    expect(toDate('not a date')).toBeNull();
  });

  it('renders a <time> with dateTime and the full date as accessible text', () => {
    vi.useFakeTimers({ now: NOW });
    render(<Timestamp value={NOW - 5 * 60_000} locale="en-US" />);
    const time = screen.getByText('5 minutes ago').closest('time');
    expect(time).toHaveAttribute('dateTime', '2026-10-03T11:55:00.000Z');
    expect(time).toHaveAttribute('tabIndex', '0');
    expect(time?.textContent).toMatch(/^5 minutes ago \(Saturday, October 3, 2026/);
  });

  it('absolute format uses the locale', () => {
    render(<Timestamp value="2026-09-14T09:30:00Z" format="absolute" locale="de-DE" dateOptions={{ dateStyle: 'long', timeZone: 'UTC' }} tooltip={false} />);
    expect(screen.getByText('14. September 2026').tagName).toBe('TIME');
  });

  it('live-updates on an interval and clears it on unmount', () => {
    vi.useFakeTimers({ now: NOW });
    const clear = vi.spyOn(window, 'clearInterval');
    const { unmount } = render(<Timestamp value={NOW - 50_000} locale="en" tooltip={false} />);
    expect(screen.getByText('50 seconds ago')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
    unmount();
    expect(clear).toHaveBeenCalled();
  });

  it('shows an invalid date as the fallback', () => {
    render(<Timestamp value="nope" fallback="Unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('Tab focuses the timestamp and shows the full date in a tooltip; Escape hides it', async () => {
    const user = userEvent.setup();
    render(<Timestamp value="2026-09-14T09:30:00Z" locale="en-US" tooltipOptions={{ dateStyle: 'full', timeZone: 'UTC' }} />);
    await user.tab();
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Monday, September 14, 2026');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('examples have no axe violations (tooltip open)', async () => {
    const user = userEvent.setup();
    render(<><TimestampActivity /><TimestampFormats /></>);
    await user.tab();
    await screen.findByRole('tooltip');
    await expectNoAxeViolations();
  });
});
