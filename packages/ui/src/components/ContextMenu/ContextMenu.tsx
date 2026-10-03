import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { contextMenuVariants } from './context-menu.variants';

const s = contextMenuVariants();

/**
 * Context menu state container (open, defaultOpen, onOpenChange, disabled). Renders no element.
 * Items, groups, separators and submenus are the Menu parts (MenuItem, MenuCheckboxItem,
 * MenuRadioGroup, MenuSeparator, MenuSub…), so a context menu and a dropdown look identical.
 */
export const ContextMenu = BaseContextMenu.Root;

export interface ContextMenuTriggerProps extends Omit<BaseContextMenu.Trigger.Props, 'className'> {
  className?: string;
  /**
   * Accessible hint appended to the area's description so keyboard users know the menu exists.
   * Pass `null` to omit it.
   */
  hint?: string | null;
}

function isMenuKey(event: KeyboardEvent<HTMLDivElement>) {
  return event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
}

/**
 * The area that opens the menu: right click, long press (touch) or, when focused,
 * Shift+F10 / the ContextMenu key. Focusable by default (`tabIndex={0}`).
 */
export function ContextMenuTrigger({ className, tabIndex = 0, hint = 'Press Shift+F10 for actions', onKeyDown, children, ...props }: ContextMenuTriggerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event as Parameters<NonNullable<typeof onKeyDown>>[0]);
    if (event.defaultPrevented || !isMenuKey(event)) return;
    // Browsers fire `contextmenu` for these keys inconsistently; open at the area's top-start corner.
    event.preventDefault();
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: rtl ? rect.right - 8 : rect.left + 8,
        clientY: rect.top + 8,
      }),
    );
  }
  return (
    <BaseContextMenu.Trigger className={cn(s.trigger(), className)} tabIndex={tabIndex} onKeyDown={handleKeyDown} {...props}>
      {children}
      {hint && <span className="sr-only"> ({hint})</span>}
    </BaseContextMenu.Trigger>
  );
}

export interface ContextMenuContentProps extends Omit<BaseContextMenu.Popup.Props, 'className'> {
  className?: string;
  /** Portal container; defaults to document.body. */
  container?: BaseContextMenu.Portal.Props['container'];
  children?: ReactNode;
}

/** The floating list (role `menu`) placed at the pointer; same look as MenuContent. */
export function ContextMenuContent({ className, container, children, ...props }: ContextMenuContentProps) {
  return (
    <BaseContextMenu.Portal container={container}>
      <BaseContextMenu.Positioner className={s.positioner()}>
        <BaseContextMenu.Popup className={cn(s.popup(), className)} {...props}>
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
}
