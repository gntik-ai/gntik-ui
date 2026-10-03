import { tv, type VariantProps } from '../../utils/tv';

/** The announcer region is screen-reader only; it never takes space or colour. */
export const liveAnnouncerVariants = tv({
  base: 'sr-only',
});

export type LiveAnnouncerVariantProps = VariantProps<typeof liveAnnouncerVariants>;
