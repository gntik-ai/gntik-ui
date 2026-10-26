import { tv, type VariantProps } from '../../utils/tv';

export const periodPickerVariants = tv({
  slots: {
    calendar: 'inline-flex w-fit flex-col gap-2 p-3 text-foreground',
    header: 'flex items-center justify-between gap-2',
    title: 'flex-1 rounded-md px-2 py-1 text-center text-[13px] font-semibold hover:bg-secondary/70 focus-ring',
    panel: 'flex flex-col sm:flex-row',
    presets: 'flex flex-wrap gap-1 border-b border-border p-2 sm:w-36 sm:flex-col sm:border-e sm:border-b-0',
    preset:
      'rounded-md px-2.5 py-1.5 text-start text-[12.5px] text-foreground hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring aria-disabled:cursor-disabled aria-disabled:text-muted-foreground',
  },
});

export type PeriodPickerVariantProps = VariantProps<typeof periodPickerVariants>;
