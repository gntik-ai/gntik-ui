import { tv, type VariantProps } from '../../utils/tv';

export const docsLayoutVariants = tv({
  slots: {
    root: 'relative flex flex-col overflow-hidden bg-background font-sans text-foreground',
    skipLink: 'focus:absolute',
    header: 'flex h-12 shrink-0 items-center gap-3 border-b border-border bg-chrome px-4',
    body: 'flex min-h-0 flex-1',
    nav: 'hidden w-60 shrink-0 overflow-y-auto border-e border-border px-3 py-6 lg:block',
    main: 'min-w-0 flex-1 overflow-y-auto outline-none',
    column: 'mx-auto w-full max-w-3xl px-4 py-8 sm:px-8',
    mobileToc: 'mb-6 rounded-lg border border-border bg-card px-3 lg:hidden',
    article: 'min-w-0',
    footer: 'mt-12 border-t border-border pt-6',
    toc: 'hidden w-56 shrink-0 overflow-y-auto py-8 pe-4 ps-2 lg:block',
  },
  variants: {
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { fullScreen: false },
});

export const outlineVariants = tv({
  slots: {
    root: 'flex flex-col gap-2',
    heading: 'px-2 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase',
    list: 'm-0 flex list-none flex-col border-s border-border p-0',
    link: [
      '-ms-px block border-s-2 border-transparent py-1 pe-2 text-[12.5px] leading-snug text-muted-foreground',
      'transition-colors hover:text-foreground motion-reduce:transition-none',
      'aria-[current=location]:border-primary aria-[current=location]:font-medium aria-[current=location]:text-primary-text',
      'rounded-e-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    level: {
      2: { link: 'ps-3' },
      3: { link: 'ps-6' },
    },
  },
  defaultVariants: { level: 2 },
});

export type DocsLayoutVariantProps = VariantProps<typeof docsLayoutVariants>;
export type OutlineVariantProps = VariantProps<typeof outlineVariants>;
