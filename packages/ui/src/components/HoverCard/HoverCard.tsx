import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { hoverCardVariants } from './hover-card.variants';

const s = hoverCardVariants();

/** Hover card state container (open, defaultOpen, onOpenChange). Renders no element. */
export const HoverCard = BasePreviewCard.Root;

export interface HoverCardTriggerProps extends Omit<BasePreviewCard.Trigger.Props, 'className'> {
  className?: string;
}

/**
 * The link that previews its destination. Opens on hover and on keyboard focus after `delay`
 * (default 500 ms); it stays a normal link, so Enter still navigates.
 */
export function HoverCardTrigger({ className, delay = 500, closeDelay = 250, ...props }: HoverCardTriggerProps) {
  return <BasePreviewCard.Trigger delay={delay} closeDelay={closeDelay} className={cn(s.trigger(), className)} {...props} />;
}

export interface HoverCardContentProps extends Omit<BasePreviewCard.Popup.Props, 'className'> {
  className?: string;
  side?: BasePreviewCard.Positioner.Props['side'];
  align?: BasePreviewCard.Positioner.Props['align'];
  /** Gap between trigger and card, in px. */
  sideOffset?: BasePreviewCard.Positioner.Props['sideOffset'];
  /** Draw an arrow pointing at the trigger. */
  arrow?: boolean;
  /** Portal container; defaults to document.body. */
  container?: BasePreviewCard.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The floating preview (a person, project or resource). Supplementary: everything in it must
 * also be reachable at the trigger's destination. Escape closes it.
 */
export function HoverCardContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  arrow = false,
  className,
  container,
  children,
  ...props
}: HoverCardContentProps) {
  return (
    <BasePreviewCard.Portal container={container}>
      <BasePreviewCard.Positioner className={s.positioner()} side={side} align={align} sideOffset={sideOffset}>
        <BasePreviewCard.Popup className={cn(s.popup(), className)} {...props}>
          {arrow && <BasePreviewCard.Arrow className={s.arrow()} />}
          {children}
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
}
