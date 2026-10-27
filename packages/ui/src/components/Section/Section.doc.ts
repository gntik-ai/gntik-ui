import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Section',
  group: 'Layout',
  status: 'stable',
  description:
    'A painted content region (<section>, named by its title). Variants plain / card / muted, padding none–lg (scalar or per-breakpoint object from base through 2xl), optional dividers between children, and a header slot with title, description and actions. Responsive padding updates root, header, body and divided header spacing together. Scalar lg remains p-6 sm:p-8; an explicit sm entry overrides sm:p-8. Static literal tables keep every class visible to Tailwind.',
  pattern: 'region',
  tokens: [
    'card',
    'card-foreground',
    'secondary',
    'border',
    'foreground',
    'muted-foreground',
    'shadow-sm',
    'radius-xl',
  ],
};
