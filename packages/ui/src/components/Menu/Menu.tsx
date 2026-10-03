import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Check, ChevronRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { usePortalDir } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { menuVariants } from './menu.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

const s = menuVariants();

/** Menu state container (open, defaultOpen, onOpenChange, modal). Renders no element. */
export const Menu = BaseMenu.Root;
/** Opens the menu. Use `render={<Button />}` or `render={<IconButton … />}` to keep the kit look. */
export const MenuTrigger = BaseMenu.Trigger;
/** Groups items; label it with MenuGroupLabel. */
export const MenuGroup = BaseMenu.Group;
/** Single-choice group (value, defaultValue, onValueChange). */
export const MenuRadioGroup = BaseMenu.RadioGroup;
/** Wraps a MenuSubTrigger and its MenuSubContent. */
export const MenuSub = BaseMenu.SubmenuRoot;

export interface MenuContentProps extends Omit<BaseMenu.Popup.Props, 'className'> {
  className?: string;
  side?: BaseMenu.Positioner.Props['side'];
  align?: BaseMenu.Positioner.Props['align'];
  /** Gap between trigger and menu, in px. */
  sideOffset?: BaseMenu.Positioner.Props['sideOffset'];
  alignOffset?: BaseMenu.Positioner.Props['alignOffset'];
  /** Portal container; defaults to document.body. */
  container?: BaseMenu.Portal.Props['container'];
  children?: ReactNode;
}

/** The floating list (role `menu`): portal, positioner and popup. */
export function MenuContent({ side, align = 'start', sideOffset = 8, alignOffset, className, container, children, ...props }: MenuContentProps) {
  const dir = usePortalDir();
  return (
    <BaseMenu.Portal container={container}>
      <BaseMenu.Positioner dir={dir} className={s.positioner()} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <BaseMenu.Popup className={cn(s.popup(), className)} {...props}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

/** Submenu popup; opens to the inline end of its MenuSubTrigger. */
export function MenuSubContent({ sideOffset = 6, alignOffset = -7, ...props }: MenuContentProps) {
  return <MenuContent sideOffset={sideOffset} alignOffset={alignOffset} {...props} />;
}

export interface MenuItemProps extends Omit<BaseMenu.Item.Props, 'className'> {
  className?: string;
  /** Leading icon (a lucide icon component). */
  icon?: IconComponent;
  /** Shortcut hint shown on the right, e.g. "⌘D". Display only. */
  shortcut?: string;
  /** Danger styling for irreversible actions. */
  destructive?: boolean;
}

/** An action. Enter, Space or a click runs `onClick` and closes the menu. */
export function MenuItem({ icon: IconCmp, shortcut, destructive, className, children, ...props }: MenuItemProps) {
  const v = menuVariants({ destructive });
  return (
    <BaseMenu.Item className={cn(v.item(), className)} {...props}>
      {IconCmp && <IconCmp size={15} aria-hidden className={v.itemIcon()} />}
      <span className={v.itemLabel()}>{children}</span>
      {shortcut && (
        <span aria-hidden className={v.shortcut()}>
          {shortcut}
        </span>
      )}
    </BaseMenu.Item>
  );
}

export interface MenuCheckboxItemProps extends Omit<BaseMenu.CheckboxItem.Props, 'className'> {
  className?: string;
}

/** Toggle item (role `menuitemcheckbox`). Stays open on select so several can be toggled. */
export function MenuCheckboxItem({ className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem className={cn(s.item(), 'group', className)} {...props}>
      <span className={s.checkbox()} aria-hidden>
        <BaseMenu.CheckboxItemIndicator>
          <Check size={12} strokeWidth={2.6} aria-hidden />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className={s.itemLabel()}>{children}</span>
    </BaseMenu.CheckboxItem>
  );
}

export interface MenuRadioItemProps extends Omit<BaseMenu.RadioItem.Props, 'className'> {
  className?: string;
}

/** Single-choice item (role `menuitemradio`) inside a MenuRadioGroup; a check marks the selection. */
export function MenuRadioItem({ className, children, closeOnClick = true, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={cn(s.item(), className)} closeOnClick={closeOnClick} {...props}>
      <span className={s.itemLabel()}>{children}</span>
      <BaseMenu.RadioItemIndicator className={s.radioIndicator()}>
        <Check size={15} aria-hidden />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  );
}

export function MenuGroupLabel({ className, ...props }: Omit<BaseMenu.GroupLabel.Props, 'className'> & { className?: string }) {
  return <BaseMenu.GroupLabel className={cn(s.groupLabel(), className)} {...props} />;
}

export function MenuSeparator({ className, ...props }: Omit<BaseMenu.Separator.Props, 'className'> & { className?: string }) {
  return <BaseMenu.Separator className={cn(s.separator(), className)} {...props} />;
}

export interface MenuSubTriggerProps extends Omit<BaseMenu.SubmenuTrigger.Props, 'className'> {
  className?: string;
  icon?: IconComponent;
}

/** Item that opens a submenu (ArrowRight, Enter or hover). */
export function MenuSubTrigger({ icon: IconCmp, className, children, ...props }: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger className={cn(s.subTrigger(), className)} {...props}>
      {IconCmp && <IconCmp size={15} aria-hidden className={s.itemIcon()} />}
      <span className={s.itemLabel()}>{children}</span>
      <ChevronRight size={14} aria-hidden className={s.subChevron()} />
    </BaseMenu.SubmenuTrigger>
  );
}
