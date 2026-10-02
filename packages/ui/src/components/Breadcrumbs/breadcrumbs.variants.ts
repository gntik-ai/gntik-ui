import { tv, type VariantProps } from '../../utils/tv';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export const breadcrumbsVariants = tv({
  slots: {
    root: 'min-w-0',
    list: 'flex flex-wrap items-center gap-2.5 text-[13px]',
    item: 'inline-flex min-w-0 items-center gap-2.5',
    link: ['truncate rounded-sm text-muted-foreground no-underline transition-colors hover:text-foreground hover:no-underline', focusRing],
    iconLink: [
      'grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground',
      focusRing,
    ],
    current: 'truncate font-semibold text-foreground',
    separator: 'inline-flex shrink-0 select-none text-muted-foreground/40',
    ellipsis: [
      'grid h-7 cursor-pointer place-items-center rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground',
      focusRing,
    ],
  },
  variants: {
    separator: {
      chevron: {},
      slash: {},
    },
  },
  defaultVariants: { separator: 'chevron' },
});

export type BreadcrumbsVariantProps = VariantProps<typeof breadcrumbsVariants>;
