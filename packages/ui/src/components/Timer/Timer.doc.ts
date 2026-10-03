import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Timer',
  group: 'Display',
  status: 'beta',
  description:
    'Elapsed time since a start, live while running ("1:02:05" or compact "2m 14s"), with paused and stopped states. Renders role="timer" around a <time dateTime="PT…"> duration; silent by default, `announce` speaks it politely once a minute.',
  pattern: 'timer',
  keyboard: [['—', 'Not interactive; never takes focus']],
  tokens: ['foreground', 'muted-foreground', 'success', 'warning'],
};
