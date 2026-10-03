import type { ButtonProps, MoreMenuAction } from '@gntik-ai/ui';
import type { LucideIcon } from '@gntik-ai/icons';

/** A header/toolbar action rendered as a kit Button (or a MoreMenu item when folded). */
export interface PageChromeAction {
  /** Stable key; defaults to `label`. */
  id?: string;
  label: string;
  icon?: LucideIcon;
  /** Button style; when omitted the block picks one (primary for the main action, secondary otherwise). */
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  onClick?: () => void;
}

/** Maps a PageChromeAction to a MoreMenu item (destructive variant → destructive item). */
export function toMenuAction(action: PageChromeAction): MoreMenuAction {
  return {
    label: action.label,
    icon: action.icon,
    disabled: action.disabled,
    destructive: action.variant === 'destructive',
    onSelect: action.onClick,
  };
}
