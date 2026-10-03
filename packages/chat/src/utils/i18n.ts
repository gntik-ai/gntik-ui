import { interpolate, useI18n, type MessageKey, type MessageVars } from '@gntik-ai/ui';

/**
 * English fallbacks for the chat keys added after the first `@gntik-ai/ui` release. The
 * strings live in the ui catalogs (en + es); these keep the pack readable when it runs
 * against an older `@gntik-ai/ui` whose catalog does not have them yet.
 */
const FALLBACK = {
  'chat.typing': '{author} is typing',
  'chat.feedback': 'Response feedback',
  'chat.feedbackTitle': 'What went wrong?',
  'chat.feedbackReason': 'Reason',
  'chat.feedbackComment': 'Comment (optional)',
  'chat.feedbackPlaceholder': 'Tell us more…',
  'chat.feedbackSubmit': 'Send feedback',
  'chat.feedbackThanks': 'Thanks for your feedback',
  'chat.feedbackCleared': 'Feedback removed',
  'chat.reasonInaccurate': 'Inaccurate',
  'chat.reasonUnhelpful': 'Not helpful',
  'chat.reasonIncomplete': 'Incomplete',
  'chat.reasonUnsafe': 'Harmful or unsafe',
  'chat.reasonOther': 'Other',
  'chat.regenerate': 'Regenerate',
  'chat.uploading': 'Uploading {name}',
  'chat.uploadFailed': 'Upload failed',
  'chat.retryUpload': 'Retry uploading {name}',
  'chat.dropFiles': 'Drop files to attach',
  'chat.fileTooLarge': '{name} is larger than {max}',
  'chat.fileTypeNotAllowed': '{name} is not an allowed file type',
  'chat.tooManyFiles': 'You can attach up to {max} files',
  'chat.model': 'Model',
  'chat.selectModel': 'Select a model',
  'chat.capabilityVision': 'Vision',
  'chat.capabilityTools': 'Tools',
  'chat.capabilityReasoning': 'Reasoning',
  'chat.capabilityFiles': 'Files',
  'chat.capabilityWeb': 'Web search',
  'chat.capabilityAudio': 'Audio',
  'chat.contextWindow': '{size} context',
  'chat.unavailable': 'Unavailable',
} as const;

export type ChatMessageKey = keyof typeof FALLBACK;

/** `useI18n()` plus `tc()`, a translator for the newer chat keys with English fallbacks. */
export function useChatI18n() {
  const i18n = useI18n();
  const tc = (key: ChatMessageKey, vars?: MessageVars) => {
    const out = i18n.t(key as MessageKey, vars);
    return out === key ? interpolate(FALLBACK[key], vars, i18n.locale) : out;
  };
  return { ...i18n, tc };
}
