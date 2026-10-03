import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Stepper',
  group: 'Navigation',
  status: 'beta',
  description:
    'Wizard progress as an ordered list of steps (complete · current · upcoming · error), horizontal or vertical, with optional descriptions. Completed steps can be made clickable to go back; `compact` collapses it to "Step 2 of 5" with a thin bar. The current step carries aria-current="step".',
  pattern: 'ordered list in a labelled navigation landmark',
  keyboard: [
    ['Tab', 'Moves between clickable (completed) steps; other steps are not focusable'],
    ['Enter / Space', 'Activates the focused completed step (onStepClick)'],
  ],
  tokens: ['primary', 'primary-foreground', 'primary-text', 'secondary', 'border', 'destructive', 'destructive-foreground', 'destructive-text', 'muted-foreground', 'focus-ring'],
};
