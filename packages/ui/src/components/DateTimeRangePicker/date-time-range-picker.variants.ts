import { tv, type VariantProps } from '../../utils/tv';

/**
 * Popup layout beside the shared date-field trigger and preset list (datePickerVariants):
 * a mode switch, then either the "Last N unit" row or the range calendar with start/end times.
 */
export const dateTimeRangePickerVariants = tv({
  slots: {
    body: 'flex min-w-0 flex-col gap-3 p-3',
    relativeRow: 'flex flex-wrap items-center gap-2',
    label: 'text-[12px] font-medium text-muted-foreground',
    times: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
    timeField: 'flex min-w-0 flex-col gap-1.5',
    error: 'text-[12px] font-medium text-destructive-text',
    footer: 'flex items-center justify-end gap-2',
  },
});

export type DateTimeRangePickerVariantProps = VariantProps<typeof dateTimeRangePickerVariants>;
