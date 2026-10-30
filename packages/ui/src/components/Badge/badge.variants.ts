import { tv, type VariantProps } from '../../utils/tv';

/**
 * Tone × variant matrix. Text on a tinted surface uses the contrast-safe `*-text` aliases;
 * info and the category tones have no text alias, so they pair `text-foreground` with a
 * coloured dot instead of colouring the text itself.
 */
export const badgeVariants = tv({
  slots: {
    root: 'inline-flex max-w-full shrink-0 items-center gap-1.5 font-semibold whitespace-nowrap select-none',
    dot: 'size-1.5 shrink-0 rounded-full bg-tone',
    remove: [
      '-me-1 grid size-4 shrink-0 cursor-interactive place-items-center rounded text-current opacity-70 transition-colors motion-reduce:transition-none',
      'hover:bg-foreground/10 hover:opacity-100',
      'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    tone: {
      neutral: { root: '[--badge-bg-alpha:16%] [--badge-border-alpha:45%]' },
      primary: { root: '[--badge-bg-alpha:14%] [--badge-border-alpha:45%]' },
      success: { root: '[--badge-bg-alpha:15%] [--badge-border-alpha:45%]' },
      warning: { root: '[--badge-bg-alpha:16%] [--badge-border-alpha:50%]' },
      destructive: { root: '[--badge-bg-alpha:15%] [--badge-border-alpha:45%]' },
      info: { root: '[--badge-bg-alpha:15%] [--badge-border-alpha:45%]' },
      violet: { root: '[--badge-bg-alpha:18%] [--badge-border-alpha:45%]' },
      cyan: { root: '[--badge-bg-alpha:18%] [--badge-border-alpha:45%]' },
      amber: { root: '[--badge-bg-alpha:20%] [--badge-border-alpha:50%]' },
      rose: { root: '[--badge-bg-alpha:18%] [--badge-border-alpha:45%]' },
    },
    variant: {
      soft: { root: 'bg-tone/(--badge-bg-alpha) text-tone-chip-text' },
      outline: { root: 'border border-tone/(--badge-border-alpha) bg-transparent text-tone-text' },
      solid: { dot: 'bg-current' },
    },
    size: {
      /** Follows `data-density` (comfortable = md). */
      auto: { root: 'h-chip px-2.5 font-mono text-[10.5px]' },
      sm: { root: 'h-5 px-2 font-mono text-[10px]' },
      md: { root: 'h-[22px] px-2.5 font-mono text-[10.5px]' },
      lg: { root: 'h-6 px-2.5 text-[11.5px]' },
    },
    shape: {
      rounded: { root: 'rounded-md' },
      pill: { root: 'rounded-full' },
    },
  },
  compoundVariants: [
    { variant: 'outline', tone: 'neutral', class: { root: 'border-border text-muted-foreground' } },
    // solid — tone fill with its paired foreground. Category tones have no paired
    // foreground that holds contrast in every theme, so solid = a stronger tint.
    { variant: 'solid', tone: 'neutral', class: { root: 'bg-foreground text-background' } },
    { variant: 'solid', tone: 'primary', class: { root: 'bg-primary text-primary-foreground' } },
    { variant: 'solid', tone: 'success', class: { root: 'bg-success text-primary-foreground' } },
    { variant: 'solid', tone: 'warning', class: { root: 'bg-warning text-primary-foreground' } },
    { variant: 'solid', tone: 'destructive', class: { root: 'bg-destructive text-destructive-foreground' } },
    { variant: 'solid', tone: 'info', class: { root: 'bg-info text-background' } },
    {
      variant: 'solid',
      tone: 'violet',
      class: { root: 'bg-category-violet/30 text-foreground', dot: 'bg-category-violet' },
    },
    { variant: 'solid', tone: 'cyan', class: { root: 'bg-category-cyan/30 text-foreground', dot: 'bg-category-cyan' } },
    {
      variant: 'solid',
      tone: 'amber',
      class: { root: 'bg-category-amber/32 text-foreground', dot: 'bg-category-amber' },
    },
    { variant: 'solid', tone: 'rose', class: { root: 'bg-category-rose/30 text-foreground', dot: 'bg-category-rose' } },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft', size: 'auto', shape: 'rounded' },
});

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export type BadgeTone = NonNullable<BadgeVariantProps['tone']>;
