import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Tour',
  group: 'Overlays',
  status: 'beta',
  description:
    'Onboarding steps anchored to elements (selector, ref or getter): a non-modal popover with a step counter and Back / Next / Skip, positioned at each target and outlined with the focus ring (no overlay, no glow). Focus moves into the step and returns when the tour ends; missing targets centre the step. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
  primitive: '@base-ui/react/popover',
  pattern: 'non-modal dialog (popover) per step',
  keyboard: [
    ['Tab / Shift+Tab', 'Cycles through the close button, Skip, Back and Next (focus stays in the step)'],
    ['Enter / Space', 'Activates the focused button (Next moves focus to the next step)'],
    ['ArrowRight / ArrowLeft', 'Next / previous step (mirrored in RTL)'],
    ['Escape', 'Ends the tour and returns focus'],
  ],
  dataAttributes: [
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-side', 'arrow', 'The attribute value specifies the placement side.'],
    ['data-current', 'dot', 'The item represents the current location.'],
  ],
  tokens: ['popover', 'popover-foreground', 'border', 'primary', 'primary-text', 'muted-foreground', 'focus-ring'],
};
