import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Switch',
  group: 'Forms',
  status: 'stable',
  description:
    'On/off setting that applies immediately. Three sizes, optional inline label, works inside Field and Form. An explicit aria-label takes precedence over the visible label; keep both consistent for WCAG 2.5.3 (label in name). The optional invalid prop exposes aria-invalid and a destructive 1px track ring, checked or unchecked. Invalid Field also supplies this state. Pair invalid with a FieldError or description explaining how to correct the value; colour alone is insufficient. The loading prop marks a pending save: a spinner appears in the thumb, toggles are ignored, and the switch stays focusable with aria-busy and a visually hidden "Saving…" description (override with loadingLabel). checked stays as the app passes it, so the app picks optimistic or pessimistic updates and clears loading when the request settles. disabled wins over loading. Prefer size md or lg for toggles that call the server; the sm spinner is small.',
  // Invalid state is demonstrated in SwitchValidation; the loading state in SwitchSettingsPending (named so SwitchSettings stays the canonical first example).
  primitive: '@base-ui/react/switch',
  pattern: 'switch',
  keyboard: [
    ['Space', 'Toggles the switch'],
    ['Enter', 'Toggles the switch'],
    ['Tab', 'Moves focus to and from the switch'],
  ],
  dataAttributes: [
    ['data-invalid', 'root', 'The control value is invalid; the track shows a destructive ring.'],
    ['data-loading', 'root', 'A save is pending; toggles are ignored and the thumb shows a spinner.'],
    ['data-checked', 'root', 'The control is checked.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-checked', 'thumb', 'The control is checked.'],
    ['data-disabled', 'thumb', 'The control cannot be changed or activated.'],
  ],
  tokens: ['destructive', 'primary', 'secondary', 'background', 'focus-ring', 'muted-foreground'],
};
