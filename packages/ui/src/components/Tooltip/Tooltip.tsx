import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { tooltipVariants, type TooltipVariantProps } from './tooltip.variants';

export interface TooltipProviderProps extends BaseTooltip.Provider.Props {
  /** Hover delay before a tooltip opens, in ms. */
  delay?: number;
}

/**
 * Shares the open delay between tooltips: once one is open, neighbours open instantly.
 * Wrap the app (or a toolbar) once.
 */
export function TooltipProvider({ delay = 300, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

/** Tooltip state container (open, defaultOpen, onOpenChange, disabled). Renders no element. */
export const Tooltip = BaseTooltip.Root;
/** The element the tooltip describes. Use `render={<IconButton … />}` to keep the kit element. */
export const TooltipTrigger = BaseTooltip.Trigger;

export interface TooltipContentProps extends Omit<BaseTooltip.Popup.Props, 'className'>, TooltipVariantProps {
  className?: string;
  side?: BaseTooltip.Positioner.Props['side'];
  align?: BaseTooltip.Positioner.Props['align'];
  /** Gap between trigger and tooltip, in px. */
  sideOffset?: BaseTooltip.Positioner.Props['sideOffset'];
  /** Draw the arrow pointing at the trigger. */
  arrow?: boolean;
  /** Keyboard shortcut shown after the label (solid variant). */
  kbd?: string;
  /** Portal container; defaults to document.body. */
  container?: BaseTooltip.Portal.Props['container'];
  children?: ReactNode;
}

/** The floating hint. Opens on hover (after the delay) and on keyboard focus; Escape hides it. */
export function TooltipContent({
  variant,
  side = 'top',
  align = 'center',
  sideOffset = 8,
  arrow = true,
  kbd,
  className,
  container,
  children,
  ...props
}: TooltipContentProps) {
  const v = tooltipVariants({ variant });
  return (
    <BaseTooltip.Portal container={container}>
      <BaseTooltip.Positioner className={v.positioner()} side={side} align={align} sideOffset={sideOffset}>
        <BaseTooltip.Popup role="tooltip" className={cn(v.popup(), className)} {...props}>
          {arrow && <BaseTooltip.Arrow className={v.arrow()} />}
          {children}
          {kbd && <kbd className={v.kbd()}>{kbd}</kbd>}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}

export interface SimpleTooltipProps extends Pick<TooltipContentProps, 'side' | 'align' | 'kbd' | 'variant' | 'arrow' | 'className'> {
  /** Tooltip text or content. */
  content: ReactNode;
  /** The trigger element (a single focusable element, e.g. an IconButton). */
  children: ReactElement;
  /** Hover delay for this trigger, in ms (overrides the provider). */
  delay?: number;
  disabled?: boolean;
}

/** One-liner: `<SimpleTooltip content="Search" kbd="⌘K"><IconButton … /></SimpleTooltip>`. */
export function SimpleTooltip({ content, children, delay, disabled, ...contentProps }: SimpleTooltipProps) {
  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <TooltipContent {...contentProps}>{content}</TooltipContent>
    </BaseTooltip.Root>
  );
}
