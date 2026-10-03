import type { ButtonProps } from '@gntik-ai/ui';
import type { LucideIcon } from '@gntik-ai/icons';

/** An action rendered as a kit Button, or as a Link when `href` is set. */
export interface FeedbackAction {
  id?: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  onClick?: () => void;
}
