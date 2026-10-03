import { tv, type VariantProps } from '../../utils/tv';

export const mobileNavVariants = tv({
  slots: {
    popup: 'bg-chrome',
    header: 'px-4',
    title: 'flex items-center gap-2',
    body: 'px-3 py-3',
    footer: 'justify-start px-3 py-3',
  },
});

export type MobileNavVariantProps = VariantProps<typeof mobileNavVariants>;
