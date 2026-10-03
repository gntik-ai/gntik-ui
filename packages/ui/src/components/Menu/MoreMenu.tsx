import { MoreHorizontal } from 'lucide-react';
import { IconButton, type ButtonProps } from '../Button';
import { useI18n } from '../../i18n/I18nProvider';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, type MenuItemProps } from './Menu';

export interface MoreMenuAction {
  label: string;
  icon?: MenuItemProps['icon'];
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface MoreMenuProps {
  /** Actions in order; the string `'separator'` draws a divider. */
  items: Array<MoreMenuAction | 'separator'>;
  /** Accessible name of the trigger. */
  label?: string;
  /** Trigger style. */
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/** Row-actions shorthand: an icon button with a "more" glyph that opens a menu built from `items`. */
export function MoreMenu({ items, label: labelProp, variant = 'secondary', size = 'md', align = 'end', className }: MoreMenuProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('common.moreActions');
  return (
    <Menu>
      <MenuTrigger render={<IconButton icon={MoreHorizontal} label={label} variant={variant} size={size} className={className} />} />
      <MenuContent align={align}>
        {items.map((item, i) =>
          item === 'separator' ? (
            <MenuSeparator key={`sep-${i}`} />
          ) : (
            <MenuItem
                key={item.label}
                icon={item.icon}
                shortcut={item.shortcut}
                destructive={item.destructive}
                disabled={item.disabled}
                onClick={item.onSelect}
              >
                {item.label}
              </MenuItem>
          ),
        )}
      </MenuContent>
    </Menu>
  );
}
