import type { ResponsiveClassTable } from '../../utils/responsive';
import { tv, type VariantProps } from '../../utils/tv';

export const sectionVariants = tv({
  slots: {
    root: 'min-w-0 text-foreground',
    header: 'grid grid-cols-[1fr_auto] items-start gap-x-4',
    title: 'col-start-1 text-[15px] font-semibold tracking-tight text-foreground',
    description: 'col-start-1 mt-0.5 text-[13px] leading-snug text-muted-foreground',
    actions: 'col-start-2 row-span-2 row-start-1 flex shrink-0 items-center gap-2 self-start',
    body: 'flex min-w-0 flex-col',
  },
  variants: {
    variant: {
      plain: {},
      card: { root: 'rounded-xl border border-border bg-card text-card-foreground shadow-sm' },
      muted: { root: 'rounded-xl border border-border bg-secondary/50' },
    },
    padding: {
      none: { root: 'p-0', header: 'mb-3', body: 'gap-4' },
      sm: { root: 'p-4', header: 'mb-3', body: 'gap-3' },
      md: { root: 'p-5', header: 'mb-4', body: 'gap-4' },
      lg: { root: 'p-6 sm:p-8', header: 'mb-5', body: 'gap-5' },
    },
    divided: {
      true: {
        header: 'border-b border-border',
        body: 'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
      },
    },
  },
  compoundVariants: [
    { divided: true, padding: 'none', class: { header: 'pb-3' } },
    { divided: true, padding: 'sm', class: { header: 'pb-3' } },
    { divided: true, padding: 'md', class: { header: 'pb-4' } },
    { divided: true, padding: 'lg', class: { header: 'pb-5' } },
  ],
  defaultVariants: { variant: 'plain', padding: 'none', divided: false },
});

export type SectionVariantProps = VariantProps<typeof sectionVariants>;

/** Named scalar padding steps, also accepted per breakpoint. */
export type SectionPadding = NonNullable<SectionVariantProps['padding']>;

/** Static p classes for responsive Section padding. */
export const SECTION_PADDING: ResponsiveClassTable = {
  base: {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6 sm:p-8',
  },
  sm: {
    none: 'sm:p-0',
    sm: 'sm:p-4',
    md: 'sm:p-5',
    lg: 'sm:p-8',
  },
  md: {
    none: 'md:p-0',
    sm: 'md:p-4',
    md: 'md:p-5',
    lg: 'md:p-8',
  },
  lg: {
    none: 'lg:p-0',
    sm: 'lg:p-4',
    md: 'lg:p-5',
    lg: 'lg:p-8',
  },
  xl: {
    none: 'xl:p-0',
    sm: 'xl:p-4',
    md: 'xl:p-5',
    lg: 'xl:p-8',
  },
  '2xl': {
    none: '2xl:p-0',
    sm: '2xl:p-4',
    md: '2xl:p-5',
    lg: '2xl:p-8',
  },
};

/** Static mb classes for responsive Section padding. */
export const SECTION_HEADER_MARGIN: ResponsiveClassTable = {
  base: {
    none: 'mb-3',
    sm: 'mb-3',
    md: 'mb-4',
    lg: 'mb-5',
  },
  sm: {
    none: 'sm:mb-3',
    sm: 'sm:mb-3',
    md: 'sm:mb-4',
    lg: 'sm:mb-5',
  },
  md: {
    none: 'md:mb-3',
    sm: 'md:mb-3',
    md: 'md:mb-4',
    lg: 'md:mb-5',
  },
  lg: {
    none: 'lg:mb-3',
    sm: 'lg:mb-3',
    md: 'lg:mb-4',
    lg: 'lg:mb-5',
  },
  xl: {
    none: 'xl:mb-3',
    sm: 'xl:mb-3',
    md: 'xl:mb-4',
    lg: 'xl:mb-5',
  },
  '2xl': {
    none: '2xl:mb-3',
    sm: '2xl:mb-3',
    md: '2xl:mb-4',
    lg: '2xl:mb-5',
  },
};

/** Static gap classes for responsive Section padding. */
export const SECTION_BODY_GAP: ResponsiveClassTable = {
  base: {
    none: 'gap-4',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-5',
  },
  sm: {
    none: 'sm:gap-4',
    sm: 'sm:gap-3',
    md: 'sm:gap-4',
    lg: 'sm:gap-5',
  },
  md: {
    none: 'md:gap-4',
    sm: 'md:gap-3',
    md: 'md:gap-4',
    lg: 'md:gap-5',
  },
  lg: {
    none: 'lg:gap-4',
    sm: 'lg:gap-3',
    md: 'lg:gap-4',
    lg: 'lg:gap-5',
  },
  xl: {
    none: 'xl:gap-4',
    sm: 'xl:gap-3',
    md: 'xl:gap-4',
    lg: 'xl:gap-5',
  },
  '2xl': {
    none: '2xl:gap-4',
    sm: '2xl:gap-3',
    md: '2xl:gap-4',
    lg: '2xl:gap-5',
  },
};

/** Static pb classes for responsive Section padding. */
export const SECTION_HEADER_PADDING: ResponsiveClassTable = {
  base: {
    none: 'pb-3',
    sm: 'pb-3',
    md: 'pb-4',
    lg: 'pb-5',
  },
  sm: {
    none: 'sm:pb-3',
    sm: 'sm:pb-3',
    md: 'sm:pb-4',
    lg: 'sm:pb-5',
  },
  md: {
    none: 'md:pb-3',
    sm: 'md:pb-3',
    md: 'md:pb-4',
    lg: 'md:pb-5',
  },
  lg: {
    none: 'lg:pb-3',
    sm: 'lg:pb-3',
    md: 'lg:pb-4',
    lg: 'lg:pb-5',
  },
  xl: {
    none: 'xl:pb-3',
    sm: 'xl:pb-3',
    md: 'xl:pb-4',
    lg: 'xl:pb-5',
  },
  '2xl': {
    none: '2xl:pb-3',
    sm: '2xl:pb-3',
    md: '2xl:pb-4',
    lg: '2xl:pb-5',
  },
};
