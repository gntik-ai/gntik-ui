import { tv, type VariantProps } from '../../utils/tv';

/**
 * Tone × variant matrix. Text on a tinted surface uses the contrast-safe `*-text` aliases;
 * info and the category tones have no text alias, so they pair `text-foreground` with a
 * coloured dot instead of colouring the text itself.
 */
export const badgeVariants = tv({
  slots: {
    root: 'inline-flex max-w-full shrink-0 items-center gap-1.5 font-semibold whitespace-nowrap select-none',
    dot: 'size-1.5 shrink-0 rounded-full',
    remove: [
      '-me-1 grid size-4 shrink-0 cursor-pointer place-items-center rounded text-current opacity-70 transition-colors motion-reduce:transition-none',
      'hover:bg-foreground/10 hover:opacity-100',
      'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    tone: {
      neutral: { dot: 'bg-muted-foreground' },
      primary: { dot: 'bg-primary' },
      success: { dot: 'bg-success' },
      warning: { dot: 'bg-warning' },
      destructive: { dot: 'bg-destructive' },
      info: { dot: 'bg-info' },
      violet: { dot: 'bg-category-violet' },
      cyan: { dot: 'bg-category-cyan' },
      amber: { dot: 'bg-category-amber' },
      rose: { dot: 'bg-category-rose' },
    },
    variant: {
      soft: {},
      outline: { root: 'border bg-transparent' },
      solid: { dot: 'bg-current' },
    },
    size: {
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
    // soft
    { variant: 'soft', tone: 'neutral', class: { root: 'bg-muted-foreground/16 text-foreground' } },
    { variant: 'soft', tone: 'primary', class: { root: 'bg-primary/14 text-primary-chip-text' } },
    { variant: 'soft', tone: 'success', class: { root: 'bg-success/15 text-success-chip-text' } },
    { variant: 'soft', tone: 'warning', class: { root: 'bg-warning/16 text-warning-chip-text' } },
    { variant: 'soft', tone: 'destructive', class: { root: 'bg-destructive/15 text-destructive-chip-text' } },
    { variant: 'soft', tone: 'info', class: { root: 'bg-info/15 text-foreground' } },
    { variant: 'soft', tone: 'violet', class: { root: 'bg-category-violet/18 text-foreground' } },
    { variant: 'soft', tone: 'cyan', class: { root: 'bg-category-cyan/18 text-foreground' } },
    { variant: 'soft', tone: 'amber', class: { root: 'bg-category-amber/20 text-foreground' } },
    { variant: 'soft', tone: 'rose', class: { root: 'bg-category-rose/18 text-foreground' } },
    // outline
    { variant: 'outline', tone: 'neutral', class: { root: 'border-border text-muted-foreground' } },
    { variant: 'outline', tone: 'primary', class: { root: 'border-primary/45 text-primary-text' } },
    { variant: 'outline', tone: 'success', class: { root: 'border-success/45 text-success-text' } },
    { variant: 'outline', tone: 'warning', class: { root: 'border-warning/50 text-warning-text' } },
    { variant: 'outline', tone: 'destructive', class: { root: 'border-destructive/45 text-destructive-text' } },
    { variant: 'outline', tone: 'info', class: { root: 'border-info/45 text-foreground' } },
    { variant: 'outline', tone: 'violet', class: { root: 'border-category-violet/45 text-foreground' } },
    { variant: 'outline', tone: 'cyan', class: { root: 'border-category-cyan/45 text-foreground' } },
    { variant: 'outline', tone: 'amber', class: { root: 'border-category-amber/50 text-foreground' } },
    { variant: 'outline', tone: 'rose', class: { root: 'border-category-rose/45 text-foreground' } },
    // solid — tone fill with its paired foreground. Category tones have no paired
    // foreground that holds contrast in every theme, so solid = a stronger tint.
    { variant: 'solid', tone: 'neutral', class: { root: 'bg-foreground text-background' } },
    { variant: 'solid', tone: 'primary', class: { root: 'bg-primary text-primary-foreground' } },
    { variant: 'solid', tone: 'success', class: { root: 'bg-success text-primary-foreground' } },
    { variant: 'solid', tone: 'warning', class: { root: 'bg-warning text-primary-foreground' } },
    { variant: 'solid', tone: 'destructive', class: { root: 'bg-destructive text-destructive-foreground' } },
    { variant: 'solid', tone: 'info', class: { root: 'bg-info text-background' } },
    { variant: 'solid', tone: 'violet', class: { root: 'bg-category-violet/30 text-foreground', dot: 'bg-category-violet' } },
    { variant: 'solid', tone: 'cyan', class: { root: 'bg-category-cyan/30 text-foreground', dot: 'bg-category-cyan' } },
    { variant: 'solid', tone: 'amber', class: { root: 'bg-category-amber/32 text-foreground', dot: 'bg-category-amber' } },
    { variant: 'solid', tone: 'rose', class: { root: 'bg-category-rose/30 text-foreground', dot: 'bg-category-rose' } },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft', size: 'md', shape: 'rounded' },
});

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export type BadgeTone = NonNullable<BadgeVariantProps['tone']>;
