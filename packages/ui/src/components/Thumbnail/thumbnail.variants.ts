import { tv, type VariantProps } from '../../utils/tv';

export const thumbnailVariants = tv({
  slots: {
    root: 'group relative m-0 flex w-36 flex-col overflow-hidden rounded-lg border bg-card shadow-sm',
    preview: 'relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary/60',
    image: 'size-full object-cover',
    icon: 'text-muted-foreground',
    ext: 'absolute start-2 bottom-2 rounded-[4px] bg-card px-1 font-mono text-[9.5px] font-semibold tracking-wide text-muted-foreground',
    shimmer: 'pointer-events-none absolute inset-0 animate-pulse bg-foreground/6 motion-reduce:animate-none',
    caption: 'grid gap-0.5 px-2.5 py-2 text-start',
    name: 'truncate text-[12.5px] font-medium text-foreground',
    meta: 'truncate font-mono text-[10.5px] text-muted-foreground',
    progress: 'absolute inset-x-0 bottom-0 h-1 bg-secondary',
    progressBar: 'block h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none',
    remove: [
      'absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-md border border-border bg-card/90 text-muted-foreground shadow-sm transition-colors',
      'hover:bg-secondary hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    retry: 'underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm',
    list: 'm-0 flex list-none flex-wrap gap-3 p-0',
  },
  variants: {
    status: {
      idle: { root: 'border-border' },
      uploading: { root: 'border-border' },
      done: { root: 'border-border' },
      error: { root: 'border-destructive/50', preview: 'bg-destructive/10', icon: 'text-destructive-text', meta: 'text-destructive-text' },
    },
  },
  defaultVariants: { status: 'idle' },
});

export type ThumbnailVariantProps = VariantProps<typeof thumbnailVariants>;
