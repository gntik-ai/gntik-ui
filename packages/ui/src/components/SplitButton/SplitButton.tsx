import { ChevronDown } from 'lucide-react';
import type { ComponentType, ReactNode, Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button, IconButton, type ButtonProps } from '../Button';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, type MenuContentProps } from '../Menu';
import { splitButtonVariants } from './split-button.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

/** A secondary action in the menu. `separator: true` draws a divider before it. */
export interface SplitButtonAction {
  label: string;
  onSelect?: () => void;
  icon?: IconComponent;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export interface SplitButtonProps extends Omit<ButtonProps, 'iconOnly' | 'ref'> {
  ref?: Ref<HTMLDivElement>;
  /** Secondary actions listed in the menu. */
  actions?: SplitButtonAction[];
  /** Custom menu items (MenuItem, MenuGroup…) instead of, or after, `actions`. */
  menu?: ReactNode;
  /** Accessible name of the menu button. Defaults to "More options". */
  menuLabel?: string;
  /** Disables only the menu button (the primary action follows `disabled`). */
  menuDisabled?: boolean;
  /** Menu placement (default: below, aligned to the end). */
  side?: MenuContentProps['side'];
  align?: MenuContentProps['align'];
  /** Controlled menu state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Name of the wrapping group (optional). */
  'aria-label'?: string;
  /** Classes for the primary Button (`className` goes on the group). */
  buttonClassName?: string;
}

/**
 * A primary action joined to a menu of related actions: two real buttons in a group. The
 * chevron button opens a kit Menu (aria-haspopup="menu", aria-expanded) with arrow-key
 * navigation; variants and sizes match Button, `size: 'auto'` follows the density.
 */
export function SplitButton({
  actions = [],
  menu,
  menuLabel,
  menuDisabled,
  side,
  align = 'end',
  open,
  defaultOpen,
  onOpenChange,
  variant = 'primary',
  size = 'auto',
  disabled,
  loading,
  className,
  buttonClassName,
  children,
  ref,
  'aria-label': groupLabel,
  ...buttonProps
}: SplitButtonProps) {
  const { t } = useI18n();
  const s = splitButtonVariants({ variant: variant ?? 'primary' });
  return (
    <div ref={ref} role="group" aria-label={groupLabel} className={cn(s.root(), className)} data-variant={variant}>
      <Button {...buttonProps} variant={variant} size={size} disabled={disabled} loading={loading} className={cn(s.action(), buttonClassName)}>
        {children}
      </Button>
      <Menu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}>
        <MenuTrigger
          disabled={disabled || menuDisabled}
          render={<IconButton icon={ChevronDown} label={menuLabel ?? t('splitButton.more')} variant={variant} size={size} className={s.trigger()} />}
        />
        <MenuContent side={side} align={align}>
          {actions.map((action, i) => (
            <SplitButtonMenuItem key={`${action.label}-${i}`} action={action} first={i === 0} />
          ))}
          {menu}
        </MenuContent>
      </Menu>
    </div>
  );
}

function SplitButtonMenuItem({ action, first }: { action: SplitButtonAction; first: boolean }) {
  return (
    <>
      {action.separator && !first && <MenuSeparator />}
      <MenuItem icon={action.icon} shortcut={action.shortcut} destructive={action.destructive} disabled={action.disabled} onClick={action.onSelect}>
        {action.label}
      </MenuItem>
    </>
  );
}
