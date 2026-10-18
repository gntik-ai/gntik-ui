import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PeriodPicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Whole ISO weeks, months, calendar quarters or years, single or range. PeriodPicker is a field and Base UI popover; PeriodCalendar is inline. Single values are the first day of a whole period at local midnight, not a single-day selection. Ranges include the last day of the final period. Weeks always run Monday–Sunday and use the ISO week-year, regardless of locale. Month names use Intl; quarter/week labels and presets use the en/es i18n catalogs. Form values: YYYY-MM, YYYY-Qn, YYYY or YYYY-Www; ranges submit <name>-start and <name>-end. Defaults are this and last complete period; presets=[] hides them. Min/max compare period overlap; disabled periods remain focusable. Range fields apply on the second pick; Escape discards an unfinished range. Calendar and DatePicker remain day-only.',
  primitive: '@base-ui/react/popover + internal Calendar period grids',
  pattern: 'combobox with a dialog popup; inline grid with roving tabindex',
  keyboard: [
    ['Enter / Space (field)', 'Opens the popup and focuses the selected period or today'],
    ['Tab / Shift+Tab', 'One tab stop inside each grid; other controls and presets remain in the tab order'],
    ['ArrowLeft / ArrowRight', 'Moves one cell, crossing year/page boundaries; mirrored in RTL'],
    ['ArrowUp / ArrowDown', 'Moves one row: three months/years, four quarters, or seven days'],
    ['Home / End', 'Moves to the first/last cell of the row (ISO Monday/Sunday for weeks)'],
    [
      'PageUp / PageDown',
      'Months/quarters: same period in the previous/next year; years: 12-year page; weeks: month (Shift: year)',
    ],
    ['Enter / Space (grid)', 'Selects the period (range: start then end); aria-disabled cells cannot be selected'],
    ['Enter / Space (title)', 'Drills up: weeks → months → years; picking a coarser cell returns with focus restored'],
    [
      'Enter / Space (previous/next)',
      'Moves one visible page: month for weeks, year for months/quarters, 12 years for years',
    ],
    ['Escape', 'Closes the popup and returns focus to the field without applying an unfinished range'],
  ],
  tokens: [
    'background',
    'foreground',
    'muted-foreground',
    'border',
    'primary',
    'primary-foreground',
    'secondary',
    'popover',
    'focus-ring',
  ],
};
