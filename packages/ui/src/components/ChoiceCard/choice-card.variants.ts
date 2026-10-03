import { tv, type VariantProps } from '../../utils/tv';

const SURFACE = [
  'relative flex items-start gap-3.5 rounded-md border border-border bg-background px-4 py-3.5 text-start transition-colors motion-reduce:transition-none',
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
];

/** Shared text slots of both cards. */
const TEXT = {
  icon: 'grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground [&_svg]:size-4.5',
  body: 'min-w-0 flex-1',
  title: 'block text-[13px] leading-5 font-semibold text-foreground',
  description: 'mt-0.5 block text-[12px] leading-5 text-muted-foreground text-pretty',
  meta: 'mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground',
};

export const clickableCardVariants = tv({
  slots: {
    root: [...SURFACE, 'hover:border-muted-foreground/40 hover:bg-secondary/30', 'data-disabled:opacity-60 data-disabled:hover:border-border data-disabled:hover:bg-background'],
    ...TEXT,
    /** The link/button; its ::after covers the card so the whole surface is clickable. */
    action: [
      'cursor-pointer text-start outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[""]',
      'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
    ],
    chevron: 'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-hover/card:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-0.5',
  },
});

export const selectableCardVariants = tv({
  slots: {
    group: 'grid gap-3',
    root: [
      ...SURFACE,
      'cursor-pointer hover:border-muted-foreground/40 has-[[data-checked]]:border-primary/60 has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-primary/20',
      'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-60 has-[[data-disabled]]:hover:border-border',
    ],
    ...TEXT,
    control: [
      'mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center border border-border bg-background outline-none',
      'transition-colors motion-reduce:transition-none data-checked:border-primary data-checked:bg-primary',
    ],
    indicator: 'flex items-center justify-center text-primary-foreground data-unchecked:hidden',
  },
  variants: {
    type: {
      radio: { control: 'rounded-full', indicator: 'size-1.5 rounded-full bg-primary-foreground' },
      checkbox: { control: 'rounded-[5px]' },
    },
    columns: {
      1: { group: 'grid-cols-1' },
      2: { group: 'sm:grid-cols-2' },
      3: { group: 'sm:grid-cols-3' },
    },
  },
  defaultVariants: { type: 'radio', columns: 1 },
});

export type SelectableCardVariantProps = VariantProps<typeof selectableCardVariants>;
