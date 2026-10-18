import { I18nProvider } from '../../i18n/I18nProvider';
import { Field, FieldLabel } from '../Field';
import { expectNoAxeViolations } from '../../test/a11y';
import BillingMonth from './examples/BillingMonth';
import QuarterRange from './examples/QuarterRange';
import Week from './examples/Week';
import Year from './examples/Year';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeriodCalendar } from './PeriodCalendar';
import { PeriodPicker } from './PeriodPicker';

const today = new Date(2026, 9, 17);
const button = (name: string) => screen.getByRole('button', { name });

it('selects a whole Spanish month through the field and submits a stable form value', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(<PeriodPicker locale="es-ES" today={today} name="period" onValueChange={change} />);
  const field = screen.getByRole('combobox');
  expect(field).toHaveAttribute('placeholder', 'Elige un periodo');
  await user.click(field);
  const grid = await screen.findByRole('grid', { name: '2026' });
  expect(within(grid).getAllByRole('gridcell')).toHaveLength(12);
  expect(within(grid).getAllByRole('row')).toHaveLength(4);
  expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  const monthNames = Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(2026, month, 1)),
  );
  expect(
    within(grid)
      .getAllByRole('button')
      .map((b) => b.textContent),
  ).toEqual(monthNames);
  await user.click(button('mar'));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
  expect(field).toHaveValue('mar 2026');
  expect(container.querySelector('[name="period"]')).toHaveValue('2026-03');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(field).toHaveFocus());
});

it('month keyboard crosses years, pages, and row edges with one tab stop', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodCalendar locale="en" today={new Date(2026, 11, 1)} onValueChange={change} />);
  button('Dec').focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('grid', { name: '2027' })).toBeInTheDocument();
  expect(button('Jan')).toHaveFocus();
  await user.keyboard('{PageUp}');
  expect(screen.getByRole('grid', { name: '2026' })).toBeInTheDocument();
  expect(button('Jan')).toHaveFocus();
  await user.keyboard('{PageDown}{ArrowDown}{ArrowRight}{Home}');
  expect(button('Apr')).toHaveFocus();
  await user.keyboard('{End}');
  expect(button('Jun')).toHaveFocus();
  await user.keyboard('{ArrowUp}{ArrowLeft} ');
  expect(change).toHaveBeenLastCalledWith(new Date(2027, 1, 1));
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('grid').querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  await user.click(button('Previous year'));
  expect(screen.getByRole('grid', { name: '2026' })).toBeInTheDocument();
  await user.click(button('Next year'));
  expect(screen.getByRole('grid', { name: '2027' })).toBeInTheDocument();
});

it.each([
  ['en', 'Q3 2026'],
  ['es', 'T3 2026'],
])('quarter selection and form text in %s', async (locale, label) => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(
    <PeriodPicker granularity="quarter" locale={locale} today={today} name="quarter" onValueChange={change} />,
  );
  const field = screen.getByRole('combobox');
  await user.click(field);
  const grid = await screen.findByRole('grid');
  expect(within(grid).getAllByRole('row')).toHaveLength(1);
  expect(within(grid).getAllByRole('gridcell')).toHaveLength(4);
  await user.click(button(label));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 6, 1));
  expect(field).toHaveValue(label);
  expect(container.querySelector('[name="quarter"]')).toHaveValue('2026-Q3');
});

it('quarter keys move by quarter, row and year', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodCalendar granularity="quarter" today={today} locale="en" onValueChange={change} />);
  button('Q4 2026').focus();
  await user.keyboard('{ArrowRight}');
  expect(button('Q1 2027')).toHaveFocus();
  await user.keyboard('{ArrowLeft}{Home}');
  expect(button('Q1 2026')).toHaveFocus();
  await user.keyboard('{End}');
  expect(button('Q4 2026')).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(button('Q4 2027')).toHaveFocus();
  await user.keyboard('{ArrowUp}{PageUp}');
  expect(button('Q4 2025')).toHaveFocus();
  await user.keyboard('{PageDown} ');
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
});

it('year pages preserve focus position, arrows cross pages, and Enter submits a year', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(<PeriodPicker granularity="year" today={today} name="year" onValueChange={change} />);
  const field = screen.getByRole('combobox');
  await user.click(field);
  await screen.findByRole('grid', { name: '2020–2031' });
  await waitFor(() => expect(button('2026')).toHaveFocus());
  await user.keyboard('{PageDown}');
  expect(screen.getByRole('grid', { name: '2032–2043' })).toBeInTheDocument();
  expect(button('2038')).toHaveFocus();
  await user.keyboard('{PageUp}{Home}');
  expect(button('2026')).toHaveFocus();
  await user.keyboard('{End}');
  expect(button('2028')).toHaveFocus();
  await user.keyboard('{ArrowUp}{ArrowLeft}{ArrowDown}{ArrowDown}');
  expect(button('2030')).toHaveFocus();
  await user.keyboard('{ArrowRight}{ArrowRight}');
  expect(button('2032')).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenLastCalledWith(new Date(2032, 0, 1));
  expect(field).toHaveValue('2032');
  expect(container.querySelector('[name="year"]')).toHaveValue('2032');
});

it('drills from May to years and back to May in the chosen year without selecting', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodCalendar today={new Date(2026, 4, 1)} onValueChange={change} />);
  button('May').focus();
  await user.click(button('2026'));
  expect(screen.getByRole('grid', { name: '2020–2031' })).toBeInTheDocument();
  await user.click(button('2024'));
  expect(screen.getByRole('grid', { name: '2024' })).toBeInTheDocument();
  expect(button('May')).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
  await user.click(button('2024'));
  await user.click(button('Next 12 years'));
  expect(screen.getByRole('grid', { name: '2032–2043' })).toBeInTheDocument();
  await user.click(button('Previous 12 years'));
  expect(screen.getByRole('grid', { name: '2020–2031' })).toBeInTheDocument();
});

it.each([
  ['en', new Date(2026, 8, 30), 'Wednesday, September 30, 2026', 'Week 40, 2026', '2026-W40', new Date(2026, 8, 28)],
  [
    'es',
    new Date(2026, 8, 30),
    'miércoles, 30 de septiembre de 2026',
    'Semana 40 de 2026',
    '2026-W40',
    new Date(2026, 8, 28),
  ],
  ['en', new Date(2026, 0, 1), 'Thursday, January 1, 2026', 'Week 1, 2026', '2026-W01', new Date(2025, 11, 29)],
] as const)('selects an ISO week in %s at %s', async (locale, date, dayLabel, label, form, start) => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(
    <PeriodPicker locale={locale} granularity="week" today={date} name="week" onValueChange={change} />,
  );
  const field = screen.getByRole('combobox');
  await user.click(field);
  await waitFor(() => expect(button(dayLabel)).toHaveFocus());
  const grid = screen.getByRole('grid');
  expect(within(grid).getAllByRole('rowheader')).toHaveLength(6);
  expect(
    within(grid)
      .getAllByRole('rowheader')
      .every((th) => !th.hasAttribute('tabindex') && !th.querySelector('[tabindex]')),
  ).toBe(true);
  expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenLastCalledWith(start);
  expect(field).toHaveValue(label);
  expect(container.querySelector('[name="week"]')).toHaveValue(form);
});

it('week keys move by day, week, month and ISO row edges; the whole week is selected', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodCalendar granularity="week" locale="en-US" today={new Date(2026, 8, 30)} onValueChange={change} />);
  button('Wednesday, September 30, 2026').focus();
  await user.keyboard('{ArrowRight}');
  expect(button('Thursday, October 1, 2026')).toHaveFocus();
  await user.keyboard('{ArrowLeft}{Home}');
  expect(button('Monday, September 28, 2026')).toHaveFocus();
  await user.keyboard('{End}');
  expect(button('Sunday, October 4, 2026')).toHaveFocus();
  await user.keyboard('{ArrowUp}{ArrowDown}{PageUp}');
  expect(button('Friday, September 4, 2026')).toHaveFocus();
  await user.keyboard('{PageDown} ');
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 8, 28));
  expect(screen.getAllByRole('gridcell', { selected: true })).toHaveLength(7);
  await user.click(button('Previous month'));
  expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument();
  await user.click(button('Next month'));
  expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
});

it('reverses month ranges, previews hovered and focused periods, and submits both ends', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(<PeriodPicker mode="range" today={today} name="period" onValueChange={change} />);
  const field = screen.getByRole('combobox');
  await user.click(field);
  await user.click(button('Mar'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(change).not.toHaveBeenCalled();
  await user.hover(button('Jan'));
  expect(button('Feb').closest('td')).toHaveAttribute('data-in-range');
  button('Mar').focus();
  await user.keyboard('{ArrowLeft}{ArrowLeft}');
  expect(button('Jan')).toHaveFocus();
  expect(button('Feb').closest('td')).toHaveAttribute('data-in-range');
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenLastCalledWith({ start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) });
  expect(field).toHaveValue('Jan 2026 – Mar 2026');
  expect(container.querySelector('[name="period-start"]')).toHaveValue('2026-01');
  expect(container.querySelector('[name="period-end"]')).toHaveValue('2026-03');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(field);
  await user.click(button('Apr'));
  await user.keyboard('{Escape}');
  expect(field).toHaveValue('Jan 2026 – Mar 2026');
});

it('inline ranges report the open start and complete whole-period end', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <PeriodCalendar mode="range" granularity="week" locale="en" today={new Date(2026, 8, 30)} onValueChange={change} />,
  );
  await user.click(button('Wednesday, September 30, 2026'));
  expect(change).toHaveBeenLastCalledWith({ start: new Date(2026, 8, 28), end: null });
  await user.click(button('Monday, September 21, 2026'));
  expect(change).toHaveBeenLastCalledWith({ start: new Date(2026, 8, 21), end: new Date(2026, 9, 4) });
  expect(button('Tuesday, September 29, 2026').closest('td')).toHaveAttribute('data-in-range');
});

it.each([
  ['single', 'en', 'Last quarter', new Date(2026, 6, 1)],
  ['range', 'en', 'Last quarter', { start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) }],
  ['single', 'es', 'El trimestre pasado', new Date(2026, 6, 1)],
] as const)('default last-quarter preset in %s mode (%s)', async (mode, locale, name, expected) => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    mode === 'range' ? (
      <PeriodPicker mode="range" locale={locale} granularity="quarter" today={today} onValueChange={change} />
    ) : (
      <PeriodPicker locale={locale} granularity="quarter" today={today} onValueChange={change} />
    ),
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByRole('button', { name }));
  expect(change).toHaveBeenLastCalledWith(expected);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it.each([
  ['week', 'This week', 'Last week', new Date(2026, 9, 5), new Date(2026, 9, 11)],
  ['month', 'This month', 'Last month', new Date(2026, 8, 1), new Date(2026, 8, 30)],
  ['year', 'This year', 'Last year', new Date(2025, 0, 1), new Date(2025, 11, 31)],
] as const)('%s defaults are this and last complete period', async (granularity, thisLabel, lastLabel, start, end) => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodPicker mode="range" granularity={granularity} today={today} onValueChange={change} />);
  await user.click(screen.getByRole('combobox'));
  const group = await screen.findByRole('group', { name: 'Period presets' });
  expect(
    within(group)
      .getAllByRole('button')
      .map((b) => b.textContent),
  ).toEqual([thisLabel, lastLabel]);
  await user.click(button(lastLabel));
  expect(change).toHaveBeenLastCalledWith({ start, end });
});

it('uses custom presets and allows hiding them', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <PeriodPicker
      today={today}
      onValueChange={change}
      presets={[{ id: 'march', label: 'Reporting month', value: () => new Date(2026, 2, 1) }]}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByRole('button', { name: 'Reporting month' }));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
  rerender(<PeriodPicker today={today} presets={[]} />);
  await user.click(screen.getByRole('combobox'));
  expect(screen.queryByRole('group', { name: 'Period presets' })).not.toBeInTheDocument();
});

it('disabled periods remain focusable but cannot be selected by Enter, Space or click', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <PeriodCalendar
      today={today}
      min={new Date(2026, 1, 15)}
      max={new Date(2026, 5, 30)}
      isPeriodDisabled={(date) => date.getMonth() === 2}
      onValueChange={change}
    />,
  );
  for (const name of ['Jan', 'Mar', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) {
    expect(button(name)).toHaveAttribute('aria-disabled', 'true');
  }
  await user.click(button('Jun'));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 5, 1));
  await user.keyboard('{ArrowRight}');
  expect(button('Jul')).toHaveFocus();
  expect(button('Jul')).toHaveAttribute('tabindex', '0');
  await user.keyboard('{Enter} ');
  await user.click(button('Jul'));
  await user.click(button('Jan'));
  await user.click(button('Mar'));
  expect(change).toHaveBeenCalledTimes(1);
  // Partial overlap with min is selectable: the period does not end before min.
  await user.click(button('Feb'));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 1, 1));
});

it('disabled fields do not open; invalid is exposed; presets obey period bounds', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(<PeriodPicker disabled invalid today={today} onValueChange={change} />);
  const field = screen.getByRole('combobox');
  expect(field).toHaveAttribute('aria-invalid', 'true');
  await user.click(field);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<PeriodPicker invalid today={today} max={new Date(2026, 5, 30)} onValueChange={change} />);
  await user.click(field);
  const last = await screen.findByRole('button', { name: 'Last month' });
  expect(last).toHaveAttribute('aria-disabled', 'true');
  await user.click(last);
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('mirrors horizontal arrows under inherited RTL direction and flips navigation icons', async () => {
  const user = userEvent.setup();
  render(
    <div dir="rtl">
      <style>{'[dir="rtl"] button { direction: rtl; }'}</style>
      <PeriodCalendar today={today} />
    </div>,
  );
  button('Oct').focus();
  await user.keyboard('{ArrowRight}');
  expect(button('Sep')).toHaveFocus();
  await user.keyboard('{ArrowLeft}');
  expect(button('Oct')).toHaveFocus();
  expect(button('Previous year').querySelector('svg')).toHaveClass('rtl:-scale-x-100');
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  it.each([
    ['month', BillingMonth],
    ['quarter range', QuarterRange],
    ['week', Week],
    ['year', Year],
  ] as const)(`%s example is axe-clean closed and open in ${theme}`, async (_name, Example) => {
    document.documentElement.dataset.theme = theme;
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
    document.documentElement.removeAttribute('data-theme');
  });
}

it.each(['{Enter}', ' '])(
  'field opens with %s, Tab leaves the grid and Escape restores the labelled field',
  async (key) => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel>Reporting period</FieldLabel>
        <PeriodPicker today={today} presets={[]} />
      </Field>,
    );
    const field = screen.getByRole('combobox', { name: 'Reporting period' });
    await user.tab();
    expect(field).toHaveFocus();
    await user.keyboard(key);
    await waitFor(() => expect(button('Oct')).toHaveFocus());
    await user.tab({ shift: true });
    expect(button('Next year')).toHaveFocus();
    await user.tab();
    expect(button('Oct')).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(field).toHaveFocus());
  },
);

it('uses provider translations and accepts controlled single and range values', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <I18nProvider locale="es">
      <PeriodPicker granularity="quarter" value={new Date(2026, 6, 1)} onValueChange={change} today={today} />
    </I18nProvider>,
  );
  const field = screen.getByRole('combobox');
  expect(field).toHaveValue('T3 2026');
  await user.click(field);
  await user.click(button('T2 2026'));
  expect(change).toHaveBeenLastCalledWith(new Date(2026, 3, 1));
  expect(field).toHaveValue('T3 2026');
  rerender(
    <I18nProvider locale="es">
      <PeriodPicker
        mode="range"
        granularity="quarter"
        value={{ start: new Date(2026, 6, 1), end: new Date(2026, 11, 31) }}
        today={today}
      />
    </I18nProvider>,
  );
  expect(field).toHaveValue('T3 2026 – T4 2026');
});

it('keeps the focused range preview when the pointer leaves the grid', async () => {
  const user = userEvent.setup();
  render(<PeriodCalendar mode="range" today={today} />);
  await user.click(button('Mar'));
  await user.keyboard('{ArrowLeft}{ArrowLeft}');
  expect(button('Jan')).toHaveFocus();
  expect(button('Feb').closest('td')).toHaveAttribute('data-in-range');
  await user.hover(button('May'));
  await user.unhover(button('May'));
  expect(button('Feb').closest('td')).toHaveAttribute('data-in-range');
});

it('drills week → month → year and returns to the matching day without selection', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<PeriodCalendar granularity="week" today={new Date(2026, 8, 30)} onValueChange={change} />);
  await user.click(button('September 2026'));
  expect(button('Sep')).toHaveFocus();
  await user.tab({ shift: true });
  await user.tab({ shift: true });
  expect(button('2026')).toHaveFocus();
  await user.keyboard(' ');
  expect(button('2026')).toHaveFocus();
  await user.click(button('2024'));
  expect(button('Sep')).toHaveFocus();
  await user.click(button('Feb'));
  expect(button('Thursday, February 29, 2024')).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
});
