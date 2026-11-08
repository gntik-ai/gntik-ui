import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import CalendarRangeLimits from './examples/CalendarRangeLimits';
import { Calendar } from './Calendar';

const date = (day: number) => new Date(2026, 2, day);
const day = (n: number) =>
  screen.getByRole('button', { name: new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date(n)) });

it('caps both ends only while pending, rejects a disabled click and accepts Enter at the inclusive maximum', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Calendar mode="range" locale="en-US" today={date(10)} maxRange={7} onValueChange={onValueChange} />);
  expect(day(17)).not.toHaveAttribute('aria-disabled');
  await user.click(day(10));
  for (const n of [1, 3, 17, 31]) {
    expect(day(n)).toHaveAttribute('aria-disabled', 'true');
    expect(day(n)).not.toBeDisabled();
  }
  for (const n of [4, 10, 16]) expect(day(n)).not.toHaveAttribute('aria-disabled');
  await user.click(day(17));
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenLastCalledWith({ start: date(10), end: null });
  await user.keyboard('{ArrowLeft}{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith({ start: date(10), end: date(16) });
  expect(day(17)).not.toHaveAttribute('aria-disabled');
});

it.each([
  [8, { start: date(8), end: date(10) }],
  [12, { start: date(10), end: date(12) }],
] as const)('requires three inclusive days and completes with March %s', async (end, expected) => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Calendar mode="range" locale="en-US" today={date(10)} minRange={3} onValueChange={onValueChange} />);
  await user.click(day(10));
  for (const n of [9, 10, 11]) {
    expect(day(n)).toHaveAttribute('aria-disabled', 'true');
    await user.click(day(n));
  }
  expect(onValueChange).toHaveBeenCalledTimes(1);
  for (const n of [8, 12]) expect(day(n)).not.toHaveAttribute('aria-disabled');
  await user.click(day(end));
  expect(onValueChange).toHaveBeenLastCalledWith(expected);
});

it('does not preview a limited end through hover or keyboard, while leaving it focusable', async () => {
  const user = userEvent.setup();
  render(<Calendar mode="range" locale="en-US" today={date(10)} maxRange={7} />);
  await user.click(day(10));
  await user.hover(day(16));
  expect(day(16)).toHaveAttribute('data-in-range');
  await user.hover(day(17));
  expect(day(17)).not.toHaveAttribute('data-in-range');
  await user.click(day(17));
  await user.keyboard('{ArrowLeft}');
  expect(day(16)).toHaveAttribute('data-in-range');
  await user.keyboard('{ArrowRight}');
  expect(day(17)).toHaveFocus();
  expect(day(17)).not.toHaveAttribute('data-in-range');
});

it('provides rangeStart only while an end is pending, and keeps predicate rules relative to that start', async () => {
  const user = userEvent.setup();
  const isDateDisabled = vi.fn(
    (d: Date, { rangeStart }: { rangeStart: Date | null }) => !!rangeStart && d.getMonth() !== rangeStart.getMonth(),
  );
  render(<Calendar mode="range" locale="en-US" today={date(10)} numberOfMonths={2} isDateDisabled={isDateDisabled} />);
  expect(isDateDisabled).toHaveBeenCalledWith(date(10), { rangeStart: null });
  await user.click(day(10));
  expect(isDateDisabled).toHaveBeenCalledWith(date(11), { rangeStart: date(10) });
  const april = screen.getByRole('button', { name: 'Wednesday, April 1, 2026' });
  expect(april).toHaveAttribute('aria-disabled', 'true');
  await user.click(april);
  expect(day(10)).toHaveAttribute('data-selected');
  isDateDisabled.mockClear();
  await user.click(day(12));
  expect(isDateDisabled).toHaveBeenCalledWith(date(11), { rangeStart: null });
  expect(april).not.toHaveAttribute('aria-disabled');
});

it('passes null rangeStart in single mode and accepts one-argument predicates', async () => {
  const isDateDisabled = vi.fn((_d: Date, context: { rangeStart: Date | null }) => context.rangeStart !== null);
  const { rerender } = render(<Calendar today={date(10)} locale="en-US" isDateDisabled={isDateDisabled} />);
  expect(isDateDisabled).toHaveBeenCalledWith(date(10), { rangeStart: null });
  rerender(<Calendar today={date(10)} locale="en-US" isDateDisabled={(d) => d.getDate() === 11} />);
  expect(day(11)).toHaveAttribute('aria-disabled', 'true');
  expect(day(10)).not.toHaveAttribute('aria-disabled');
});

it.each([0, -1, 1.5, Infinity, NaN])('ignores invalid limits (%s)', async (limit) => {
  const user = userEvent.setup();
  render(<Calendar mode="range" locale="en-US" today={date(10)} maxRange={limit} minRange={limit} />);
  await user.click(day(10));
  for (const n of [1, 9, 10, 11, 31]) expect(day(n)).not.toHaveAttribute('aria-disabled');
});

it('leaves no selectable end when the minimum exceeds the maximum', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Calendar mode="range" locale="en-US" today={date(10)} minRange={8} maxRange={7} onValueChange={onValueChange} />,
  );
  await user.click(day(10));
  for (const n of [1, 9, 10, 11, 16, 17, 31]) {
    expect(day(n)).toHaveAttribute('aria-disabled', 'true');
    await user.click(day(n));
  }
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

describe('calendar-day limits across Madrid DST', () => {
  beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
  afterAll(() => vi.unstubAllEnvs());

  it('allows March 26 through April 1 but rejects April 2', async () => {
    const user = userEvent.setup();
    render(<Calendar mode="range" locale="en-US" today={date(26)} maxRange={7} numberOfMonths={2} />);
    await user.click(day(26));
    expect(screen.getByRole('button', { name: 'Wednesday, April 1, 2026' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Thursday, April 2, 2026' })).toHaveAttribute('aria-disabled', 'true');
  });
});

it.each(['dark', 'light', 'high_contrast'])(
  'the limits and relative-predicate examples are axe-clean in %s',
  async (theme) => {
    const previousTheme = document.documentElement.className;
    document.documentElement.className = theme === 'light' ? '' : theme;
    try {
      render(<CalendarRangeLimits />);
      await expectNoAxeViolations();
    } finally {
      document.documentElement.className = previousTheme;
    }
  },
);
