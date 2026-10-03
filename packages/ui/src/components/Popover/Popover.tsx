import { Popover as BasePopover } from '@base-ui/react/popover';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { popoverVariants, type PopoverVariantProps } from './popover.variants';

const s = popoverVariants();

/** Popover state container (open, defaultOpen, onOpenChange, modal). Renders no element. */
export const Popover = BasePopover.Root;
/** Toggles the popover. Use `render={<Button />}` to style it as a kit button. */
export const PopoverTrigger = BasePopover.Trigger;

export interface PopoverContentProps extends Omit<BasePopover.Popup.Props, 'className'>, PopoverVariantProps {
  className?: string;
  /** Side of the trigger to place the panel on. */
  side?: BasePopover.Positioner.Props['side'];
  /** Alignment along that side. */
  align?: BasePopover.Positioner.Props['align'];
  /** Gap between trigger and panel, in px. */
  sideOffset?: BasePopover.Positioner.Props['sideOffset'];
  alignOffset?: BasePopover.Positioner.Props['alignOffset'];
  /** Draw a small arrow pointing at the trigger. */
  arrow?: boolean;
  /** Portal container; defaults to document.body. */
  container?: BasePopover.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The floating panel: portal, positioner and popup (role `dialog`). Escape or an outside press
 * close it and focus returns to the trigger.
 */
export function PopoverContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset,
  arrow = false,
  padding,
  className,
  container,
  children,
  ...props
}: PopoverContentProps) {
  const dir = usePortalDir();
  const v = popoverVariants({ padding });
  return (
    <BasePopover.Portal container={container}>
      <BasePopover.Positioner dir={dir} className={v.positioner()} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <BasePopover.Popup className={cn(v.popup(), className)} {...props}>
          {arrow && <BasePopover.Arrow className={v.arrow()} />}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export function PopoverTitle({ className, ...props }: Omit<BasePopover.Title.Props, 'className'> & { className?: string }) {
  return <BasePopover.Title className={cn(s.title(), className)} {...props} />;
}

export function PopoverDescription({ className, ...props }: Omit<BasePopover.Description.Props, 'className'> & { className?: string }) {
  return <BasePopover.Description className={cn(s.description(), className)} {...props} />;
}

export interface PopoverCloseProps extends Omit<BasePopover.Close.Props, 'className'> {
  className?: string;
  /** Accessible name when rendered as the default icon button. */
  label?: string;
}

/**
 * Closes the popover. Without children it renders the top-right X icon button; with children
 * (or `render={<Button />}`) it is a plain close action.
 */
export function PopoverClose({ className, label: labelProp, children, ...props }: PopoverCloseProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('common.close');
  if (children !== undefined || props.render) {
    return (
      <BasePopover.Close className={className} {...props}>
        {children}
      </BasePopover.Close>
    );
  }
  return (
    <BasePopover.Close aria-label={label} className={cn(s.close(), className)} {...props}>
      <X size={14} aria-hidden />
    </BasePopover.Close>
  );
}
