/** Slot classes for MessageFeedback. */
export const messageFeedbackStyles = {
  root: 'inline-flex items-center gap-0.5',
  up: 'text-primary-text',
  down: 'text-destructive-text',
  popup: 'w-80 max-w-[calc(100vw-2rem)]',
  form: 'flex flex-col gap-3',
  title: 'text-[13px] font-semibold text-foreground',
  label: 'mb-1.5 block text-[12.5px] font-medium text-foreground',
  footer: 'flex justify-end gap-2',
} as const;
