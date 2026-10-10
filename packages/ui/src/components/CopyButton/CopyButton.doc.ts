import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'CopyButton',
  group: 'Actions',
  status: 'beta',
  description:
    'Copies a string, or the result of a (possibly async) getter, to the clipboard. Icon form (with tooltip) or labelled form, a "Copied" success state that resets after 2 s, a polite announcement (through LiveAnnouncer when present) and a fallback to execCommand when the Clipboard API is missing. Optional failureLabel and failureAnnouncement override failure feedback; failurePoliteness changes the LiveAnnouncer failure priority (assertive by default). `copyToClipboard` is exported too.',
  primitive: '@base-ui/react/button',
  pattern: 'button + status',
  keyboard: [
    ['Enter', 'Copies the value and announces "Copied to clipboard"'],
    ['Space', 'Copies the value and announces "Copied to clipboard"'],
    ['Tab', 'Moves focus to and from the button'],
  ],
  tokens: ['muted-foreground', 'secondary', 'primary-text', 'destructive-text', 'focus-ring'],
};
