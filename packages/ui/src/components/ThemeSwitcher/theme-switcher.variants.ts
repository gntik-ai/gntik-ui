import { tv, type VariantProps } from '../../utils/tv';

export const themeSwitcherVariants = tv({
  slots: {
    group: '',
    option: 'gap-1.5',
    optionIcon: 'shrink-0',
    cycle: '',
  },
  variants: {
    labels: {
      true: {},
      false: { option: 'px-0' },
    },
  },
  defaultVariants: { labels: true },
});

export type ThemeSwitcherVariantProps = VariantProps<typeof themeSwitcherVariants>;
