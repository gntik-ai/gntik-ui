import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Clipboard',
  group: 'Actions',
  status: 'stable',
  description:
    'useClipboard({ timeout = 2000, announce = false, onCopy, onError }) returns { copy, status, copied, error, reset }. Import from @gntik-ai/ui. copy(textOrGetter) resolves a boolean and never rejects; synchronous or asynchronous getters run lazily. All writes use the shared Clipboard API and execCommand fallback. Only the latest call updates feedback; callbacks report each settled copy while mounted. Reset and unmount invalidate pending feedback. Success and failure last timeout ms; timeout: 0 keeps them until reset(). With announce: true inside LiveAnnouncer, success is polite and failure assertive using the active i18n catalog. Outside LiveAnnouncer, copying still works without announcements. The row menu demonstrates Copy ID and Copy as cURL, including an async getter and focus restoration after closing the menu.',
};
