import { Calendar, I18nProvider, localeWeekStart } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { MonthCalendar } from './MonthCalendar';

describe('MonthCalendar', () => {
  it('renders the sample month with today and event counts', async () => {
    const { container } = render(<MonthCalendar />);
    expect(screen.getByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
    const today = screen.getByRole('button', { name: 'Wednesday, April 15, 2026, 9 events' });
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(today).toHaveAttribute('tabindex', '0');
    await expectNoAxeViolations(container);
  });

  it('navigates with the keyboard and selects a day', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    render(<MonthCalendar onSelectDate={onSelectDate} />);
    screen.getByRole('button', { name: /April 15, 2026/ }).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('button', { name: /April 23, 2026/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 3, 23), []);
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('heading', { name: 'May 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /May 23, 2026/ })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('heading', { name: 'April 2026' })).toBeInTheDocument();
  });
});

it.each([
  ['en-US', 'Sunday', '2026-03-29'],
  ['es-ES', 'lunes', '2026-03-30'],
])('starts the April grid with the locale weekday (%s)', (locale, header, firstDate) => {
  const { container } = render(
    <I18nProvider locale={locale}>
      <MonthCalendar events={[]} today={new Date(2026, 3, 15)} />
    </I18nProvider>,
  );
  expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName(header);
  expect(container.querySelector('[data-date]')).toHaveAttribute('data-date', firstDate);
});

it.each([
  ['en-US', undefined, '9:30 AM'],
  ['es-ES', undefined, '09:30'],
  ['en-US', 'h23', '09:30'],
] as const)('formats month event times for %s with override %s', (locale, hourCycle, expected) => {
  render(
    <I18nProvider locale={locale}>
      <MonthCalendar
        hourCycle={hourCycle}
        events={[
          {
            id: 'clock',
            title: 'Review',
            kind: 'task',
            start: new Date(2026, 3, 15, 9, 30),
            end: new Date(2026, 3, 15, 10),
          },
        ]}
      />
    </I18nProvider>,
  );
  expect(screen.getByText(expected)).toBeInTheDocument();
});

it.each([
  ['en-US', undefined, '2026-04-12', '2026-04-18'],
  ['es-ES', undefined, '2026-04-13', '2026-04-19'],
  ['en-US', 1, '2026-04-13', '2026-04-19'],
] as const)('moves to week edges for %s with override %s', async (locale, weekStartsOn, home, end) => {
  const user = userEvent.setup();
  const { container } = render(
    <I18nProvider locale={locale}>
      <MonthCalendar events={[]} weekStartsOn={weekStartsOn} today={new Date(2026, 3, 15)} />
    </I18nProvider>,
  );
  const day = (key: string) => container.querySelector<HTMLElement>(`[data-date="${key}"]`)!;
  day('2026-04-15').focus();
  await user.keyboard('{Home}');
  expect(day(home)).toHaveFocus();
  day('2026-04-15').focus();
  await user.keyboard('{End}');
  expect(day(end)).toHaveFocus();
  if (weekStartsOn === 1) {
    expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName('Monday');
    expect(container.querySelector('[data-date]')).toHaveAttribute('data-date', '2026-03-30');
  }
});

it.each(['en-US', 'en-GB'])('matches the ui Calendar without a provider in a %s runtime', (runtimeLocale) => {
  const NativeFormatter = Intl.DateTimeFormat;
  vi.stubGlobal(
    'Intl',
    Object.create(Intl, {
      DateTimeFormat: {
        value: class extends NativeFormatter {
          constructor(locale?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
            super(locale ?? runtimeLocale, options);
          }
        },
      },
    }),
  );
  try {
    render(
      <>
        <MonthCalendar events={[]} />
        <Calendar defaultMonth={new Date(2026, 3, 1)} />
      </>,
    );
    const grids = screen.getAllByRole('grid');
    const header = (grid: HTMLElement) => within(grid).getAllByRole('columnheader')[0]!;
    const date = new Date(2026, 0, 4 + localeWeekStart(undefined));
    expect(header(grids[0]!)).toHaveAccessibleName(new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date));
    expect(header(grids[1]!).querySelector('abbr')).toHaveAttribute(
      'title',
      new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date),
    );
  } finally {
    vi.unstubAllGlobals();
  }
});

it('marks only weekend cells', () => {
  render(
    <I18nProvider locale="en-US">
      <MonthCalendar events={[]} />
    </I18nProvider>,
  );
  const cells = screen.getAllByRole('gridcell');
  expect(cells.filter((cell) => cell.hasAttribute('data-weekend'))).toHaveLength(12);
  for (const cell of cells) {
    const label = within(cell).getByRole('button').getAttribute('aria-label') ?? '';
    expect(cell.hasAttribute('data-weekend')).toBe(/^(Saturday|Sunday),/.test(label));
  }
});
