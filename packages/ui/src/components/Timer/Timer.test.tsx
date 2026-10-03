import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import TimerStates from './examples/TimerStates';
import TimerStopwatch from './examples/TimerStopwatch';
import { formatClock, formatCompact, toIsoDuration } from './format';
import { Timer } from './Timer';

const NOW = Date.UTC(2026, 4, 12, 10, 0, 0);

afterEach(() => vi.useRealTimers());

describe('Timer', () => {
  it('formats clock, compact and ISO durations', () => {
    expect(formatClock(134_000)).toBe('2:14');
    expect(formatClock(3_725_000)).toBe('1:02:05');
    expect(formatCompact(134_000)).toBe('2m 14s');
    expect(formatCompact(3_725_000)).toBe('1h 2m');
    expect(formatCompact(9_000)).toBe('9s');
    expect(toIsoDuration(134_000)).toBe('PT2M14S');
    expect(toIsoDuration(0)).toBe('PT0S');
  });

  it('ticks every second while running, inside a <time> duration', () => {
    vi.useFakeTimers({ now: NOW });
    render(<Timer start={NOW - 59_000} now={NOW} />);
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(timer.querySelector('time')).toHaveAttribute('dateTime', 'PT59S');
    act(() => vi.advanceTimersByTime(1000));
    expect(timer).toHaveTextContent('1:00');
  });

  it('paused and stopped freeze the value and show the status', () => {
    vi.useFakeTimers({ now: NOW });
    render(<Timer start={NOW - 120_000} end={NOW - 60_000} status="paused" format="compact" now={NOW} />);
    const timer = screen.getByRole('timer');
    expect(timer).toHaveTextContent('1m 0sPaused');
    act(() => vi.advanceTimersByTime(5000));
    expect(timer).toHaveTextContent('1m 0s');
    expect(timer).toHaveAttribute('data-status', 'paused');
  });

  it('announce adds a polite region updated once per interval', () => {
    vi.useFakeTimers({ now: NOW });
    render(<Timer start={NOW - 50_000} now={NOW} announce announceEvery={60_000} labels={{ units: { h: ' h', m: ' min', s: ' s' } }} />);
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'polite');
    expect(timer.querySelector('.sr-only')).toHaveTextContent('0 s');
    act(() => vi.advanceTimersByTime(12_000));
    expect(timer.querySelector('.sr-only')).toHaveTextContent('1 min 0 s');
  });

  it('is never focusable (keyboard contract: not interactive)', async () => {
    const user = userEvent.setup();
    render(<TimerStates />);
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('stopwatch controls start, pause and reset', async () => {
    const user = userEvent.setup();
    render(<TimerStopwatch />);
    const timer = screen.getByRole('timer', { name: 'Focus session' });
    expect(timer).toHaveAttribute('data-status', 'stopped');
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(timer).toHaveAttribute('data-status', 'running');
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(timer).toHaveAttribute('data-status', 'paused');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(timer).toHaveTextContent('0:00');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <TimerStates />
        <TimerStopwatch />
      </>,
    );
    await expectNoAxeViolations();
  });
});
