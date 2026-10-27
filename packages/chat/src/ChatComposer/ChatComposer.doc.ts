import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatComposer',
  group: 'Forms',
  status: 'beta',
  description:
    'Chat input with autosizing text, validated attachments, a model picker, tools, a counter and streaming Stop. Optional submitMode="mod+enter" lets Enter add a line and Ctrl/Meta+Enter send; the default remains Enter to send. Both modes ignore IME composition. header renders above attachments (use ChatComposerHeader with title, optional onClose and children); prefix sits at the inline start of the text row, following LTR/RTL direction; footer sits below the toolbar and above the hint. readOnly keeps text focusable and selectable without dimming, disables sending and hides attachment editing; Stop still works. actionsRef exposes focus(start/end/all), insert(text, cursor/start/end), clear() and getValue(); the normal ref still points to the textarea. insert replaces the selection and restores the caret after rendering: controlled parents must apply onValueChange synchronously (debounced updates can lose the caret). clear removes text only, keeping attachments. With none of the new props set, the DOM and keyboard behavior are unchanged. Examples show quote reply with a header and one chip, text actions, multiline submission and read-only drafts.',
  keyboard: [
    [
      'Enter (submitMode=enter, default)',
      'Sends the message (ignored while streaming, read-only or during IME composition)',
    ],
    ['Shift+Enter', 'Inserts a new line'],
    ['Enter (submitMode=mod+enter)', 'Inserts a new line'],
    [
      'Ctrl+Enter / Meta+Enter (submitMode=mod+enter)',
      'Sends once (both modifiers work on every platform; ignored during IME composition, streaming or read-only)',
    ],
    ['Escape', 'While a reply streams: stops it'],
    [
      'Tab',
      'Moves through the header, attachment Retry/Remove buttons, the text box, attach, tools, the model picker and Send/Stop',
    ],
    ['Ctrl/⌘+V', 'In the text box: pasted files are attached (validated) instead of inserted'],
  ],
  tokens: [
    'card',
    'destructive-chip-text',
    'primary-text',
    'border',
    'primary',
    'ring',
    'secondary',
    'muted-foreground',
    'destructive-text',
    'focus-ring',
  ],
};
