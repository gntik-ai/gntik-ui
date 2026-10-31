import { ChevronsUpDown, LogOut, Palette } from 'lucide-react';
import { type ComponentType, type ReactNode } from 'react';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../utils/cn';
import { Avatar, getInitials } from '../Avatar';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../Menu';
import { useThemeOptions, type ThemeOption } from '../ThemeSwitcher/ThemeSwitcher';
import { useI18n } from '../../i18n/I18nProvider';
import { userMenuVariants } from './user-menu.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface UserMenuUser {
  name: string;
  email?: string;
  /** Avatar image URL; initials show while it loads or if it fails. */
  avatarSrc?: string;
}

export interface UserMenuAction {
  label: string;
  icon?: IconComponent;
  /** Renders a link (through LinkProvider) instead of a button item. */
  href?: string;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export type UserMenuEntry = UserMenuAction | 'separator';

export interface UserMenuProps {
  className?: string;
  user: UserMenuUser;
  /** Items between the header and the theme / sign-out section (Profile, Settings…). */
  items?: UserMenuEntry[];
  /** Adds a Theme submenu (radio items bound to useTheme). */
  showTheme?: boolean;
  themeOptions?: ThemeOption[];
  themeLabel?: string;
  /** Adds a destructive "Sign out" item at the end. */
  onSignOut?: () => void;
  signOutLabel?: string;
  /** Show the user's name next to the avatar in the trigger. */
  showName?: boolean;
  /** Full-width name/email trigger for sidebar footers; implies showName. Disable in collapsed rails. */
  showEmail?: boolean;
  /** Accessible name of the trigger. */
  triggerLabel?: string;
  /** Extra content at the end of the menu (before sign out). */
  children?: ReactNode;
}

function ActionItem({ action }: { action: UserMenuAction }) {
  if (action.href !== undefined) {
    return (
      <MenuLinkItem
        href={action.href}
        icon={action.icon}
        shortcut={action.shortcut}
        destructive={action.destructive}
        onClick={action.onSelect}
      >
        {action.label}
      </MenuLinkItem>
    );
  }
  return (
    <MenuItem
      icon={action.icon}
      shortcut={action.shortcut}
      destructive={action.destructive}
      disabled={action.disabled}
      onClick={action.onSelect}
    >
      {action.label}
    </MenuItem>
  );
}

/**
 * Account menu: avatar trigger opening a header (name, email), the given items, an optional
 * Theme submenu wired to useTheme(), and Sign out.
 */
export function UserMenu({
  className,
  user,
  items = [],
  showTheme = true,
  themeOptions: themeOptionsProp,
  themeLabel: themeLabelProp,
  onSignOut,
  signOutLabel: signOutLabelProp,
  showName: showNameProp = false,
  showEmail = false,
  triggerLabel,
  children,
}: UserMenuProps) {
  const { t } = useI18n();
  const themeLabel = themeLabelProp ?? t('theme.label');
  const signOutLabel = signOutLabelProp ?? t('userMenu.signOut');
  const themeOptions = useThemeOptions(themeOptionsProp);
  const { mode, setMode } = useTheme();
  const showName = showNameProp || showEmail;
  const s = userMenuVariants({ showName, showEmail });
  const hasEnd = showTheme || children || onSignOut;
  return (
    <Menu>
      <MenuTrigger
        aria-label={triggerLabel ?? t('userMenu.label', { name: user.name })}
        className={cn(s.trigger(), className)}
      >
        <Avatar src={user.avatarSrc} initials={getInitials(user.name)} size="sm" shape="rounded" />
        {showEmail ? (
          <span className={s.triggerText()}>
            <span className={s.name()}>{user.name}</span>
            {user.email && <span className={s.email()}>{user.email}</span>}
          </span>
        ) : (
          showName && <span className={s.triggerName()}>{user.name}</span>
        )}
        {showEmail && <ChevronsUpDown size={15} aria-hidden className={s.triggerChevron()} />}
      </MenuTrigger>
      <MenuContent align="end" className={s.popup()}>
        <MenuGroup aria-label={user.name}>
          <div className={s.header()}>
            <Avatar src={user.avatarSrc} initials={getInitials(user.name)} size="sm" shape="rounded" tone="accent" />
            <div className={s.headerText()}>
              <div className={s.name()}>{user.name}</div>
              {user.email && <div className={s.email()}>{user.email}</div>}
            </div>
          </div>
        </MenuGroup>
        {items.length > 0 && <MenuSeparator />}
        {items.map((entry, i) =>
          entry === 'separator' ? <MenuSeparator key={`sep-${i}`} /> : <ActionItem key={entry.label} action={entry} />,
        )}
        {hasEnd && <MenuSeparator />}
        {showTheme && (
          <MenuSub>
            <MenuSubTrigger icon={Palette}>{themeLabel}</MenuSubTrigger>
            <MenuSubContent className="min-w-[180px]">
              <MenuRadioGroup value={mode} onValueChange={(v: ThemeMode) => setMode(v)}>
                {themeOptions.map((o) => (
                  <MenuRadioItem key={o.value} value={o.value}>
                    <span className="flex items-center gap-2.5">
                      <o.icon size={15} aria-hidden className="text-muted-foreground" />
                      {o.label}
                    </span>
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuSubContent>
          </MenuSub>
        )}
        {children}
        {onSignOut && (
          <MenuItem icon={LogOut} destructive onClick={onSignOut}>
            {signOutLabel}
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  );
}
