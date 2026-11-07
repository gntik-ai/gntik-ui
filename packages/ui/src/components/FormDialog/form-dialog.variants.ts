import { tv, type VariantProps } from '../../utils/tv';

export const formDialogVariants = tv({
  slots: {
    form: '',
    body: 'grid gap-5',
  },
  variants: {
    variant: {
      dialog: {},
      // The form fills the drawer so the body scrolls and the footer stays fixed.
      drawer: { form: 'flex min-h-0 flex-1 flex-col' },
    },
  },
  defaultVariants: { variant: 'dialog' },
});

export type FormDialogVariantProps = VariantProps<typeof formDialogVariants>;
