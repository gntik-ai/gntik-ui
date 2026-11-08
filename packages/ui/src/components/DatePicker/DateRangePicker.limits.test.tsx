import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import DateRangePickerRetention from './examples/DateRangePickerRetention';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';

const date = (day: number) => new Date(2026, 2, day);
const day = (n: number) =>
  screen.getByRole('button', { name: new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date(n)) });

it('passes null rangeStart to DatePicker presets as well as its single calendar', async () => {
  const user = userEvent.setup();
  const isDateDisabled = vi.fn((_d: Date, { rangeStart }: { rangeStart: Date | null }) => rangeStart !== null);
  render(
    <DatePicker
      aria-label="Date"
      locale="en-US"
      today={date(10)}
      isDateDisabled={isDateDisabled}
      presets={[{ id: 'today', label: 'Today', date: (d) => d }]}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  expect(await screen.findByRole('button', { name: 'Today' })).toBeEnabled();
  expect(isDateDisabled).toHaveBeenCalledWith(date(10), { rangeStart: null });
});

it('reports each calendar pick, applies only complete ranges, and resets limits on reopening', async () => {
  const user = userEvent.setup();
  const onCalendarChange = vi.fn();
  const onValueChange = vi.fn();
  render(
    <DateRangePicker
      aria-label="Period"
      locale="en-US"
      today={date(10)}
      maxRange={7}
      minRange={3}
      onCalendarChange={onCalendarChange}
      onValueChange={onValueChange}
    />,
  );
  const field = screen.getByRole('combobox');
  await user.click(field);
  await user.click(day(10));
  expect(onCalendarChange).toHaveBeenCalledExactlyOnceWith({ start: date(10), end: null });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(day(17)).toHaveAttribute('aria-disabled', 'true');
  expect(day(11)).toHaveAttribute('aria-disabled', 'true');
  await user.click(day(17));
  expect(onCalendarChange).toHaveBeenCalledTimes(1);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(field);
  expect(day(17)).not.toHaveAttribute('aria-disabled');
  await user.click(day(10));
  await user.click(day(16));
  expect(onCalendarChange.mock.calls).toEqual([
    [{ start: date(10), end: null }],
    [{ start: date(10), end: null }],
    [{ start: date(10), end: date(16) }],
  ]);
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ start: date(10), end: date(16) });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(field);
  expect(day(17)).not.toHaveAttribute('aria-disabled');
});

it.each([
  [{ maxRange: 7 }, ['Last 30 days', 'This month', 'Last month'], ['Today', 'Last 7 days', 'Custom']],
  [{ minRange: 3 }, ['Today'], ['Last 7 days', 'Last 30 days', 'Custom']],
  [{ minRange: 8, maxRange: 7 }, ['Today', 'Last 7 days', 'Last 30 days'], ['Custom']],
] as const)('disables only presets outside %j and leaves Custom available', async (limits, disabled, enabled) => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DateRangePicker aria-label="Period" locale="en-US" today={date(10)} {...limits} onValueChange={onValueChange} />,
  );
  await user.click(screen.getByRole('combobox'));
  for (const name of disabled) {
    const preset = screen.getByRole('button', { name });
    expect(preset).toBeDisabled();
    await user.click(preset);
  }
  expect(onValueChange).not.toHaveBeenCalled();
  for (const name of enabled) expect(screen.getByRole('button', { name })).toBeEnabled();
});

it.each([
  ['en', 7, 'The range can span up to 7 days.'],
  ['es', 7, 'El rango puede abarcar hasta 7 días.'],
  ['en', 1, 'The range can span up to 1 day.'],
  ['es', 1, 'El rango puede abarcar hasta 1 día.'],
])('announces the maximum once per start pick in %s (%s)', async (locale, maxRange, message) => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale={locale}>
      <DateRangePicker aria-label="Period" locale="en-US" today={date(10)} maxRange={maxRange} presets={[]} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('combobox'));
  const live = screen.getByRole('dialog').querySelector('.sr-only[aria-live="polite"]');
  expect(live).toBeInTheDocument();
  expect(live).toBeEmptyDOMElement();
  const messages: string[] = [];
  const observer = new MutationObserver(() => {
    if (live?.textContent) messages.push(live.textContent);
  });
  observer.observe(live!, { childList: true, subtree: true, characterData: true });
  try {
    await user.click(day(10));
    expect(live).toHaveTextContent(message);
    await user.hover(day(11));
    await user.keyboard('{ArrowRight}');
    expect(messages).toEqual([message]);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('combobox'));
    const reopenedLive = screen.getByRole('dialog').querySelector('.sr-only[aria-live="polite"]');
    expect(reopenedLive).toBeEmptyDOMElement();
    await user.click(day(12));
    expect(reopenedLive).toHaveTextContent(message);
  } finally {
    observer.disconnect();
  }
});

it.each([{}, { minRange: 3 }, { maxRange: 0 }, { maxRange: 1.5 }])(
  'adds no range-limit live region for %j',
  async (props) => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Period" today={date(10)} {...props} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog').querySelector('.sr-only[aria-live]')).not.toBeInTheDocument();
  },
);

it.each(['dark', 'light', 'high_contrast'])(
  'the retention example is axe-clean in %s, including a pending limited range',
  async (theme) => {
    const previousTheme = document.documentElement.className;
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    try {
      render(<DateRangePickerRetention />);
      await expectNoAxeViolations();
      await user.click(screen.getByRole('combobox', { name: 'Report period' }));
      await screen.findByRole('dialog');
      await expectNoAxeViolations();
      await user.click(day(10));
      await expectNoAxeViolations();
    } finally {
      document.documentElement.className = previousTheme;
    }
  },
);

it('clears a pending draft and announcement when controlled open closes and reopens', async () => {
  const user = userEvent.setup();
  const view = (open: boolean) => (
    <DateRangePicker aria-label="Period" locale="en-US" today={date(10)} maxRange={7} open={open} />
  );
  const { rerender } = render(view(true));
  await user.click(day(10));
  expect(day(17)).toHaveAttribute('aria-disabled', 'true');
  rerender(view(false));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  rerender(view(true));
  expect(day(17)).not.toHaveAttribute('aria-disabled');
  expect(screen.getByRole('dialog').querySelector('.sr-only[aria-live]')).toBeEmptyDOMElement();
});
