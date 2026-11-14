import { tv } from '../../utils/tv';

/** `editable`: the segment group with the calendar button laid over its end padding. */
export const editableTriggerVariants = tv({
  slots: {
    root: 'relative flex w-full min-w-0 items-center',
    calendarButton: [
      'absolute end-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[5px] text-muted-foreground outline-none',
      'transition-colors motion-reduce:transition-none hover:bg-secondary/70 hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'data-popup-open:text-primary-chip-text disabled:cursor-disabled disabled:opacity-50 disabled:hover:bg-transparent',
    ],
  },
});
