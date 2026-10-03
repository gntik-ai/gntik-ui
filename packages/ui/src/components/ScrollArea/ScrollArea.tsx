import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { scrollAreaVariants } from './scroll-area.variants';

export interface ScrollAreaProps extends Omit<BaseScrollArea.Root.Props, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Which scrollbars to draw. Default `vertical`. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Draws a bordered card surface around the area. */
  bordered?: boolean;
  /**
   * Accessible name of the scrollable region. When set (or `aria-labelledby`), the viewport becomes a
   * labelled `role="region"`; it joins the Tab order whenever its content overflows.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Class for the viewport (the scroll container). */
  viewportClassName?: string;
  /** Class for the content wrapper inside the viewport (padding goes here). */
  contentClassName?: string;
  viewportRef?: Ref<HTMLDivElement>;
}

/**
 * Native scroll container with thin, token-styled scrollbars that fade in on hover and while
 * scrolling. Overflowing viewports are focusable (Tab), so arrow keys / Page keys scroll natively.
 */
export function ScrollArea({
  orientation = 'vertical',
  bordered,
  className,
  viewportClassName,
  contentClassName,
  viewportRef,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ScrollAreaProps) {
  const s = scrollAreaVariants({ bordered });
  const labelled = ariaLabel != null || ariaLabelledBy != null;
  return (
    <BaseScrollArea.Root className={cn(s.root(), className)} {...props}>
      <BaseScrollArea.Viewport
        ref={viewportRef}
        className={cn(s.viewport(), viewportClassName)}
        {...(labelled ? { role: 'region', 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy } : {})}
      >
        <BaseScrollArea.Content className={cn(s.content(), orientation !== 'vertical' && 'min-w-fit', contentClassName)}>
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {orientation !== 'horizontal' && (
        <BaseScrollArea.Scrollbar orientation="vertical" className={s.scrollbar()}>
          <BaseScrollArea.Thumb className={s.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation !== 'vertical' && (
        <BaseScrollArea.Scrollbar orientation="horizontal" className={s.scrollbar()}>
          <BaseScrollArea.Thumb className={s.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation === 'both' && <BaseScrollArea.Corner className={s.corner()} />}
    </BaseScrollArea.Root>
  );
}
