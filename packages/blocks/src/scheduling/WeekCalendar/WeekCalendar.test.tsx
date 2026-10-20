import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { WeekCalendar } from './WeekCalendar';

describe('WeekCalendar', () => {
  it('renders the sample week with its events per day', async () => {
    const { container } = render(<WeekCalendar weekStartsOn={1} hourCycle="h23" />);
    expect(screen.getByRole('heading', { name: 'Apr 13 – 19, 2026' })).toBeInTheDocument();
    const wednesday = screen.getByRole('list', { name: 'Wednesday, April 15' });
    expect(within(wednesday).getAllByRole('listitem')).toHaveLength(9);
    await expectNoAxeViolations(container);
  });

  it('changes week and reports event clicks', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onWeekChange = vi.fn();
    render(<WeekCalendar weekStartsOn={1} hourCycle="h23" onEventClick={onEventClick} onWeekChange={onWeekChange} />);
    await user.click(screen.getByRole('button', { name: 'Checkout hotfix, 09:00–10:00, eu-west-1' }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Checkout hotfix' }));
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    expect(onWeekChange).toHaveBeenCalledWith(new Date(2026, 3, 20));
    expect(screen.getByRole('heading', { name: 'Apr 20 – 26, 2026' })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});

it.each([
  ['en-US', undefined, 'Sunday, April 12', 12],
  ['es-ES', undefined, 'lunes, 13 de abril', 13],
  ['en-US', 1, 'Monday, April 13', 13],
] as const)(
  'aligns initial week, navigation and Today for %s with override %s',
  async (locale, weekStartsOn, firstLabel, day) => {
    const user = userEvent.setup();
    const onWeekChange = vi.fn();
    render(
      <I18nProvider locale={locale}>
        <WeekCalendar
          events={[]}
          today={new Date(2026, 3, 15)}
          weekStartsOn={weekStartsOn}
          onWeekChange={onWeekChange}
        />
      </I18nProvider>,
    );
    expect(screen.getAllByRole('list')[0]).toHaveAccessibleName(firstLabel);
    await user.click(screen.getByRole('button', { name: locale === 'es-ES' ? 'Semana siguiente' : 'Next week' }));
    expect(onWeekChange).toHaveBeenLastCalledWith(new Date(2026, 3, day + 7));
    await user.click(screen.getByRole('button', { name: locale === 'es-ES' ? 'Semana anterior' : 'Previous week' }));
    expect(onWeekChange).toHaveBeenLastCalledWith(new Date(2026, 3, day));
    await user.click(screen.getByRole('button', { name: locale === 'es-ES' ? 'Hoy' : 'Today' }));
    expect(onWeekChange).toHaveBeenLastCalledWith(new Date(2026, 3, day));
  },
);

it.each([
  ['en-US', undefined, '9:30 AM–10:00 AM', '9 AM'],
  ['es-ES', undefined, '09:30–10:00', '09:00'],
  ['en-US', 'h23', '09:30–10:00', '09:00'],
] as const)('formats event names and gutter labels for %s with override %s', (locale, hourCycle, range, hour) => {
  render(
    <I18nProvider locale={locale}>
      <WeekCalendar
        hourCycle={hourCycle}
        onEventClick={() => {}}
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
  expect(screen.getByRole('button', { name: `Review, ${range}` })).toBeInTheDocument();
  expect(screen.getByText(hour, { exact: true })).toBeInTheDocument();
});

it('marks Saturday and Sunday day columns only', () => {
  render(
    <I18nProvider locale="en-US">
      <WeekCalendar events={[]} />
    </I18nProvider>,
  );
  const columns = screen.getAllByRole('list');
  expect(columns.filter((column) => column.hasAttribute('data-weekend'))).toHaveLength(2);
  for (const column of columns) {
    expect(column.hasAttribute('data-weekend')).toBe(
      /^(Saturday|Sunday),/.test(column.getAttribute('aria-label') ?? ''),
    );
  }
});
