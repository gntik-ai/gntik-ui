import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import type { ComponentType, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { buttonVariants, BUTTON_ICON_SIZE } from '../Button/button.variants';
import { toolbarVariants, type ToolbarVariantProps } from './toolbar.variants';

type IconComponent = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'destructive';

const s = toolbarVariants();

export interface ToolbarProps extends Omit<BaseToolbar.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** `bar` (table/list header), `floating` (bordered group) or `plain`. */
  variant?: ToolbarVariantProps['variant'];
  /** Accessible name; required when the page has more than one toolbar. */
  'aria-label'?: string;
}

/**
 * A row of controls with one Tab stop: arrow keys move focus between items (roving tabindex),
 * Tab leaves the toolbar. Items can sit inside ToolbarStart / ToolbarCenter / ToolbarEnd lanes.
 */
export function Toolbar({ variant, className, ...props }: ToolbarProps) {
  return <BaseToolbar.Root className={cn(toolbarVariants({ variant }).root(), className)} {...props} />;
}

type LaneProps = HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> };

/** Left-aligned lane (search, filters). */
export function ToolbarStart({ className, ...props }: LaneProps) {
  return <div className={cn(toolbarVariants({ lane: 'start' }).lane(), className)} {...props} />;
}
/** Centered lane (titles, pagers). */
export function ToolbarCenter({ className, ...props }: LaneProps) {
  return <div className={cn(toolbarVariants({ lane: 'center' }).lane(), className)} {...props} />;
}
/** Right-aligned lane (primary action). */
export function ToolbarEnd({ className, ...props }: LaneProps) {
  return <div className={cn(toolbarVariants({ lane: 'end' }).lane(), className)} {...props} />;
}

export interface ToolbarButtonProps extends Omit<BaseToolbar.Button.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Kit button variant. */
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  /** Leading icon. Without children the button is icon-only: pass `aria-label`. */
  icon?: IconComponent;
  children?: ReactNode;
}

/** A toolbar item styled as a kit Button (ghost, small by default). Stays focusable when disabled. */
export function ToolbarButton({ variant = 'ghost', size = 'sm', icon: IconCmp, className, children, ...props }: ToolbarButtonProps) {
  const iconOnly = children == null;
  return (
    <BaseToolbar.Button className={cn(buttonVariants({ variant, size, iconOnly }), className)} {...props}>
      {IconCmp && <IconCmp size={BUTTON_ICON_SIZE[size]} aria-hidden />}
      {children}
    </BaseToolbar.Button>
  );
}

export interface ToolbarGroupProps extends Omit<BaseToolbar.Group.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Groups related items; `disabled` disables all of them. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <BaseToolbar.Group className={cn(s.group(), className)} {...props} />;
}

export interface ToolbarSeparatorProps extends Omit<BaseToolbar.Separator.Props, 'className'> {
  className?: string;
}

/** Thin divider between groups (role="separator", perpendicular to the toolbar). */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return <BaseToolbar.Separator className={cn(s.separator(), className)} {...props} />;
}

export interface ToolbarLinkProps extends Omit<BaseToolbar.Link.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLAnchorElement>;
}

/** A link inside the toolbar, in brand green. */
export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return <BaseToolbar.Link className={cn(s.link(), className)} {...props} />;
}

export interface ToolbarInputProps extends Omit<BaseToolbar.Input.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLInputElement>;
  /** Leading icon inside the field (e.g. Search). */
  icon?: IconComponent;
  /** Class for the wrapper that sizes the field. */
  wrapperClassName?: string;
}

/** A text field inside the toolbar. ArrowLeft/Right move the caret; at the edges they move to the next item. */
export function ToolbarInput({ icon: IconCmp, className, wrapperClassName, ...props }: ToolbarInputProps) {
  return (
    <div className={cn(s.inputWrap(), wrapperClassName)}>
      {IconCmp && <IconCmp size={14} className={s.inputIcon()} aria-hidden />}
      <BaseToolbar.Input className={cn(s.input(), IconCmp && 'pl-8', className)} {...props} />
    </div>
  );
}
