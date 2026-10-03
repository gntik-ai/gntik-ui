import { tv, type VariantProps } from '../../utils/tv';

export const authLayoutVariants = tv({
  slots: {
    root: 'relative flex overflow-hidden font-sans text-foreground',
    skipLink: 'focus:absolute',
    main: 'flex min-w-0 flex-1 flex-col items-center overflow-y-auto p-7 outline-none sm:p-10',
    column: 'my-auto flex w-full flex-col',
    logo: 'mb-8 flex',
    surface: 'w-full',
    footer: 'mt-7 text-center text-[13px] text-muted-foreground',
    brand: 'relative hidden w-[46%] max-w-[640px] shrink-0 flex-col justify-between gap-10 overflow-y-auto border-e border-border/60 bg-chrome p-12 lg:order-first lg:flex',
    brandBody: 'max-w-[420px]',
    brandFooter: 'font-mono text-[11.5px] text-muted-foreground',
  },
  variants: {
    variant: {
      split: {
        root: 'bg-background',
        column: 'max-w-[392px]',
        logo: 'lg:hidden',
      },
      card: {
        root: 'bg-background',
        column: 'max-w-[420px] items-center',
        surface: 'rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm',
        logo: 'justify-center',
      },
      'full-bleed': {
        root: 'bg-chrome',
        main: 'items-stretch',
        column: 'mx-auto max-w-[420px]',
      },
    },
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { variant: 'split', fullScreen: false },
});

export type AuthLayoutVariantProps = VariantProps<typeof authLayoutVariants>;
