import { Menu as BaseMenu } from '@base-ui/react/menu';
import { LogOut, Palette } from 'lucide-react';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { cn } from '../../utils/cn';
import { Avatar, getInitials } from '../Avatar';
import { useLinkComponent } from '../Link';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  menuVariants,
} from '../Menu';
import { THEME_OPTIONS, type ThemeOption } from '../ThemeSwitcher';
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
  /** Accessible name of the trigger. */
  triggerLabel?: string;
  /** Extra content at the end of the menu (before sign out). */
  children?: ReactNode;
}

function ActionItem({ action }: { action: UserMenuAction }) {
  const RouterLink = useLinkComponent();
  const m = menuVariants({ destructive: action.destructive });
  const IconCmp = action.icon;
  if (action.href !== undefined) {
    return (
      <BaseMenu.LinkItem
        href={action.href}
        closeOnClick
        render={RouterLink ? createElement(RouterLink) : undefined}
        className={cn(m.item(), 'no-underline')}
        onClick={action.onSelect}
      >
        {IconCmp && <IconCmp size={15} aria-hidden className={m.itemIcon()} />}
        <span className={m.itemLabel()}>{action.label}</span>
        {action.shortcut && (
          <span aria-hidden className={m.shortcut()}>
            {action.shortcut}
          </span>
        )}
      </BaseMenu.LinkItem>
    );
  }
  return (
    <MenuItem icon={IconCmp} shortcut={action.shortcut} destructive={action.destructive} disabled={action.disabled} onClick={action.onSelect}>
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
  themeOptions = THEME_OPTIONS,
  themeLabel = 'Theme',
  onSignOut,
  signOutLabel = 'Sign out',
  showName = false,
  triggerLabel,
  children,
}: UserMenuProps) {
  const { mode, setMode } = useTheme();
  const s = userMenuVariants({ showName });
  const hasEnd = showTheme || children || onSignOut;
  return (
    <Menu>
      <MenuTrigger aria-label={triggerLabel ?? `Account menu for ${user.name}`} className={cn(s.trigger(), className)}>
        <Avatar src={user.avatarSrc} initials={getInitials(user.name)} size="sm" shape="rounded" />
        {showName && <span className={s.triggerName()}>{user.name}</span>}
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
        {items.map((entry, i) => (entry === 'separator' ? <MenuSeparator key={`sep-${i}`} /> : <ActionItem key={entry.label} action={entry} />))}
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
