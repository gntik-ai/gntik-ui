import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { SkipLink } from '../../components/VisuallyHidden';
import { statusLayoutVariants, type StatusLayoutVariantProps } from './status-layout.variants';

export interface StatusLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Short status above the title: "404", "403 · Forbidden", "Maintenance". */
  code?: ReactNode;
  /** The message, rendered as the page `<h1>`. */
  title: ReactNode;
  description?: ReactNode;
  /** Neutral icon in a halo, when there is no illustration. */
  icon?: LucideIcon;
  /** Custom illustration (SVG, image). Decorative unless it carries its own alt text. */
  illustration?: ReactNode;
  /** The way forward (a primary Button). Comes first in tab order. */
  primaryAction?: ReactNode;
  /** Alternative (go back, contact support). */
  secondaryAction?: ReactNode;
  /** Extra content below the actions (search, request id, status list). */
  children?: ReactNode;
  /** Minimal top bar (usually just the Logo). */
  header?: ReactNode;
  /** Bottom line (status page, support, request id). */
  footer?: ReactNode;
  /** Colour of the code and icon halo. Brand green is for positive states only (e.g. "Back online"). */
  tone?: StatusLayoutVariantProps['tone'];
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Full-page status (404 · 403 · 500 · maintenance): a centred message with an illustration or
 * icon, a primary and a secondary action, and minimal chrome. The primary action comes first in
 * the DOM and in tab order.
 */
export function StatusLayout({
  code,
  title,
  description,
  icon: Icon,
  illustration,
  primaryAction,
  secondaryAction,
  children,
  header,
  footer,
  tone,
  mainId = 'main',
  skipLinkLabel = 'Skip to content',
  fullScreen = false,
  className,
  ...props
}: StatusLayoutProps) {
  const s = statusLayoutVariants({ tone, fullScreen });
  return (
    <div className={cn(s.root(), className)} {...props}>
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      {header != null && <header className={s.header()}>{header}</header>}
      <main id={mainId} tabIndex={-1} className={s.main()}>
        <div className={s.content()}>
          {illustration != null ? (
            <div className={s.illustration()}>{illustration}</div>
          ) : (
            Icon && (
              <div className={s.illustration()}>
                <span className={s.iconHalo()}>
                  <Icon size={26} aria-hidden />
                </span>
              </div>
            )
          )}
          {code != null && <p className={s.code()}>{code}</p>}
          <h1 className={s.title()}>{title}</h1>
          {description != null && <p className={s.description()}>{description}</p>}
          {(primaryAction != null || secondaryAction != null) && (
            <div className={s.actions()}>
              {primaryAction}
              {secondaryAction}
            </div>
          )}
          {children != null && <div className={s.extra()}>{children}</div>}
        </div>
      </main>
      {footer != null && <footer className={s.footer()}>{footer}</footer>}
    </div>
  );
}
