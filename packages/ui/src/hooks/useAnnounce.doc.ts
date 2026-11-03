import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useAnnounce',
  status: 'stable',
  description:
    'Returns the announce function of the nearest LiveAnnouncer: announce(message) is polite, announce(message, "assertive") interrupts. Import useAnnounce from @gntik-ai/ui/hooks and render LiveAnnouncer from @gntik-ai/ui above the component. Repeating a message announces it again. Use it for changes with no visible text, such as background saves or reorders. Outside a LiveAnnouncer it is a no-op, so components can call it unconditionally.',
  signature: 'useAnnounce(): (message, politeness?) => void',
  server:
    'Returns the announce function, or a no-op outside a LiveAnnouncer; nothing is announced while rendering (`Announcements sent: 0` in the example).',
};
