import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'WizardLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Focus-mode shell for multi-step flows (onboarding, create project, import): no sidebar · top bar with the flow title and Exit · Stepper header · step body · Back / Next footer (Finish on the last step). Exit, or Escape anywhere inside the layout, asks for confirmation in an AlertDialog (`confirmExit`). Completed steps are clickable to go back. Below `lg` the Stepper collapses to "Step 2 of 5". Fills its container; `fullScreen` switches to `h-dvh`.',
  primitive: '@base-ui/react/alert-dialog (exit confirmation)',
  pattern: 'landmarks (header, labelled step nav, main, footer) + alertdialog',
  keyboard: [
    ['Tab', 'Skip link, Exit, completed steps, the step body, then Back and Next'],
    ['Enter / Space on Back / Next', 'Moves to the previous / next step (Finish on the last one)'],
    ['Escape', 'Opens the exit confirmation (keys inside portalled popups are ignored)'],
    ['Enter on Exit', 'Opens the exit confirmation; Leave confirms, Stay or Escape closes it'],
    ['Tab / Enter on the Stepper', 'Moves between completed steps; Enter goes back to one'],
  ],
  tokens: ['background', 'foreground', 'card', 'border', 'primary', 'muted-foreground', 'focus-ring'],
};
