import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'StatusDot',
  group: 'Display',
  status: 'beta',
  description: 'State dot with an optional label and a soft pulse for live states (disabled under reduced motion). Tones: success, warning, destructive, info, neutral, primary — generic, with no product-specific states. Without a label it needs an aria-label (exposed as an image) so colour is never the only signal.',
  pattern: 'img (when unlabelled)',
  tokens: ['success', 'warning', 'destructive', 'info', 'muted-foreground', 'primary', 'foreground'],
};
