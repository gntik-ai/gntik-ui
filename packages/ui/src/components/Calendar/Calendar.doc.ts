import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Calendar',
  group: 'Forms',
  status: 'beta',
  description:
    'Day or range selection with one or two months, inclusive min/max bounds and Intl names. The clickable month heading opens a month grid, then the year heading opens a shared 12-year page (2020–2031 for 2026). Set maxView="day" for the previous static header, or "month" to stop at months; the default is "year". Optional view/defaultView/onViewChange control or report the view (initially "day"). captionLayout="select" uses labelled kit month/year selects; yearRange={from,to} defaults to the current year ±10, clipped to min/max and including the visible year. Picking a month returns to days, preserving and clamping the focused day, and calls onMonthChange once with the first day. DatePicker and DateRangePicker forward maxView and captionLayout and reopen in the day view.',
  pattern: 'grid (date picker dialog calendar)',
  keyboard: [
    ['Day: ArrowLeft / ArrowRight', 'Moves focus to the previous / next day (reversed in RTL)'],
    ['Day: ArrowUp / ArrowDown', 'Moves focus to the same day in the previous / next week'],
    ['Day: PageUp / PageDown', 'Moves focus to the same day in the previous / next month (Shift: year)'],
    ['Day: Home / End', 'Moves focus to the first / last day of the week'],
    ['Day: Enter / Space', 'Selects the focused day (range: first press sets the start, second the end)'],
    ['Month: ArrowLeft / ArrowRight', 'Moves one month (reversed in RTL)'],
    ['Month: ArrowUp / ArrowDown', 'Moves three months'],
    ['Month: Home / End', 'Moves to the first / last month of the row'],
    ['Month: PageUp / PageDown', 'Moves one year'],
    ['Month: Enter / Space', 'Opens the day view of the focused month; disabled months do nothing'],
    ['Year: ArrowLeft / ArrowRight', 'Moves one year (reversed in RTL)'],
    ['Year: ArrowUp / ArrowDown', 'Moves three years'],
    ['Year: Home / End', 'Moves to the first / last year of the row'],
    ['Year: PageUp / PageDown', 'Moves twelve years'],
    ['Year: Enter / Space', 'Opens the month view of the focused year; disabled years do nothing'],
    ['Heading: Enter / Space', 'Opens the month view, then year view, up to maxView'],
    ['Popup: Escape', 'Closes the date picker and returns focus to its field from any view'],
  ],
  tokens: ['foreground', 'muted-foreground', 'primary', 'primary-foreground', 'secondary', 'focus-ring'],
};
