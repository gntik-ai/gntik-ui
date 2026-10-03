import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'InfoTip',
  group: 'Overlays',
  status: 'beta',
  description: 'Inline "i" help button that opens a small popover with an explanation, next to a form label, a stat or a table header. Named "More information about {label}"; works with click, keyboard and (optionally) hover, so the help is never hover-only.',
  primitive: '@base-ui/react/popover',
  pattern: 'disclosure (non-modal dialog)',
  keyboard: [
    ['Tab', 'Focuses the info button'],
    ['Enter', 'Opens the help popover (Space too)'],
    ['Escape', 'Closes the popover and returns focus to the button'],
  ],
  tokens: ['muted-foreground', 'foreground', 'popover', 'popover-foreground', 'border', 'focus-ring'],
};
