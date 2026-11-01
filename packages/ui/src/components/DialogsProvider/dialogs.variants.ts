import { tv } from '../../utils/tv';

/** Layout slots of the provider-rendered dialogs; the shells reuse AlertDialog and Dialog styles. */
export const dialogsVariants = tv({
  slots: {
    field: 'mt-4',
    error: 'mt-4',
  },
});
