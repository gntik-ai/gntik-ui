import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'WizardLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Focus-mode shell: title and Exit, Stepper, step body, Back / Next and Finish. mode="page" is the unchanged default (container height, or fullScreen for h-dvh). mode="overlay" is a controlled Base UI modal: open/onOpenChange keep the parent page mounted without navigation; size defaults to "fullscreen" at every viewport, while "dialog" reuses Dialog xl sizing and fills mobile viewports. Use page for a dedicated flow, fullscreen for a focused in-page flow, or the dialog-wizard block (default "dialog") for a compact create flow. Closing never resets the consumer-controlled current step or data. Exit, Escape and Cancel on step zero use confirmExit (default true). Outside presses are ignored unless closeOnInteractOutside is true, then use the same exit confirmation. returnFocusRef overrides focus return to the opener. Each step focuses its heading, first control or body, then announces via a separate polite live region. Supply stepAnnouncement({position,total,label}) from your i18n (required for rich step labels); positions are one-based. All action labels, stepsSummaryLabel and pendingLabel are overridable with i18n fallbacks. finishPending or nextLoading disables Finish and shows pendingLabel in overlay mode. Below lg, Stepper uses its compact summary.',
  primitive: '@base-ui/react/dialog + @base-ui/react/alert-dialog (exit confirmation)',
  pattern: 'page landmarks or modal dialog with labelled step nav + nested alertdialog',
  keyboard: [
    ['Tab', 'Skip link, Exit, completed steps, the step body, then Back and Next'],
    ['Enter / Space on Back / Next', 'Moves to the previous / next step (Finish on the last one)'],
    ['Escape', 'Opens the exit confirmation (keys inside portalled popups are ignored)'],
    ['Enter on Exit', 'Opens the exit confirmation; Leave confirms, Stay or Escape closes it'],
    ['Tab / Enter on the Stepper', 'Moves between completed steps; Enter goes back to one'],
    ['Tab / Shift+Tab in overlay', 'Wraps inside the modal; closing returns focus to returnFocusRef or the opener'],
    ['Next / Back in overlay', 'Moves focus to the new step heading or first control, then politely announces the step'],
  ],
  tokens: ['background', 'foreground', 'card', 'border', 'primary', 'muted-foreground', 'focus-ring'],
};
