import { Popover as BasePopover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger, type PopoverContentProps } from '../Popover';
import { infoTipVariants, type InfoTipVariantProps } from './info-tip.variants';

export interface InfoTipProps extends InfoTipVariantProps {
  /** What the help is about; names the button "More information about {label}". */
  label: string;
  /** The help text (a sentence or two; links are fine). */
  children: ReactNode;
  /** Optional bold heading inside the panel (also names the dialog). */
  title?: ReactNode;
  /** Also open on hover (after `delay`), not only on click / Enter / Space. */
  openOnHover?: boolean;
  delay?: number;
  side?: PopoverContentProps['side'];
  align?: PopoverContentProps['align'];
  className?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: BasePopover.Root.Props['onOpenChange'];
}

/**
 * Inline "i" help button next to a label or value. Click, Enter or Space opens a small
 * non-modal popover with the explanation; Escape or an outside press close it and focus
 * returns to the button.
 */
export function InfoTip({
  label,
  children,
  title,
  openOnHover = false,
  delay = 200,
  side = 'top',
  align = 'center',
  size,
  className,
  contentClassName,
  ...rootProps
}: InfoTipProps) {
  const s = infoTipVariants({ size });
  return (
    <Popover {...rootProps}>
      <PopoverTrigger
        aria-label={`More information about ${label}`}
        openOnHover={openOnHover}
        delay={delay}
        className={cn(s.trigger(), className)}
      >
        <Info size={size === 'md' ? 16 : 14} aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        arrow
        aria-label={title == null ? label : undefined}
        className={cn(s.content(), contentClassName)}
      >
        {title != null && <PopoverTitle className="mb-1">{title}</PopoverTitle>}
        <div className={s.body()}>{children}</div>
      </PopoverContent>
    </Popover>
  );
}
