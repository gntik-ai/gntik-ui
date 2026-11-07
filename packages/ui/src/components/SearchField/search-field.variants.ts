import { tv, type VariantProps } from '../../utils/tv';

/** The native input hides the WebKit cancel button, so the kit clear button is the only one in every browser. */
export const searchFieldVariants = tv({
  slots: {
    input: ['[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none'],
  },
});

export type SearchFieldVariantProps = VariantProps<typeof searchFieldVariants>;
