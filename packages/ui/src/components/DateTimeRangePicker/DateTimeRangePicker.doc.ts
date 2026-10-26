import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DateTimeRangePicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Time range field for logs and metrics: quick presets (last 15 minutes, 1 hour, 24 hours, 7 days, 30 days, custom), a relative "Last N minutes/hours/days" mode and an absolute mode with a range Calendar plus start and end TimePickers, validated so the end is after the start. The value is serialisable: `{ mode: "relative", amount, unit }` or `{ mode: "absolute", start, end }`; `resolveTimeRange` turns it into instants. `timeZone` (IANA, UTC or system) defaults to I18nProvider then the browser; invalid names fall back to the browser. Absolute calendar days, today, min/max, time segments and edits use the zone, with compatible DST disambiguation (gaps move forward; overlaps choose the earlier instant). Non-system zones appear in the field text and start/end labels; `hideTimeZone` removes those labels. Relative presets remain instant-based and hidden start/end inputs remain ISO instants. DateTimeRangePickerUtc demonstrates UTC absolute editing and hidden zone labels.',
  primitive: '@base-ui/react/popover + Calendar, TimePicker, NumberInput, Select, ToggleGroup',
  pattern: 'combobox with a dialog popup',
  keyboard: [
    ['Enter / Space', 'On the field: opens the popup with focus on the active preset'],
    ['Tab / Shift+Tab', 'Moves through presets, the mode switch, the editors and Apply'],
    [
      'Enter / Space',
      'On a preset: applies it and closes; on Custom range: switches to absolute mode and focuses the calendar',
    ],
    ['ArrowLeft / ArrowRight', 'In the mode switch: moves between Relative and Absolute'],
    [
      'Arrow keys / PageUp / PageDown',
      'In the calendar: move between days (see Calendar); in the time fields: spin (see TimePicker)',
    ],
    ['Escape', 'Closes the popup without applying and returns focus to the field'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'popover',
    'primary',
    'primary-chip-text',
    'secondary',
    'destructive-text',
    'focus-ring',
  ],
};
