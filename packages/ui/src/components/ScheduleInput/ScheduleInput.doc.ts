import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ScheduleInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Cron schedule editor: presets (hourly at minute, daily at, weekly on days at, monthly on day at) that write a 5-field cron expression, plus a raw cron field (*, lists, ranges, steps, names, macros) with validation and an error message, a plain-language summary ("Every weekday at 09:00") and the next runs in a time zone. Pure helpers: parseCron, describeCron, nextRuns.',
  primitive: '@base-ui/react/toggle-group + Field, Input, NumberInput, TimePicker',
  pattern: 'group of form controls (segmented control, textbox, spinbuttons)',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves between the frequency tabs, the preset fields and the cron field'],
    ['ArrowLeft / ArrowRight', 'In the frequency or weekday group: moves between options'],
    ['Enter / Space', 'Picks the focused frequency, or toggles the focused weekday'],
    ['ArrowUp / ArrowDown', 'In the minute, day or time fields: steps the value'],
    ['Type in the cron field', 'Re-validates, updates the summary and the next runs, and selects the preset that fits'],
  ],
  tokens: ['background', 'border', 'card', 'foreground', 'muted-foreground', 'primary', 'secondary', 'destructive-text', 'focus-ring'],
};
