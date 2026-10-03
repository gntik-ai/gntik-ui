import { ChevronRight } from 'lucide-react';
import { useId, type HTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { clickableCardVariants } from './choice-card.variants';

const s = clickableCardVariants();

export interface ClickableCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'onClick'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** The card's name — the text of its single link or button. */
  title: ReactNode;
  description?: ReactNode;
  /** Secondary line under the description (badges, counts, a timestamp). */
  meta?: ReactNode;
  /** Leading icon tile (pass a lucide icon with `aria-hidden`). */
  icon?: ReactNode;
  /** Renders the card as a link. */
  href?: string;
  /** Renders the card as a button (or runs alongside `href`). */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Heading element around the title, to fit the page outline; defaults to none. */
  titleAs?: 'h2' | 'h3' | 'h4' | 'span';
  /** Trailing chevron hint. */
  chevron?: boolean;
  disabled?: boolean;
}

/**
 * A card whose whole surface is one link or button. The title holds the only focus target and
 * stretches over the card, so the accessible name stays short and the description is linked
 * with aria-describedby. Extra interactive content inside needs `relative z-10`.
 */
export function ClickableCard({
  title,
  description,
  meta,
  icon,
  href,
  onClick,
  titleAs: Title = 'span',
  chevron = true,
  disabled = false,
  className,
  children,
  ...props
}: ClickableCardProps) {
  const descId = useId();
  const describedBy = description != null ? descId : undefined;
  const action =
    href != null && !disabled ? (
      <a href={href} onClick={onClick} aria-describedby={describedBy} className={cn(s.action(), s.title())}>
        {title}
      </a>
    ) : (
      <button type="button" onClick={onClick} disabled={disabled} aria-describedby={describedBy} className={cn(s.action(), s.title())}>
        {title}
      </button>
    );
  return (
    <div data-disabled={disabled || undefined} className={cn('group/card', s.root(), className)} {...props}>
      {icon != null && <span className={s.icon()}>{icon}</span>}
      <div className={s.body()}>
        <Title className="block">{action}</Title>
        {description != null && (
          <span id={descId} className={s.description()}>
            {description}
          </span>
        )}
        {meta != null && <div className={s.meta()}>{meta}</div>}
        {children}
      </div>
      {chevron && <ChevronRight aria-hidden className={s.chevron()} />}
    </div>
  );
}
