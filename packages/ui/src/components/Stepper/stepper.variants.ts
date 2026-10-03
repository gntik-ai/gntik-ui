import { tv, type VariantProps } from '../../utils/tv';

export const stepperVariants = tv({
  slots: {
    list: 'm-0 flex list-none p-0',
    item: 'relative flex',
    step: [
      'group flex rounded-lg text-left outline-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    indicator: 'relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold transition-colors motion-reduce:transition-none',
    text: 'flex min-w-0 flex-col',
    label: 'text-[12.5px] font-medium whitespace-nowrap',
    description: 'text-[11.5px] leading-snug text-muted-foreground',
    connector: 'overflow-hidden rounded-full bg-secondary',
    connectorFill: 'rounded-full bg-primary transition-[width,height] duration-300 motion-reduce:transition-none',
    compact: 'flex w-full flex-col gap-2',
    compactRow: 'flex items-baseline justify-between gap-3',
    compactCount: 'font-mono text-[11px] tracking-wide text-muted-foreground uppercase',
    compactLabel: 'text-[13px] font-semibold text-foreground',
    compactTrack: 'h-1 w-full overflow-hidden rounded-full bg-secondary',
    compactFill: 'h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none',
  },
  variants: {
    orientation: {
      horizontal: {
        list: 'w-full items-start',
        item: 'flex-1 items-start last:flex-none',
        step: 'flex-col items-center gap-2 px-1',
        text: 'items-center text-center',
        connector: 'mx-2 mt-[15px] h-0.5 flex-1',
        connectorFill: 'h-full',
      },
      vertical: {
        list: 'flex-col',
        item: 'flex-col',
        step: 'items-start gap-3 py-1 pr-2',
        text: 'pt-1.5',
        connector: 'my-1 ml-[15px] min-h-6 w-0.5',
        connectorFill: 'w-full',
      },
    },
    status: {
      complete: { indicator: 'bg-primary text-primary-foreground', label: 'text-foreground' },
      current: { indicator: 'bg-primary/14 text-primary-chip-text ring-2 ring-primary', label: 'font-semibold text-foreground' },
      upcoming: { indicator: 'bg-secondary text-muted-foreground ring-1 ring-border', label: 'text-muted-foreground' },
      error: { indicator: 'bg-destructive text-destructive-foreground', label: 'text-destructive-text' },
    },
    interactive: {
      true: { step: 'cursor-pointer', indicator: 'group-hover:bg-primary/85', label: 'group-hover:underline underline-offset-2' },
    },
  },
  defaultVariants: { orientation: 'horizontal', status: 'upcoming' },
});

export type StepperVariantProps = VariantProps<typeof stepperVariants>;
