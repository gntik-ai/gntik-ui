import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'LiveAnnouncer',
  group: 'Feedback',
  status: 'beta',
  description:
    'Screen-reader announcements for changes with no visible text: a polite (role="status") and an assertive aria-live region, plus `useAnnounce()` for any component below it. Used by KanbanBoard for pick-up / move / drop / cancel. Outside a LiveAnnouncer, `useAnnounce()` is a no-op. Set `enabled={false}` to omit the regions and mute announcements while preserving child state; the example toggles this with the Notifications button.',
  pattern: 'aria-live region (status)',
  tokens: [],
};
