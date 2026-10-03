import { tv, type VariantProps } from '../../utils/tv';

export const stackedLayoutVariants = tv({
  slots: {
    root: 'relative flex w-full min-w-0 flex-col overflow-y-auto bg-background font-sans text-foreground',
    skip: 'focus:absolute',
    header: 'sticky top-0 z-20 shrink-0 border-b border-border/60 bg-chrome',
    bar: 'mx-auto flex h-[60px] w-full items-center gap-1 px-3 sm:px-4',
    brand: 'flex shrink-0 items-center px-1 lg:px-2',
    divider: 'mx-2 hidden h-6 w-px shrink-0 bg-border/70 lg:block',
    nav: 'hidden min-w-0 items-center gap-0.5 overflow-hidden lg:flex',
    navSlot: 'hidden min-w-0 items-center lg:flex',
    link: [
      'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors',
      'hover:bg-accent/45 hover:text-foreground motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent-foreground',
    ],
    actions: 'ms-auto flex shrink-0 items-center gap-2',
    mobile: 'lg:hidden',
    subnav: 'mx-auto w-full px-3 sm:px-4',
    pageHeader: 'shrink-0 border-b border-border/60 bg-card',
    pageHeaderInner: 'mx-auto w-full px-4 py-5 sm:px-6 lg:px-8',
    main: 'mx-auto w-full flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8',
    footer: 'shrink-0 border-t border-border/60',
    footerInner: 'mx-auto w-full px-4 py-4 text-[12px] text-muted-foreground sm:px-6 lg:px-8',
  },
  variants: {
    fullScreen: { true: { root: 'h-dvh' }, false: { root: 'h-full min-h-0' } },
    width: {
      narrow: { main: 'max-w-[640px]', pageHeaderInner: 'max-w-[640px]', footerInner: 'max-w-[640px]' },
      default: { main: 'max-w-[1120px]', pageHeaderInner: 'max-w-[1120px]', footerInner: 'max-w-[1120px]' },
      wide: { main: 'max-w-[1440px]', pageHeaderInner: 'max-w-[1440px]', footerInner: 'max-w-[1440px]' },
      full: {},
    },
  },
  defaultVariants: { fullScreen: false, width: 'default' },
});

export type StackedLayoutVariantProps = VariantProps<typeof stackedLayoutVariants>;
