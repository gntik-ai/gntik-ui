import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Calendar',
  group: 'Forms',
  status: 'beta',
  description:
    'Month grid for picking a day or a range: today marker, disabled dates, min/max bounds, locale-aware month and weekday names (Intl), configurable week start, one or two months side by side. No date library: native Date + Intl.',
  pattern: 'grid (date picker dialog calendar)',
  keyboard: [
    ['ArrowLeft / ArrowRight', 'Moves focus to the previous / next day'],
    ['ArrowUp / ArrowDown', 'Moves focus to the same day in the previous / next week'],
    ['PageUp / PageDown', 'Moves focus to the same day in the previous / next month (Shift: year)'],
    ['Home / End', 'Moves focus to the first / last day of the week'],
    ['Enter / Space', 'Selects the focused day (range: first press sets the start, second the end)'],
  ],
  tokens: ['foreground', 'muted-foreground', 'primary', 'primary-foreground', 'secondary', 'focus-ring'],
};
