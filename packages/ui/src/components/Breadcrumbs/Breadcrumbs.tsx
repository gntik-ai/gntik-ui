import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type ComponentType, type ReactElement, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Link } from '../Link';
import { breadcrumbsVariants, type BreadcrumbsVariantProps } from './breadcrumbs.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

export interface BreadcrumbItem {
  /** Visible text (also the accessible name when `hideLabel` is set). */
  label: string;
  /** Destination. The last item usually has none; it is the current page. */
  href?: string;
  /** Leading icon; with `hideLabel` the item renders icon-only (e.g. Home). */
  icon?: IconComponent;
  /** Show only the icon; the label stays as screen-reader text. */
  hideLabel?: boolean;
  /** Custom element for the link (e.g. a router link); forwarded to Link's `render`. */
  render?: ReactElement;
  /** Monospaced label, for identifiers such as slugs. */
  mono?: boolean;
}

export interface BreadcrumbsProps extends BreadcrumbsVariantProps {
  items: BreadcrumbItem[];
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Accessible name of the nav landmark. */
  'aria-label'?: string;
  /**
   * Collapse the middle items into an ellipsis button when there are more items than this.
   * Keeps the first item and the last `maxItems - 1`. The button expands the full trail in place.
   */
  maxItems?: number;
  /** Accessible name of the ellipsis button; receives the number of hidden items. */
  expandLabel?: (hidden: number) => string;
}

function Separator({ kind, className }: { kind: 'chevron' | 'slash'; className: string }) {
  return (
    <span className={className} aria-hidden>
      {kind === 'chevron' ? <ChevronRight size={14} /> : '/'}
    </span>
  );
}

/**
 * Location trail. A `nav` landmark with an ordered list; the last item is the current page
 * (`aria-current="page"`). Internal links go through the kit Link, so a LinkProvider applies.
 */
export function Breadcrumbs({
  items,
  separator = 'chevron',
  maxItems,
  expandLabel = (n) => `Show ${n} more ${n === 1 ? 'level' : 'levels'}`,
  className,
  ref,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps) {
  const s = breadcrumbsVariants({ separator });
  const [expanded, setExpanded] = useState(false);
  const firstRevealed = useRef<HTMLLIElement>(null);
  const shouldFocus = useRef(false);

  const collapse = !expanded && maxItems != null && maxItems >= 2 && items.length > maxItems;
  const tailCount = collapse ? maxItems - 1 : 0;
  const hiddenCount = collapse ? items.length - 1 - tailCount : 0;

  useEffect(() => {
    if (expanded && shouldFocus.current) {
      shouldFocus.current = false;
      firstRevealed.current?.querySelector<HTMLElement>('a')?.focus();
    }
  }, [expanded]);

  const renderItem = (item: BreadcrumbItem, index: number): ReactNode => {
    const isLast = index === items.length - 1;
    const Icon = item.icon;
    const label = item.hideLabel ? <span className="sr-only">{item.label}</span> : item.label;
    const content = (
      <>
        {Icon && <Icon size={item.hideLabel ? 15 : 14} aria-hidden />}
        {item.mono ? <span className="font-mono">{label}</span> : label}
      </>
    );
    if (isLast || item.href == null) {
      return (
        <span
          className={cn(item.hideLabel ? s.iconLink() : s.current(), !isLast && 'font-normal text-muted-foreground', Icon && !item.hideLabel && 'inline-flex items-center gap-1.5')}
          aria-current={isLast ? 'page' : undefined}
        >
          {content}
        </span>
      );
    }
    return (
      <Link
        href={item.href}
        render={item.render}
        tone="muted"
        underline="none"
        className={cn(item.hideLabel ? s.iconLink() : s.link(), 'font-normal', Icon && !item.hideLabel && 'inline-flex items-center gap-1.5')}
      >
        {content}
      </Link>
    );
  };

  const indexes = items.map((_, i) => i);
  const visible = collapse ? [0, ...indexes.slice(items.length - tailCount)] : indexes;

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn(s.root(), className)}>
      <ol className={s.list()}>
        {visible.map((index, position) => {
          const item = items[index];
          if (!item) return null;
          const showEllipsis = collapse && position === 1;
          return (
            <Fragment key={`${index}-${item.label}`}>
              {showEllipsis && (
                <li className={s.item()}>
                  <button
                    type="button"
                    className={s.ellipsis()}
                    aria-label={expandLabel(hiddenCount)}
                    onClick={() => {
                      shouldFocus.current = true;
                      setExpanded(true);
                    }}
                  >
                    <MoreHorizontal size={16} aria-hidden />
                  </button>
                  <Separator kind={separator} className={s.separator()} />
                </li>
              )}
              <li className={s.item()} ref={expanded && index === 1 ? firstRevealed : undefined}>
                {renderItem(item, index)}
                {index < items.length - 1 && <Separator kind={separator} className={s.separator()} />}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
