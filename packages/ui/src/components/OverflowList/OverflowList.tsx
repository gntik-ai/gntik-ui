import { useRef, type HTMLAttributes, type Key, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { overflowListVariants, type OverflowListVariantProps } from './overflow-list.variants';
import { useFitCount } from './useFitCount';

export interface OverflowListLabels {
  /** Visible text of the chip trigger ("+3 more"); avatars show "+3" and use this as the name. */
  more: (count: number) => string;
  /** Accessible name and heading of the popover ("3 more"). */
  title: (count: number) => string;
}

const DEFAULT_LABELS: OverflowListLabels = {
  more: (n) => `+${n} more`,
  title: (n) => `${n} more`,
};

export interface OverflowListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>, OverflowListVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  items: readonly T[];
  /** Renders one visible item (a chip, an Avatar…). */
  renderItem: (item: T, index: number) => ReactNode;
  /** Renders a hidden item inside the popover; defaults to `renderItem`. */
  renderOverflowItem?: (item: T, index: number) => ReactNode;
  /** Stable key per item; defaults to the index. */
  getKey?: (item: T, index: number) => Key;
  /** Show at most this many items. */
  max?: number;
  /** Also fit to the available width (ResizeObserver); `max` still caps it. */
  responsive?: boolean;
  /** Accessible name of the list (e.g. "Labels"). */
  label?: string;
  /** Built-in strings (English defaults). */
  labels?: Partial<OverflowListLabels>;
}

/**
 * A row of items that stops at `max` (or at the available width with `responsive`) and ends
 * with a "+N more" button that opens a Popover listing the rest. Works for chips and avatars.
 */
export function OverflowList<T>({
  items,
  renderItem,
  renderOverflowItem,
  getKey = (_item, i) => i,
  max,
  responsive = false,
  label,
  labels: labelsProp,
  variant,
  className,
  ...props
}: OverflowListProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const fit = useFitCount(responsive, containerRef, measureRef, items.length);
  const visibleCount = Math.max(0, Math.min(items.length, max ?? Infinity, fit ?? Infinity));
  const hidden = items.slice(visibleCount);
  const s = overflowListVariants({ variant });
  const triggerText = (n: number) => (variant === 'avatar' ? `+${n}` : labels.more(n));

  return (
    <div ref={containerRef} className={cn(s.root(), className)} {...props}>
      <ul aria-label={label} className={s.list()}>
        {items.slice(0, visibleCount).map((item, i) => (
          <li key={getKey(item, i)} className={s.item()}>
            {renderItem(item, i)}
          </li>
        ))}
        {hidden.length > 0 && (
          <li className={s.item()}>
            <Popover>
              <PopoverTrigger className={s.trigger()} aria-label={variant === 'avatar' ? labels.more(hidden.length) : undefined}>
                {triggerText(hidden.length)}
              </PopoverTrigger>
              <PopoverContent padding="none" align="start" aria-label={labels.title(hidden.length)} className={s.popup()}>
                <div aria-hidden className={s.popupTitle()}>
                  {labels.title(hidden.length)}
                </div>
                <ul className={s.popupList()}>
                  {hidden.map((item, j) => {
                    const i = visibleCount + j;
                    return (
                      <li key={getKey(item, i)} className={s.popupItem()}>
                        {(renderOverflowItem ?? renderItem)(item, i)}
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>
          </li>
        )}
      </ul>
      {responsive && (
        <div ref={measureRef} aria-hidden inert className={s.measure()}>
          {items.map((item, i) => (
            <div key={getKey(item, i)} className={s.item()}>
              {renderItem(item, i)}
            </div>
          ))}
          <span className={s.trigger()}>{triggerText(Math.max(1, items.length))}</span>
        </div>
      )}
    </div>
  );
}
