import { tv } from '../../utils/tv';

export const editableTextVariants = tv({
  slots: {
    root: 'inline-flex min-w-0 max-w-full flex-col align-baseline text-inherit font-[inherit]',
    preview:
      'cursor-text rounded-sm text-start text-inherit font-[inherit] whitespace-pre-wrap hover:bg-secondary/60 focus-ring',
    field: 'text-[length:inherit] leading-[inherit] font-[inherit]',
    error: 'mt-1 text-supporting font-normal whitespace-normal text-destructive-text',
  },
});
