import { tv, type VariantProps } from '../../utils/tv';
import { menuVariants } from '../Menu/menu.variants';

const menu = menuVariants();

/** Context menus reuse the Menu popup and item styles; only the trigger area is new. */
export const contextMenuVariants = tv({
  slots: {
    trigger: [
      'rounded-lg select-none [-webkit-touch-callout:none]',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-popup-open:bg-secondary/40',
    ],
    positioner: menu.positioner(),
    popup: menu.popup(),
  },
});

export type ContextMenuVariantProps = VariantProps<typeof contextMenuVariants>;
