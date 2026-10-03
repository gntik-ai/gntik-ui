import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'StatusTag',
  group: 'Display',
  status: 'stable',
  description: 'State pill with a dot (running, queued, paused, failed, draft…). The state → tone mapping is a prop-driven dictionary merged over generic defaults, so products add their own states without touching the component.',
  tokens: ['success', 'success-text', 'info', 'warning', 'warning-text', 'destructive', 'destructive-text', 'muted-foreground'],
};
