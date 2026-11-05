import { tv } from '../../utils/tv';

/**
 * Autocomplete reuses comboboxVariants for its chrome. These slots add what a free-text field
 * needs on top: a destructive border in every variant (the outline input group has no invalid
 * class of its own) and no search-icon inset on the input.
 */
export const autocompleteVariants = tv({
  slots: {
    invalidGroup:
      'data-invalid:border-destructive/70 has-[input[aria-invalid=true]]:border-destructive/70 has-[input[data-invalid]]:border-destructive/70',
    input: 'ps-0',
  },
});
